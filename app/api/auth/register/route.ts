import { NextResponse } from "next/server";

import { parseCredentials } from "@/lib/credentials";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSessionToken, sessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const parsed = parseCredentials(await request.json().catch(() => null));

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: parsed.email } });

  if (existing) {
    return NextResponse.json(
      { error: "Ese correo ya está registrado" },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      email: parsed.email,
      passwordHash: await hashPassword(parsed.password),
    },
  });

  const response = NextResponse.json({ email: user.email });

  response.cookies.set(
    sessionCookie.name,
    await createSessionToken({ userId: user.id, email: user.email }),
    sessionCookie.options,
  );

  return response;
}
