import { z } from "zod";

import { coverageGaps, teamCoverage } from "./coverage";
import { db } from "./db";
import { getPokemon, getTypeChart, searchPokemon } from "./pokeapi";
import { TYPE_LABELS } from "./pokemon-types";

export const MAX_TEAM_SIZE = 6;

function label(type: string) {
  return TYPE_LABELS[type] ?? type;
}

async function teamByName(userId: string, nombre: string) {
  const teams = await db.team.findMany({
    where: { userId },
    include: { members: { orderBy: { slot: "asc" } } },
  });

  const needle = nombre.trim().toLowerCase();

  return (
    teams.find((team) => team.name.toLowerCase() === needle) ??
    teams.find((team) => team.name.toLowerCase().includes(needle)) ??
    null
  );
}

export const toolSchemas = {
  buscarPokemon: z.object({
    termino: z.string().describe("Parte del nombre del Pokémon, por ejemplo 'char' o 'pika'"),
  }),
  verPokemon: z.object({
    nombre: z.string().describe("Nombre exacto o número de Pokédex"),
  }),
  listarEquipos: z.object({}),
  analizarEquipo: z.object({
    nombre: z.string().describe("Nombre del equipo del usuario"),
  }),
  agregarAEquipo: z.object({
    equipo: z.string().describe("Nombre del equipo del usuario"),
    pokemon: z.string().describe("Nombre exacto o número de Pokédex del Pokémon a añadir"),
  }),
};

export const toolDescriptions = {
  buscarPokemon: "Busca Pokémon por una parte de su nombre y devuelve sus tipos.",
  verPokemon: "Devuelve tipos, estadísticas base y habilidades de un Pokémon concreto.",
  listarEquipos: "Lista los equipos del usuario con sus miembros actuales.",
  analizarEquipo:
    "Analiza un equipo: debilidades compartidas, tipos que resiste y huecos ofensivos.",
  agregarAEquipo: "Añade un Pokémon a un equipo del usuario. Modifica datos.",
};

export async function buscarPokemon(_userId: string, { termino }: { termino: string }) {
  const results = await searchPokemon(termino, 10);

  return {
    resultados: results.map((pokemon) => ({
      id: pokemon.id,
      nombre: pokemon.name,
      tipos: pokemon.types.map(label),
    })),
  };
}

export async function verPokemon(_userId: string, { nombre }: { nombre: string }) {
  const pokemon = await getPokemon(nombre.toLowerCase()).catch(() => null);

  if (!pokemon) return { error: `No encontré ningún Pokémon llamado «${nombre}»` };

  return {
    id: pokemon.id,
    nombre: pokemon.name,
    tipos: pokemon.types.map(label),
    habilidades: pokemon.abilities,
    estadisticas: Object.fromEntries(pokemon.stats.map((stat) => [stat.name, stat.value])),
  };
}

export async function listarEquipos(userId: string) {
  const teams = await db.team.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { members: { orderBy: { slot: "asc" } } },
  });

  return {
    equipos: teams.map((team) => ({
      nombre: team.name,
      miembros: team.members.map((member) => member.nickname ?? member.name),
      huecosLibres: MAX_TEAM_SIZE - team.members.length,
    })),
  };
}

export async function analizarEquipo(userId: string, { nombre }: { nombre: string }) {
  const team = await teamByName(userId, nombre);

  if (!team) return { error: `No encontré ningún equipo llamado «${nombre}»` };

  if (team.members.length === 0) {
    return { equipo: team.name, aviso: "El equipo está vacío, no hay nada que analizar." };
  }

  const [chart, members] = await Promise.all([
    getTypeChart(),
    Promise.all(
      team.members.map(async (member) => {
        const pokemon = await getPokemon(member.pokemonId);

        return { name: member.nickname ?? member.name, types: pokemon.types };
      }),
    ),
  ]);

  const coverage = teamCoverage(chart, members);
  const gaps = coverageGaps(coverage);

  return {
    equipo: team.name,
    miembros: members.map((member) => ({
      nombre: member.name,
      tipos: member.types.map(label),
    })),
    huecosLibres: MAX_TEAM_SIZE - team.members.length,
    debilidadesCompartidas: gaps.sharedWeaknesses.map((entry) => ({
      tipo: label(entry.type),
      miembrosAfectados: entry.weakMembers,
    })),
    sinRespuestaOfensiva: gaps.uncoveredOffense.map((entry) => label(entry.type)),
  };
}

export async function agregarAEquipo(
  userId: string,
  { equipo, pokemon }: { equipo: string; pokemon: string },
) {
  const team = await teamByName(userId, equipo);

  if (!team) return { error: `No encontré ningún equipo llamado «${equipo}»` };

  if (team.members.length >= MAX_TEAM_SIZE) {
    return { error: `«${team.name}» ya tiene ${MAX_TEAM_SIZE} Pokémon.` };
  }

  const found = await getPokemon(pokemon.toLowerCase()).catch(() => null);

  if (!found) return { error: `No encontré ningún Pokémon llamado «${pokemon}»` };

  if (team.members.some((member) => member.pokemonId === found.id)) {
    return { error: `${found.name} ya está en «${team.name}»` };
  }

  await db.teamMember.create({
    data: {
      teamId: team.id,
      slot: team.members.length,
      pokemonId: found.id,
      name: found.name,
    },
  });

  return {
    ok: true,
    mensaje: `${found.name} añadido a «${team.name}»`,
    huecosLibres: MAX_TEAM_SIZE - team.members.length - 1,
  };
}

export const toolRunners = {
  buscarPokemon,
  verPokemon,
  listarEquipos,
  analizarEquipo,
  agregarAEquipo,
} as const;

export type ToolName = keyof typeof toolRunners;
