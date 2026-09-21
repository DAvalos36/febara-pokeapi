import { Card, Chip, EmptyState, Label, Meter } from "@heroui/react";
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
        <EmptyState>
          <p className="font-medium">Sin equipos</p>
          <p className="text-sm text-muted">Crea uno arriba para empezar a armarlo.</p>
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <li key={team.id}>
              <Link href={`/equipos/${team.id}`}>
                <Card className="h-full transition-colors hover:border-accent">
                  <Card.Header>
                    <Card.Title>{team.name}</Card.Title>
                  </Card.Header>
                  <Card.Content className="flex flex-col gap-3">
                    <Meter maxValue={6} value={team.members.length}>
                      <Label className="text-sm text-muted">Pokémon</Label>
                      <Meter.Output className="text-sm tabular-nums">
                        {team.members.length}/6
                      </Meter.Output>
                      <Meter.Track>
                        <Meter.Fill />
                      </Meter.Track>
                    </Meter>

                    {team.members.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {team.members.map((member) => (
                          <Chip key={member.id} className="capitalize" size="sm" variant="soft">
                            {member.nickname ?? member.name}
                          </Chip>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted">Equipo vacío</span>
                    )}
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
