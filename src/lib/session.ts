// Sesión en cookie httpOnly con un token firmado (HMAC-SHA256): "idUsuario.expira.firma".
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "polistore_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEV_SECRET = randomBytes(32).toString("hex");

function secret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") throw new Error("Falta la variable SESSION_SECRET");
  return DEV_SECRET;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function createToken(userId: number, now = Date.now()): string {
  const payload = `${userId}.${now + MAX_AGE_SECONDS * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function readToken(token: string | undefined, now = Date.now()): number | null {
  const [userId, expires, signature = ""] = token?.split(".") ?? [];
  const expected = Buffer.from(sign(`${userId}.${expires}`));
  const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), expected);
  return valid && Number(expires) > now ? Number(userId) : null;
}

export async function getSessionUserId(): Promise<number | null> {
  return readToken((await cookies()).get(COOKIE)?.value);
}

export async function startSession(userId: number): Promise<void> {
  (await cookies()).set(COOKIE, createToken(userId), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
