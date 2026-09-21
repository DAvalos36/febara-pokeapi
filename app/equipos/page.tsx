import { Card } from "@heroui/react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateTeamForm } from "@/components/create-team-form";
import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

export const metadata = { title: "Equipos" };

export default async function EquiposPage() {
  const session = await currentUser();

  if (!session) redirect("/login");

  const teams = await db.team.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { members: { orderBy: { slot: "asc" } } },
  });

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Equipos</h1>
        <p className="text-muted">
          Arma equipos de 6 con los Pokémon de tu colección y revisa sus debilidades.
        </p>
      </header>

      <CreateTeamForm />

      {teams.length === 0 ? (
        <p className="text-muted">Todavía no tienes ningún equipo.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <li key={team.id}>
              <Link href={`/equipos/${team.id}`}>
                <Card className="h-full transition-colors hover:border-accent">
                  <Card.Header>
                    <Card.Title>{team.name}</Card.Title>
                    <Card.Description>{team.members.length}/6 Pokémon</Card.Description>
                  </Card.Header>
                  <Card.Content className="flex flex-wrap gap-1">
                    {team.members.map((member) => (
                      <span key={member.id} className="text-xs capitalize text-muted">
                        {member.nickname ?? member.name}
                      </span>
                    ))}
                  </Card.Content>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
