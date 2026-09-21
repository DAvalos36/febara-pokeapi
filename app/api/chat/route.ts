import { google } from "@ai-sdk/google";
import { convertToModelMessages, generateText, stepCountIs, tool } from "ai";
import { NextResponse } from "next/server";

import { currentUser } from "@/lib/current-user";
import { toolDescriptions, toolRunners, toolSchemas } from "@/lib/tools";

const MODEL = "gemini-2.5-flash";

const SYSTEM = `Eres el asistente de Pokeapi Fabara, una app para armar equipos Pokémon.
Respondes en español, de forma breve y concreta.
Usa siempre las herramientas para consultar datos reales: nunca inventes tipos, estadísticas ni el contenido de los equipos del usuario.
Cuando analices un equipo, explica la debilidad más grave primero y sugiere qué tipo le falta.
Antes de modificar un equipo, confirma que es lo que el usuario pide.`;

function buildTools(userId: string) {
  return {
    buscarPokemon: tool({
      description: toolDescriptions.buscarPokemon,
      inputSchema: toolSchemas.buscarPokemon,
      execute: (args) => toolRunners.buscarPokemon(userId, args),
    }),
    verPokemon: tool({
      description: toolDescriptions.verPokemon,
      inputSchema: toolSchemas.verPokemon,
      execute: (args) => toolRunners.verPokemon(userId, args),
    }),
    listarEquipos: tool({
      description: toolDescriptions.listarEquipos,
      inputSchema: toolSchemas.listarEquipos,
      execute: () => toolRunners.listarEquipos(userId),
    }),
    analizarEquipo: tool({
      description: toolDescriptions.analizarEquipo,
      inputSchema: toolSchemas.analizarEquipo,
      execute: (args) => toolRunners.analizarEquipo(userId, args),
    }),
    agregarAEquipo: tool({
      description: toolDescriptions.agregarAEquipo,
      inputSchema: toolSchemas.agregarAEquipo,
      execute: (args) => toolRunners.agregarAEquipo(userId, args),
    }),
  };
}

export async function POST(request: Request) {
  const session = await currentUser();

  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: "Falta GOOGLE_GENERATIVE_AI_API_KEY en el entorno" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const messages = (body as { messages?: unknown })?.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Falta el historial de mensajes" }, { status: 400 });
  }

  try {
    const result = await generateText({
      model: google(MODEL),
      system: SYSTEM,
      messages: await convertToModelMessages(messages),
      tools: buildTools(session.userId),
      stopWhen: stepCountIs(6),
    });

    return NextResponse.json({
      text: result.text,
      herramientas: result.steps.flatMap((step) =>
        step.toolCalls.map((call) => call.toolName),
      ),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json({ error: `El modelo falló: ${message}` }, { status: 502 });
  }
}
