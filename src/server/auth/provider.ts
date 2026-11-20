import "server-only";

import { createHash } from "node:crypto";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";
import { isSecureRequest } from "./request";
import { sessionSecret } from "./session";

/**
 * Account sign-in for the admin and invited clients, behind one interface.
 *
 * - `supabase`: Supabase Auth with emailed one-time codes. Public sign-up is
 *   off; users exist only because the admin allowlist or an invite created them.
 * - `dev`: for local development and automated tests only. Any allowed email
 *   signs in with the fixed code below and no email is sent. `src/lib/env.ts`
 *   refuses this driver on Vercel.
 */

/** A signed-in account. */
export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthProvider {
  /** The verified user for this request, or null. */
  getUser(): Promise<AuthUser | null>;
  /** Sends a one-time code to an address that already has an account. Throws when it cannot. */
  requestCode(email: string): Promise<void>;
  /** Exchanges a code for a session. Returns false when the code is wrong or expired. */
  verifyCode(email: string, code: string): Promise<boolean>;
  signOut(): Promise<void>;
  /** Returns the account for an address, creating it if needed. Used for the admin and invites. */
  ensureUser(email: string): Promise<AuthUser>;
}

// ── Supabase ────────────────────────────────────────────────────────────────

function supabaseConfig() {
  const env = getEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase Auth is not configured.");
  }
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    key: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    secret: env.SUPABASE_SECRET_KEY,
  };
}

/** A Supabase client bound to this request's cookies. Used for Auth only, never for data. */
async function supabaseServer() {
  const { url, key } = supabaseConfig();
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server components cannot set cookies. The proxy refreshes sessions instead.
        }
      },
    },
  });
}

/** A Supabase client with the secret key, for creating invited users. Never sent to a browser. */
function supabaseAdmin() {
  const { url, secret } = supabaseConfig();
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set.");
  return createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
}

const USERS_PER_PAGE = 200;
const MAX_USER_PAGES = 25;

const supabaseProvider: AuthProvider = {
  async getUser() {
    const supabase = await supabaseServer();
    // getUser() validates the session with the Auth server, unlike getSession().
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    // An address counts only once Supabase has confirmed it, so an account
    // registered for someone else's address (should sign-ups ever be left on)
    // carries no rights here.
    if (!user?.email || !user.email_confirmed_at) return null;
    return { id: user.id, email: user.email.toLowerCase() };
  },
  async requestCode(email) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) throw error;
  },
  async verifyCode(email, code) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    return !error && Boolean(data.user);
  },
  async signOut() {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  },
  async ensureUser(email) {
    const admin = supabaseAdmin();
    const created = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (created.data.user) return { id: created.data.user.id, email };
    // Already registered: find the existing account.
    for (let page = 1; page <= MAX_USER_PAGES; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: USERS_PER_PAGE });
      if (error) throw error;
      const match = data.users.find((user) => user.email?.toLowerCase() === email);
      if (match) return { id: match.id, email };
      if (data.users.length < USERS_PER_PAGE) break;
    }
    throw created.error ?? new Error(`Could not create or find a user for ${email}`);
  },
};

// ── Development ─────────────────────────────────────────────────────────────

/** The code every address signs in with under `AUTH_DRIVER=dev`. */
export const DEV_SIGN_IN_CODE = "000000";
const DEV_COOKIE = "dev-session";
const DEV_SESSION_SECONDS = 7 * 24 * 60 * 60;

/** A stable UUID derived from an email, standing in for a Supabase user id. */
export function devUserId(email: string): string {
  const hex = createHash("sha256").update(email.toLowerCase()).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const devProvider: AuthProvider = {
  async getUser() {
    const token = (await cookies()).get(DEV_COOKIE)?.value;
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ["HS256"] });
      return typeof payload.email === "string"
        ? { id: devUserId(payload.email), email: payload.email }
        : null;
    } catch {
      return null;
    }
  },
  async requestCode() {
    // No email is sent. The code is DEV_SIGN_IN_CODE.
  },
  async verifyCode(email, code) {
    if (code !== DEV_SIGN_IN_CODE) return false;
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(`${DEV_SESSION_SECONDS}s`)
      .sign(sessionSecret());
    (await cookies()).set(DEV_COOKIE, token, {
      httpOnly: true,
      secure: await isSecureRequest(),
      sameSite: "lax",
      path: "/",
      maxAge: DEV_SESSION_SECONDS,
    });
    return true;
  },
  async signOut() {
    (await cookies()).delete(DEV_COOKIE);
  },
  async ensureUser(email) {
    return { id: devUserId(email), email };
  },
};

/** The configured sign-in provider. */
export function getAuthProvider(): AuthProvider {
  return getEnv().AUTH_DRIVER === "dev" ? devProvider : supabaseProvider;
}
