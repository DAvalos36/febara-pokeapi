import { Card } from "@heroui/react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { CaptureButton } from "@/components/capture-button";
import { TypeBadge } from "@/components/type-badge";
import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { listPokemon, searchPokemon } from "@/lib/pokeapi";

export const metadata = { title: "Pokédex" };

const PAGE_SIZE = 24;

export default async function PokedexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await currentUser();

  if (!session) redirect("/login");

  const { q = "", page = "1" } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  const [results, captured] = await Promise.all([
    q
      ? searchPokemon(q, PAGE_SIZE).then((list) => ({
          count: list.length,
          results: list,
        }))
      : listPokemon(PAGE_SIZE, (pageNumber - 1) * PAGE_SIZE),
    db.capture.findMany({
      where: { userId: session.userId },
      select: { pokemonId: true },
    }),
  ]);

  const capturedIds = new Set(captured.map((entry) => entry.pokemonId));
  const totalPages = q ? 1 : Math.ceil(results.count / PAGE_SIZE);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Pokédex</h1>
        <p className="text-muted">Busca Pokémon y añádelos a tu colección.</p>
      </header>

      <form action="/pokemon" className="flex gap-2">
        <input
          aria-label="Buscar Pokémon"
          className="w-full max-w-sm rounded-lg border border-separator bg-background px-3 py-2 text-sm"
          defaultValue={q}
          name="q"
          placeholder="pikachu, char, eevee…"
          type="search"
        />
        <button
          className="rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground"
          type="submit"
        >
          Buscar
        </button>
      </form>

      {results.results.length === 0 ? (
        <p className="text-muted">Ningún Pokémon coincide con «{q}».</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.results.map((pokemon) => (
            <li key={pokemon.id}>
              <Card className="h-full">
                <Card.Header className="items-center">
                  {pokemon.sprite ? (
                    <Image
                      alt={pokemon.name}
                      className="mx-auto h-28 w-28 object-contain"
                      height={112}
                      src={pokemon.sprite}
                      width={112}
                    />
                  ) : null}
                  <Card.Title className="capitalize">{pokemon.name}</Card.Title>
                  <Card.Description>N.º {pokemon.id}</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-wrap justify-center gap-1">
                  {pokemon.types.map((type) => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </Card.Content>
                <Card.Footer>
                  <CaptureButton
                    captured={capturedIds.has(pokemon.id)}
                    pokemonId={pokemon.id}
                  />
                </Card.Footer>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-4 text-sm">
          {pageNumber > 1 ? (
            <a className="text-accent" href={`/pokemon?page=${pageNumber - 1}`}>
              ← Anterior
            </a>
          ) : null}
          <span className="text-muted">
            Página {pageNumber} de {totalPages}
          </span>
          {pageNumber < totalPages ? (
            <a className="text-accent" href={`/pokemon?page=${pageNumber + 1}`}>
              Siguiente →
            </a>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
