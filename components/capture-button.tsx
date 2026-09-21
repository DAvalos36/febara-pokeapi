"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CaptureButton({
  pokemonId,
  captured,
}: {
  pokemonId: number;
  captured: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function capture() {
    setPending(true);
    setError(null);

    const response = await fetch("/api/coleccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pokemonId }),
    }).catch(() => null);

    if (!response?.ok) {
      const message = await response?.json().then(
        (data) => data.error as string,
        () => null,
      );

      setError(message ?? "No se pudo capturar");
      setPending(false);

      return;
    }

    setPending(false);
    router.refresh();
  }

  if (captured) {
    return (
      <Button isDisabled className="w-full" size="sm" variant="secondary">
        En tu colección
      </Button>
    );
  }

  return (
    <div className="w-full">
      <Button
        className="w-full"
        isPending={pending}
        size="sm"
        onPress={capture}
      >
        Capturar
      </Button>
      {error ? (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
