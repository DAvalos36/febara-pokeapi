import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "pokedex_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET;

  if (!value) throw new Error("Falta la variable de entorno AUTH_SECRET");

  return new TextEncoder().encode(value);
}

export type SessionPayload = { userId: string; email: string };

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secret());

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  },
};
