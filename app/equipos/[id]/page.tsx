import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { TeamEditor } from "@/components/team-editor";
import type { TeamPokemon } from "@/components/team-editor";
import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { getPokemon, getTypeChart } from "@/lib/pokeapi";

export default async function EquipoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await currentUser();

  if (!session) redirect("/login");

  const { id } = await params;

  const team = await db.team.findFirst({
    where: { id, userId: session.userId },
    include: { members: { orderBy: { slot: "asc" } } },
  });

  if (!team) notFound();

  const [chart, members] = await Promise.all([
    getTypeChart(),
    Promise.all(
      team.members.map(async (member): Promise<TeamPokemon> => {
        const pokemon = await getPokemon(member.pokemonId);

        return {
          pokemonId: member.pokemonId,
          name: member.name,
          nickname: member.nickname,
          sprite: pokemon.sprite,
          types: pokemon.types,
        };
      }),
    ),
  ]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link className="text-sm text-accent" href="/equipos">
          ← Equipos
        </Link>
        <h1 className="text-2xl font-semibold">{team.name}</h1>
      </header>

      <TeamEditor chart={chart} initialMembers={members} teamId={team.id} />
    </section>
  );
}
