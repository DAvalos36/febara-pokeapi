import { NextResponse } from "next/server";

import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

export async function GET() {
  const session = await currentUser();

  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const teams = await db.team.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      members: { include: { capture: true }, orderBy: { slot: "asc" } },
    },
  });

  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const session = await currentUser();

  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = (body as { name?: unknown })?.name;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "El equipo necesita un nombre" },
      { status: 400 },
    );
  }

  const team = await db.team.create({
    data: { userId: session.userId, name: name.trim().slice(0, 60) },
    include: { members: { include: { capture: true } } },
  });

  return NextResponse.json(team, { status: 201 });
}
