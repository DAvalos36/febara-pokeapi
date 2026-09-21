"use client";

import { Button } from "@heroui/react";
import { useState } from "react";

export function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button size="sm" variant="secondary" onPress={copy}>
      {copied ? "Copiado" : label}
    </Button>
  );
}
