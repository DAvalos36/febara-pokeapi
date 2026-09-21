import { NextResponse } from "next/server";

import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

export const MAX_TEAM_SIZE = 6;

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  const session = await currentUser();

  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const team = await db.team.findFirst({
    where: { id, userId: session.userId },
  });

  if (!team)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const name = (body as { name?: unknown })?.name;
  const captureIds = (body as { captureIds?: unknown })?.captureIds;

  if (captureIds !== undefined) {
    if (
      !Array.isArray(captureIds) ||
      captureIds.some((value) => typeof value !== "string")
    ) {
      return NextResponse.json(
        { error: "captureIds inválido" },
        { status: 400 },
      );
    }

    if (captureIds.length > MAX_TEAM_SIZE) {
      return NextResponse.json(
        { error: `Un equipo admite como máximo ${MAX_TEAM_SIZE} Pokémon` },
        { status: 400 },
      );
    }

    if (new Set(captureIds).size !== captureIds.length) {
      return NextResponse.json(
        { error: "No repitas el mismo Pokémon" },
        { status: 400 },
      );
    }

    const owned = await db.capture.count({
      where: { id: { in: captureIds as string[] }, userId: session.userId },
    });

    if (owned !== captureIds.length) {
      return NextResponse.json(
        { error: "Algún Pokémon no es tuyo" },
        { status: 400 },
      );
    }
  }

  const updated = await db.$transaction(async (tx) => {
    if (typeof name === "string" && name.trim()) {
      await tx.team.update({
        where: { id },
        data: { name: name.trim().slice(0, 60) },
      });
    }

    if (Array.isArray(captureIds)) {
      await tx.teamMember.deleteMany({ where: { teamId: id } });
      await tx.teamMember.createMany({
        data: (captureIds as string[]).map((captureId, slot) => ({
          teamId: id,
          captureId,
          slot,
        })),
      });
    }

    return tx.team.findUnique({
      where: { id },
      include: {
        members: { include: { capture: true }, orderBy: { slot: "asc" } },
      },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await currentUser();

  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const deleted = await db.team.deleteMany({
    where: { id, userId: session.userId },
  });

  if (!deleted.count)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
