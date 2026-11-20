"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { adminEmails } from "@/lib/env";
import { requirePrivateArea } from "@/server/auth/access";
import { getAuthProvider } from "@/server/auth/provider";
import { getRequestInfo } from "@/server/auth/request";
import { isInvitedEmail } from "@/server/dal/galleries";
import { consumeAttempt, SIGN_IN_EMAIL_RULE, SIGN_IN_RULE } from "@/server/rate-limit";

import { emailSchema, parseForm } from "./shared";

/**
 * Email one-time-code sign-in for the admin and invited clients. There is no
 * public sign-up: a code is only sent to an address on the admin allowlist or
 * one the admin has invited, and the response is the same either way.
 */

export interface SignInState {
  step: "email" | "code";
  email?: string;
  error?: string;
}

const destinationSchema = z.enum(["admin", "clients"]);
const DESTINATIONS = { admin: "/admin", clients: "/clients" } as const;
const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";

/** Step one: send a code if the address is allowed to sign in. */
export async function requestSignInCode(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  requirePrivateArea();
  const parsed = parseForm(z.object({ email: emailSchema }), formData);
  if (!parsed.ok) return { step: "email", error: "Enter a valid email address." };
  const { email } = parsed.data;

  const request = await getRequestInfo();
  const rateKey = `signin:${request.ipHash}`;
  if (!(await consumeAttempt(rateKey, SIGN_IN_RULE))) return { step: "email", error: TOO_MANY };

  const provider = getAuthProvider();
  try {
    if (adminEmails().includes(email)) {
      // The admin account is created on first sign-in rather than by public
      // sign-up. Only when no account exists yet is it created.
      try {
        await provider.requestCode(email);
      } catch {
        await provider.ensureUser(email);
        await provider.requestCode(email);
      }
    } else if (await isInvitedEmail(email)) {
      await provider.requestCode(email);
    }
  } catch (error) {
    console.error("Sign-in code request failed", error);
  }
  // Same answer for every address, so this form cannot be used to find accounts.
  return { step: "code", email };
}

/** Step two: exchange the code for a session. */
export async function verifySignInCode(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  requirePrivateArea();
  const parsed = parseForm(
    z.object({
      email: emailSchema,
      code: z
        .string()
        .trim()
        .regex(/^\d{6,10}$/),
      destination: destinationSchema,
    }),
    formData,
  );
  if (!parsed.ok)
    return {
      step: "code",
      email: String(formData.get("email") ?? ""),
      error: "Enter the code from the email.",
    };
  const { email, code, destination } = parsed.data;

  const request = await getRequestInfo();
  const rateKey = `signin-verify:${request.ipHash}`;
  // Counted before the code is checked, per visitor and per address, so
  // neither parallel requests nor many addresses can guess a code.
  const [visitorOk, emailOk] = await Promise.all([
    consumeAttempt(rateKey, SIGN_IN_RULE),
    consumeAttempt(`signin-verify-email:${email}`, SIGN_IN_EMAIL_RULE),
  ]);
  if (!visitorOk || !emailOk) return { step: "code", email, error: TOO_MANY };

  const ok = await getAuthProvider().verifyCode(email, code);
  if (!ok) {
    return { step: "code", email, error: "That code is not right or has expired." };
  }
  redirect(DESTINATIONS[destination]);
}

/** Ends the account session. */
export async function signOut(formData: FormData): Promise<void> {
  const destination = destinationSchema.catch("clients").parse(formData.get("destination"));
  await getAuthProvider().signOut();
  redirect(destination === "admin" ? "/admin/sign-in" : "/clients");
}
