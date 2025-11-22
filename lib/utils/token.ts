import { randomBytes } from "crypto";

/**
 * Generate a secure random token for guest submission links
 */
export function generateGuestToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate a submission URL for a guest
 */
export function getSubmissionUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/submit/${token}`;
}
