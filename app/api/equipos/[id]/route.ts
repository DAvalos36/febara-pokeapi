import { NextResponse } from "next/server";

import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { getPokemon } from "@/lib/pokeapi";

export const MAX_TEAM_SIZE = 6;

type Context = { params: Promise<{ id: string }> };

type MemberInput = { pokemonId: number; nickname?: string | null };

function parseMembers(value: unknown): MemberInput[] | string {
  if (!Array.isArray(value)) return "members inválido";

  if (value.length > MAX_TEAM_SIZE) {
    return `Un equipo admite como máximo ${MAX_TEAM_SIZE} Pokémon`;
  }

  const members: MemberInput[] = [];

  for (const entry of value) {
    const pokemonId = Number((entry as { pokemonId?: unknown })?.pokemonId);

    if (!Number.isInteger(pokemonId) || pokemonId < 1) return "pokemonId inválido";

    const nickname = (entry as { nickname?: unknown })?.nickname;

    members.push({
      pokemonId,
      nickname: typeof nickname === "string" && nickname.trim() ? nickname.trim() : null,
    });
  }

  if (new Set(members.map((entry) => entry.pokemonId)).size !== members.length) {
    return "No repitas el mismo Pokémon";
  }

  return members;
}

export async function PUT(request: Request, { params }: Context) {
  const session = await currentUser();

  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const team = await db.team.findFirst({ where: { id, userId: session.userId } });

  if (!team) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const name = (body as { name?: unknown })?.name;
  const rawMembers = (body as { members?: unknown })?.members;

  let members: MemberInput[] | null = null;

  if (rawMembers !== undefined) {
    const parsed = parseMembers(rawMembers);

    if (typeof parsed === "string") {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    members = parsed;
  }

  const resolved = members
    ? await Promise.all(members.map((entry) => getPokemon(entry.pokemonId).catch(() => null)))
    : [];

  if (resolved.some((pokemon) => pokemon === null)) {
    return NextResponse.json({ error: "Algún Pokémon no existe" }, { status: 404 });
  }

  const updated = await db.$transaction(async (tx) => {
    if (typeof name === "string" && name.trim()) {
      await tx.team.update({ where: { id }, data: { name: name.trim().slice(0, 60) } });
    }

    if (members) {
      await tx.teamMember.deleteMany({ where: { teamId: id } });
      await tx.teamMember.createMany({
        data: members.map((entry, slot) => ({
          teamId: id,
          slot,
          pokemonId: entry.pokemonId,
          name: resolved[slot]!.name,
          nickname: entry.nickname,
        })),
      });
    }

    return tx.team.findUnique({
      where: { id },
      include: { members: { orderBy: { slot: "asc" } } },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await currentUser();

  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const deleted = await db.team.deleteMany({ where: { id, userId: session.userId } });

  if (!deleted.count) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
