import { NextResponse } from "next/server";

import { currentUser } from "@/lib/current-user";
import { listPokemon, searchPokemon } from "@/lib/pokeapi";

export async function GET(request: Request) {
  const session = await currentUser();

  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const term = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  const results = term
    ? await searchPokemon(term, 12)
    : await listPokemon(12).then((page) => page.results);

  return NextResponse.json(results);
}
