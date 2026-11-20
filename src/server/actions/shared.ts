import "server-only";

import { z } from "zod";

/** The state every form action returns to `useActionState`. */
export interface FormState {
  error?: string;
  message?: string;
}

/** Parses form data with a Zod schema, returning the first problem as a message. */
export function parseForm<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): { ok: true; data: z.output<T> } | { ok: false; error: string } {
  const result = schema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success) return { ok: true, data: result.data };
  const issue = result.error.issues[0];
  return {
    ok: false,
    error: issue ? `${issue.path.join(".") || "Form"}: ${issue.message}` : "Invalid input",
  };
}

/** HTML checkboxes submit "on" when ticked and nothing otherwise. */
export const checkbox = z
  .string()
  .optional()
  .transform((value) => value === "on" || value === "true");

/** An optional `<input type="date">` value as a Date at the end of that day (UTC), or null. */
export const optionalDate = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(`${value}T23:59:59Z`) : null))
  .refine((value) => value === null || !Number.isNaN(value.getTime()), "Invalid date");

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, digits and dashes");

export const uuidSchema = z.uuid();
export const emailSchema = z.email().trim().toLowerCase().max(254);
export const passcodeSchema = z.string().trim().min(1).max(200);
