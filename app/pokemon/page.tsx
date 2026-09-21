import { Button, Card, EmptyState, Form, Label, SearchField } from "@heroui/react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { PokedexPagination } from "@/components/pokedex-pagination";
import { TypeBadge } from "@/components/type-badge";
import { currentUser } from "@/lib/current-user";
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

  const results = q
    ? await searchPokemon(q, PAGE_SIZE).then((list) => ({ count: list.length, results: list }))
    : await listPokemon(PAGE_SIZE, (pageNumber - 1) * PAGE_SIZE);

  const totalPages = q ? 1 : Math.ceil(results.count / PAGE_SIZE);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Pokédex</h1>
        <p className="text-muted">
          Consulta cualquier Pokémon. Para armar equipos, entra en uno desde Equipos.
        </p>
      </header>

      <Form action="/pokemon" className="flex flex-row items-end gap-2">
        <SearchField defaultValue={q} name="q">
          <Label className="sr-only">Buscar Pokémon</Label>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-full sm:w-[280px]" placeholder="pikachu, char…" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Button type="submit">Buscar</Button>
      </Form>

      {results.results.length === 0 ? (
        <EmptyState>
          <p className="font-medium">Sin resultados</p>
          <p className="text-muted text-sm">Ningún Pokémon coincide con «{q}».</p>
        </EmptyState>
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
              </Card>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? <PokedexPagination page={pageNumber} totalPages={totalPages} /> : null}
    </section>
  );
}
