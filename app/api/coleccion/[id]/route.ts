import { NextResponse } from "next/server";

import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const session = await currentUser();

  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const nickname = (body as { nickname?: unknown })?.nickname;
  const notes = (body as { notes?: unknown })?.notes;

  const updated = await db.capture
    .update({
      where: { id, userId: session.userId },
      data: {
        ...(typeof nickname === "string"
          ? { nickname: nickname.trim() || null }
          : {}),
        ...(typeof notes === "string" ? { notes: notes.trim() || null } : {}),
      },
    })
    .catch(() => null);

  if (!updated)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await currentUser();

  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const deleted = await db.capture
    .deleteMany({ where: { id, userId: session.userId } })
    .catch(() => null);

  if (!deleted?.count)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
