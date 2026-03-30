import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[email] RESEND_API_KEY is not set — emails will not be sent");
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? "");

/**
 * Resend Audience ID for the main broadcast list.
 * Create this in the Resend dashboard and set the env var.
 */
export const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";

/**
 * Verified sender address — must match a verified domain in Resend.
 * Format: "Brand Name <email@domain.com>"
 */
export const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ?? "Stridify <hello@mail.stridify.app>";
