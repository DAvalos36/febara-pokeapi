"use client";

import { Button, Form, Input, Label, TextField } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateTeamForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = event.currentTarget;
    const name = new FormData(form).get("name");

    const response = await fetch("/api/equipos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => null);

    if (!response?.ok) {
      const message = await response?.json().then((data) => data.error as string, () => null);

      setError(message ?? "No se pudo crear el equipo");
      setPending(false);

      return;
    }

    form.reset();
    setPending(false);
    router.refresh();
  }

  return (
    <Form className="flex items-end gap-2" onSubmit={onSubmit}>
      <TextField isRequired className="w-full max-w-xs" name="name">
        <Label>Nuevo equipo</Label>
        <Input placeholder="Titulares de Kanto" />
      </TextField>
      <Button isPending={pending} type="submit">
        Crear
      </Button>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </Form>
  );
}
