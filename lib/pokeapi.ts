const BASE = "https://pokeapi.co/api/v2";
const REVALIDATE = 60 * 60 * 24;

export type PokemonSummary = {
  id: number;
  name: string;
  sprite: string;
  types: string[];
};

export type PokemonDetail = PokemonSummary & {
  height: number;
  weight: number;
  abilities: string[];
  stats: { name: string; value: number }[];
};

export type TypeChart = Record<string, Record<string, number>>;

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    next: { revalidate: REVALIDATE },
  });

  if (!response.ok) {
    throw new Error(`PokéAPI respondió ${response.status} en ${path}`);
  }

  return response.json() as Promise<T>;
}

const STAT_LABELS: Record<string, string> = {
  hp: "Vida",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. especial",
  "special-defense": "Def. especial",
  speed: "Velocidad",
};

type RawPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: { "official-artwork"?: { front_default: string | null } };
  };
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

function toDetail(raw: RawPokemon): PokemonDetail {
  return {
    id: raw.id,
    name: raw.name,
    sprite:
      raw.sprites.other?.["official-artwork"]?.front_default ??
      raw.sprites.front_default ??
      "",
    types: raw.types.map((entry) => entry.type.name),
    height: raw.height,
    weight: raw.weight,
    abilities: raw.abilities.map((entry) => entry.ability.name),
    stats: raw.stats.map((entry) => ({
      name: STAT_LABELS[entry.stat.name] ?? entry.stat.name,
      value: entry.base_stat,
    })),
  };
}

export async function getPokemon(
  idOrName: number | string,
): Promise<PokemonDetail> {
  return toDetail(await get<RawPokemon>(`/pokemon/${idOrName}`));
}

export async function listPokemon(limit = 24, offset = 0) {
  const page = await get<{ count: number; results: { name: string }[] }>(
    `/pokemon?limit=${limit}&offset=${offset}`,
  );

  const results = await Promise.all(
    page.results.map((entry) => getPokemon(entry.name)),
  );

  return { count: page.count, results: results as PokemonSummary[] };
}

export async function searchPokemon(
  term: string,
  limit = 24,
): Promise<PokemonSummary[]> {
  const needle = term.trim().toLowerCase();

  if (!needle) return (await listPokemon(limit)).results;

  const all = await get<{ results: { name: string }[] }>(
    "/pokemon?limit=100000",
  );
  const matches = all.results
    .filter((entry) => entry.name.includes(needle))
    .slice(0, limit);

  return Promise.all(matches.map((entry) => getPokemon(entry.name)));
}

export async function getTypeChart(): Promise<TypeChart> {
  const { results } = await get<{ results: { name: string }[] }>(
    "/type?limit=100",
  );
  const names = results
    .map((entry) => entry.name)
    .filter((name) => name !== "unknown");

  const relations = await Promise.all(
    names.map(async (name) => {
      const raw = await get<{
        damage_relations: {
          double_damage_to: { name: string }[];
          half_damage_to: { name: string }[];
          no_damage_to: { name: string }[];
        };
      }>(`/type/${name}`);

      const row: Record<string, number> = {};

      for (const target of names) row[target] = 1;
      for (const { name: target } of raw.damage_relations.double_damage_to)
        row[target] = 2;
      for (const { name: target } of raw.damage_relations.half_damage_to)
        row[target] = 0.5;
      for (const { name: target } of raw.damage_relations.no_damage_to)
        row[target] = 0;

      return [name, row] as const;
    }),
  );

  return Object.fromEntries(relations);
}
