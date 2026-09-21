import { createMcpHandler, withMcpAuth } from "mcp-handler";

import { verifyMcpToken } from "@/lib/mcp-token";
import { toolDescriptions, toolRunners, toolSchemas } from "@/lib/tools";

function asContent(payload: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }] };
}

function userIdOf(ctx: { http?: { authInfo?: { extra?: Record<string, unknown> } } }) {
  const userId = ctx.http?.authInfo?.extra?.userId;

  if (typeof userId !== "string") throw new Error("Sesión MCP sin usuario");

  return userId;
}

const base = createMcpHandler((server) => {
  server.registerTool(
    "buscarPokemon",
    {
      title: "Buscar Pokémon",
      description: toolDescriptions.buscarPokemon,
      inputSchema: toolSchemas.buscarPokemon,
    },
    async (args, ctx) => asContent(await toolRunners.buscarPokemon(userIdOf(ctx), args)),
  );

  server.registerTool(
    "verPokemon",
    {
      title: "Ver Pokémon",
      description: toolDescriptions.verPokemon,
      inputSchema: toolSchemas.verPokemon,
    },
    async (args, ctx) => asContent(await toolRunners.verPokemon(userIdOf(ctx), args)),
  );

  server.registerTool(
    "listarEquipos",
    {
      title: "Listar equipos",
      description: toolDescriptions.listarEquipos,
      inputSchema: toolSchemas.listarEquipos,
    },
    async (_args, ctx) => asContent(await toolRunners.listarEquipos(userIdOf(ctx))),
  );

  server.registerTool(
    "analizarEquipo",
    {
      title: "Analizar equipo",
      description: toolDescriptions.analizarEquipo,
      inputSchema: toolSchemas.analizarEquipo,
    },
    async (args, ctx) => asContent(await toolRunners.analizarEquipo(userIdOf(ctx), args)),
  );

  server.registerTool(
    "agregarAEquipo",
    {
      title: "Agregar a equipo",
      description: toolDescriptions.agregarAEquipo,
      inputSchema: toolSchemas.agregarAEquipo,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (args, ctx) => asContent(await toolRunners.agregarAEquipo(userIdOf(ctx), args)),
  );
}, {
  serverInfo: { name: "pokeapi-fabara", version: "1.0.0" },
  instructions:
    "Herramientas para consultar la PokéAPI y gestionar los equipos Pokémon del usuario autenticado. Usa analizarEquipo antes de recomendar cambios.",
});

const handler = withMcpAuth(
  base,
  async (_request, bearerToken) => {
    const session = await verifyMcpToken(bearerToken);

    if (!session) return undefined;

    return {
      token: bearerToken!,
      clientId: session.email,
      scopes: ["pokedex"],
      extra: { userId: session.userId, email: session.email },
    };
  },
  { required: true },
);

export { handler as GET, handler as POST, handler as DELETE };
