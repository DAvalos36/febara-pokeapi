"use client";

import { Alert, Button } from "@heroui/react";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-col items-start gap-4 py-10">
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Algo salió mal</Alert.Title>
          <Alert.Description>{error.message || "Error inesperado."}</Alert.Description>
        </Alert.Content>
      </Alert>
      <Button onPress={reset}>Reintentar</Button>
    </section>
  );
}
