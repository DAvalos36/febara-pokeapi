"use client";

import { Button, Input, Label, Spinner, TextField } from "@heroui/react";
import { useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
  herramientas?: string[];
};

const SUGERENCIAS = [
  "¿Qué le falta a mi equipo?",
  "Compara a charizard con blastoise",
  "Sugiéreme un Pokémon de tipo acero",
];

function textOf(message: Message) {
  return message.parts.map((part) => part.text).join("");
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const trimmed = text.trim();

    if (!trimmed || pending) return;

    const outgoing: Message = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: trimmed }],
    };

    const history = [...messages, outgoing];

    setMessages(history);
    setPending(true);
    setError(null);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    }).catch(() => null);

    const data = await response?.json().catch(() => null);

    if (!response?.ok) {
      setError(data?.error ?? "No se pudo contactar con el asistente");
      setPending(false);

      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text: data.text }],
        herramientas: data.herramientas,
      },
    ]);
    setPending(false);
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const value = String(new FormData(form).get("mensaje") ?? "");

    form.reset();
    await send(value);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[320px] flex-col gap-3 rounded-xl border border-separator p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-muted">
              Pregúntame por tus equipos. Consulto la PokéAPI y tu base de datos antes de
              responder.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGERENCIAS.map((texto) => (
                <Button key={texto} size="sm" variant="secondary" onPress={() => send(texto)}>
                  {texto}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={message.role === "user" ? "self-end text-right" : "self-start"}
            >
              <div
                className={`inline-block max-w-prose whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-accent text-accent-foreground"
                    : "bg-default/20 text-foreground"
                }`}
              >
                {textOf(message)}
              </div>
              {message.herramientas?.length ? (
                <p className="mt-1 text-xs text-muted">
                  Consultó: {Array.from(new Set(message.herramientas)).join(", ")}
                </p>
              ) : null}
            </div>
          ))
        )}

        {pending ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner size="sm" />
            Pensando…
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <form className="flex items-end gap-2" onSubmit={onSubmit}>
        <TextField isRequired className="w-full" name="mensaje">
          <Label className="sr-only">Mensaje</Label>
          <Input placeholder="¿Qué le falta a mi equipo?" />
        </TextField>
        <Button isPending={pending} type="submit">
          Enviar
        </Button>
      </form>
    </div>
  );
}
