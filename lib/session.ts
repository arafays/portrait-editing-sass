import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "portrait_session";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.APP_PASSWORD;
  if (!secret) {
    throw new Error("SESSION_SECRET or APP_PASSWORD must be set");
  }
  return secret;
}

export function createSessionToken(): string {
  return createHmac("sha256", getSecret())
    .update("authenticated")
    .digest("hex");
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const expected = createSessionToken();
  const provided = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  if (provided.length !== expectedBuffer.length) return false;
  return timingSafeEqual(provided, expectedBuffer);
}
