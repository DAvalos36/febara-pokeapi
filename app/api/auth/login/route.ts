import { NextResponse } from "next/server";

import { parseCredentials } from "@/lib/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const parsed = parseCredentials(await request.json().catch(() => null));

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.email } });
  const valid =
    user && (await verifyPassword(parsed.password, user.passwordHash));

  if (!user || !valid) {
    return NextResponse.json(
      { error: "Credenciales incorrectas" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ email: user.email });

  response.cookies.set(
    sessionCookie.name,
    await createSessionToken({ userId: user.id, email: user.email }),
    sessionCookie.options,
  );

  return response;
}
