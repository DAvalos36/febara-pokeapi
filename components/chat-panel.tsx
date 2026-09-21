"use client";

import {
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
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
      <Card>
        <Card.Content className="flex min-h-[340px] flex-col gap-4 p-4">
          {messages.length === 0 ? (
            <EmptyState className="my-auto">
              <p className="font-medium">Pregúntame por tus equipos</p>
              <p className="text-sm text-muted">
                Consulto la PokéAPI y tu base de datos antes de responder.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {SUGERENCIAS.map((texto) => (
                  <Button key={texto} size="sm" variant="secondary" onPress={() => send(texto)}>
                    {texto}
                  </Button>
                ))}
              </div>
            </EmptyState>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar size="sm">
                  <Avatar.Fallback>{message.role === "user" ? "Tú" : "IA"}</Avatar.Fallback>
                </Avatar>

                <div className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : ""}`}>
                  <div
                    className={`max-w-prose whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-default/20 text-foreground"
                    }`}
                  >
                    {textOf(message)}
                  </div>

                  {message.herramientas?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(message.herramientas)).map((name) => (
                        <Chip key={name} size="sm" variant="secondary">
                          {name}
                        </Chip>
                      ))}
                    </div>
                  ) : null}
                </div>
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
        </Card.Content>
      </Card>

      {error ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>No se pudo responder</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <Form className="flex flex-row items-end gap-2" onSubmit={onSubmit}>
        <TextField isRequired className="w-full" name="mensaje">
          <Label className="sr-only">Mensaje</Label>
          <Input placeholder="¿Qué le falta a mi equipo?" />
        </TextField>
        <Button isPending={pending} type="submit">
          Enviar
        </Button>
      </Form>
    </div>
  );
}
