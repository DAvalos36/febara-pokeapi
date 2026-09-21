import { SignJWT, jwtVerify } from "jose";

const AUDIENCE = "pokeapi-febara-mcp";
const LIFETIME = "90d";

function secret() {
  const value = process.env.AUTH_SECRET;

  if (!value) throw new Error("Falta la variable de entorno AUTH_SECRET");

  return new TextEncoder().encode(value);
}

export async function createMcpToken(userId: string, email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(LIFETIME)
    .sign(secret());
}

export async function verifyMcpToken(token: string | undefined) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<{ email: string }>(token, secret(), {
      audience: AUDIENCE,
    });

    return payload.sub ? { userId: payload.sub, email: payload.email } : null;
  } catch {
    return null;
  }
}
