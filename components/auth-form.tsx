"use client";

import {
  Button,
  Card,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  mode: "login" | "registro";
  next: string;
};

const COPY = {
  login: {
    title: "Entrar",
    description: "Accede a tu colección y a tus equipos.",
    submit: "Entrar",
    endpoint: "/api/auth/login",
    footer: "¿Todavía no tienes cuenta?",
    linkLabel: "Crear una",
    linkHref: "/registro",
  },
  registro: {
    title: "Crear cuenta",
    description: "Empieza tu colección desde cero.",
    submit: "Crear cuenta",
    endpoint: "/api/auth/register",
    footer: "¿Ya tienes cuenta?",
    linkLabel: "Entrar",
    linkHref: "/login",
  },
} as const;

export function AuthForm({ mode, next }: Props) {
  const copy = COPY[mode];
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);

    const response = await fetch(copy.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const message = await response?.json().then(
        (data) => data.error as string,
        () => null,
      );

      setError(message ?? "No pudimos conectar con el servidor");
      setPending(false);

      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <Card.Header>
        <Card.Title>{copy.title}</Card.Title>
        <Card.Description>{copy.description}</Card.Description>
      </Card.Header>

      <Card.Content>
        <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <TextField isRequired name="email" type="email">
            <Label>Correo electrónico</Label>
            <Input placeholder="entrenador@pueblo-paleta.com" />
            <FieldError />
          </TextField>

          <TextField isRequired minLength={8} name="password" type="password">
            <Label>Contraseña</Label>
            <Input placeholder="Mínimo 8 caracteres" />
            <FieldError />
          </TextField>

          {error ? (
            <p className="text-danger text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <Button className="w-full" isPending={pending} type="submit">
            {({ isPending }) => (
              <>
                {isPending ? <Spinner color="current" size="sm" /> : null}
                {copy.submit}
              </>
            )}
          </Button>
        </Form>
      </Card.Content>

      <Card.Footer className="justify-center gap-1 text-sm">
        <span className="text-muted">{copy.footer}</span>
        <Link className="text-accent" href={copy.linkHref}>
          {copy.linkLabel}
        </Link>
      </Card.Footer>
    </Card>
  );
}
