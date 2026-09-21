import { NextResponse } from "next/server";

import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { getPokemon } from "@/lib/pokeapi";

export async function GET() {
  const session = await currentUser();

  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const captures = await db.capture.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(captures);
}

export async function POST(request: Request) {
  const session = await currentUser();

  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const pokemonId = Number((body as { pokemonId?: unknown })?.pokemonId);

  if (!Number.isInteger(pokemonId) || pokemonId < 1) {
    return NextResponse.json({ error: "pokemonId inválido" }, { status: 400 });
  }

  const pokemon = await getPokemon(pokemonId).catch(() => null);

  if (!pokemon) {
    return NextResponse.json(
      { error: "Ese Pokémon no existe" },
      { status: 404 },
    );
  }

  const nickname = (body as { nickname?: unknown })?.nickname;
  const notes = (body as { notes?: unknown })?.notes;

  const capture = await db.capture
    .create({
      data: {
        userId: session.userId,
        pokemonId: pokemon.id,
        name: pokemon.name,
        nickname:
          typeof nickname === "string" && nickname.trim()
            ? nickname.trim()
            : null,
        notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      },
    })
    .catch(() => null);

  if (!capture) {
    return NextResponse.json(
      { error: "Ya está en tu colección" },
      { status: 409 },
    );
  }

  return NextResponse.json(capture, { status: 201 });
}
