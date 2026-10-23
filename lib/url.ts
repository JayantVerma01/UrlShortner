import { randomInt } from "node:crypto";

export const MAX_URL_LENGTH = 2048;
export const CODE_LENGTH = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export type UrlValidation = { ok: true; url: string } | { ok: false; error: string };

export function validateUrl(input: unknown): UrlValidation {
  if (typeof input !== "string") return { ok: false, error: "A URL is required." };
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Please enter a URL." };
  if (trimmed.length > MAX_URL_LENGTH) {
    return { ok: false, error: `URL is too long (max ${MAX_URL_LENGTH} characters).` };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL. Include http:// or https://." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http:// and https:// URLs are supported." };
  }
  return { ok: true, url: trimmed };
}

// randomInt is uniform over [0, max), so there is no modulo bias.
export function generateShortCode(length = CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return code;
}

export function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}
