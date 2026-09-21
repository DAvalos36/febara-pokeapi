"use client";

import { Alert, Button, Card, Chip, EmptyState, Form, Input, Label, TextField } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { TypeBadge } from "@/components/type-badge";
import { coverageGaps, teamCoverage } from "@/lib/coverage";
import type { PokemonSummary, TypeChart } from "@/lib/pokeapi";
import { TYPE_LABELS } from "@/lib/pokemon-types";

export type TeamPokemon = {
  pokemonId: number;
  name: string;
  nickname: string | null;
  sprite: string;
  types: string[];
};

const MAX_TEAM_SIZE = 6;

export function TeamEditor({
  teamId,
  initialMembers,
  chart,
}: {
  teamId: string;
  initialMembers: TeamPokemon[];
  chart: TypeChart;
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [results, setResults] = useState<PokemonSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverage = useMemo(() => teamCoverage(chart, members), [chart, members]);
  const gaps = useMemo(() => coverageGaps(coverage), [coverage]);

  const dirty =
    members.map((entry) => entry.pokemonId).join() !==
    initialMembers.map((entry) => entry.pokemonId).join();

  const full = members.length >= MAX_TEAM_SIZE;

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    setError(null);

    const term = new FormData(event.currentTarget).get("q");

    const response = await fetch(`/api/pokemon?q=${encodeURIComponent(String(term ?? ""))}`).catch(
      () => null,
    );

    if (!response?.ok) {
      setError("No se pudo consultar la Pokédex");
      setSearching(false);

      return;
    }

    setResults(await response.json());
    setSearching(false);
  }

  function add(pokemon: PokemonSummary) {
    setMembers((current) =>
      current.length >= MAX_TEAM_SIZE || current.some((e) => e.pokemonId === pokemon.id)
        ? current
        : [
            ...current,
            {
              pokemonId: pokemon.id,
              name: pokemon.name,
              nickname: null,
              sprite: pokemon.sprite,
              types: pokemon.types,
            },
          ],
    );
  }

  function remove(pokemonId: number) {
    setMembers((current) => current.filter((entry) => entry.pokemonId !== pokemonId));
  }

  async function save() {
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/equipos/${teamId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        members: members.map((entry) => ({
          pokemonId: entry.pokemonId,
          nickname: entry.nickname,
        })),
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const message = await response?.json().then((data) => data.error as string, () => null);

      setError(message ?? "No se pudo guardar");
      setSaving(false);

      return;
    }

    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">
            Equipo ({members.length}/{MAX_TEAM_SIZE})
          </h2>
          <div className="flex items-center gap-2">
            {error ? (
              <Chip color="danger" size="sm" variant="soft">
                {error}
              </Chip>
            ) : null}
            <Button isDisabled={!dirty} isPending={saving} size="sm" onPress={save}>
              Guardar
            </Button>
          </div>
        </div>

        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: MAX_TEAM_SIZE }, (_, slot) => {
            const member = members[slot];

            return (
              <li key={slot}>
                {member ? (
                  <Button
                    aria-label={`Quitar a ${member.nickname ?? member.name} del equipo`}
                    className="h-auto w-full flex-col items-center gap-1 rounded-xl border border-separator p-2 hover:border-danger"
                    variant="ghost"
                    onPress={() => remove(member.pokemonId)}
                  >
                    <Image
                      alt={member.name}
                      className="h-16 w-16 object-contain"
                      height={64}
                      src={member.sprite}
                      width={64}
                    />
                    <span className="w-full truncate text-center text-xs capitalize">
                      {member.nickname ?? member.name}
                    </span>
                    <span className="flex flex-wrap justify-center gap-0.5">
                      {member.types.map((type) => (
                        <TypeBadge key={type} type={type} />
                      ))}
                    </span>
                  </Button>
                ) : (
                  <div className="flex h-[124px] items-center justify-center rounded-xl border border-dashed border-separator text-xs text-muted">
                    Vacío
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Cobertura de tipos</h2>
        <p className="text-sm text-muted">
          Cada tipo muestra débiles/resistentes. Rojo: dos o más miembros reciben daño doble.
          Verde: alguien resiste o es inmune.
        </p>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {coverage.map((entry) => {
            const shared = entry.weakMembers.length >= 2;
            const weak = entry.weakMembers.length === 1;
            const safe = entry.resistantMembers.length + entry.immuneMembers.length > 0;

            return (
              <li key={entry.type}>
                <Chip
                  className="w-full justify-between"
                  color={shared ? "danger" : weak ? "warning" : safe ? "success" : "default"}
                  size="md"
                  variant={shared || weak || safe ? "soft" : "tertiary"}
                >
                  <span className="font-medium">{TYPE_LABELS[entry.type] ?? entry.type}</span>
                  <span className="tabular-nums opacity-70">
                    {entry.weakMembers.length}/{entry.resistantMembers.length}
                  </span>
                </Chip>
              </li>
            );
          })}
        </ul>

        {members.length > 0 ? (
          <div className="flex flex-col gap-2 text-sm">
            {gaps.sharedWeaknesses.length > 0 ? (
              <p>
                <span className="font-medium text-danger">Debilidad compartida:</span>{" "}
                {gaps.sharedWeaknesses
                  .map((entry) => `${TYPE_LABELS[entry.type]} (${entry.weakMembers.length})`)
                  .join(", ")}
              </p>
            ) : (
              <p className="text-success">Ningún tipo golpea fuerte a dos o más miembros.</p>
            )}

            {gaps.uncoveredOffense.length > 0 ? (
              <p>
                <span className="font-medium text-warning">Sin respuesta ofensiva contra:</span>{" "}
                {gaps.uncoveredOffense.map((entry) => TYPE_LABELS[entry.type]).join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Buscar en la Pokédex</h2>

        <Form className="flex flex-row items-end gap-2" onSubmit={search}>
          <TextField className="w-full max-w-xs" name="q" type="search">
            <Label>Nombre</Label>
            <Input placeholder="pikachu, char, eevee…" />
          </TextField>
          <Button isPending={searching} type="submit">
            Buscar
          </Button>
        </Form>

        {full ? (
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Equipo completo</Alert.Title>
              <Alert.Description>Quita algún Pokémon para añadir otro.</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        {results.length === 0 ? (
          <EmptyState>
            <p className="font-medium">Sin resultados</p>
            <p className="text-sm text-muted">Busca un Pokémon para añadirlo al equipo.</p>
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {results.map((pokemon) => {
              const already = members.some((entry) => entry.pokemonId === pokemon.id);

              return (
                <li key={pokemon.id}>
                  <Card className={`h-full ${!already && full ? "opacity-40" : ""}`}>
                    <Card.Content className="flex flex-col items-center gap-1 p-3">
                      <Image
                        alt={pokemon.name}
                        className="h-16 w-16 object-contain"
                        height={64}
                        src={pokemon.sprite}
                        width={64}
                      />
                      <span className="w-full truncate text-center text-xs capitalize">
                        {pokemon.name}
                      </span>
                      <div className="flex flex-wrap justify-center gap-1">
                        {pokemon.types.map((type) => (
                          <TypeBadge key={type} type={type} />
                        ))}
                      </div>
                      <Button
                        className="mt-1 w-full"
                        isDisabled={already || full}
                        size="sm"
                        variant={already ? "secondary" : "primary"}
                        onPress={() => add(pokemon)}
                      >
                        {already ? "En el equipo" : "Añadir"}
                      </Button>
                    </Card.Content>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
