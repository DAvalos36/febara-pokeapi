import { Alert, Card, Chip } from "@heroui/react";
import { redirect } from "next/navigation";

import { CopyButton } from "@/components/copy-button";
import { currentUser } from "@/lib/current-user";
import { createMcpToken } from "@/lib/mcp-token";
import { toolDescriptions } from "@/lib/tools";

export const metadata = { title: "Conexión MCP" };

export default async function McpPage() {
  const session = await currentUser();

  if (!session) redirect("/login");

  const token = await createMcpToken(session.userId, session.email);
  const command = `claude mcp add --transport http pokedex http://localhost:3000/api/mcp --header "Authorization: Bearer ${token}"`;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Conexión MCP</h1>
        <p className="text-muted">
          Conecta Claude Code, Claude Desktop o Cursor a tus equipos. El asistente usará las
          mismas herramientas que el chat de esta app.
        </p>
      </header>

      <Card>
        <Card.Header className="flex-row items-center justify-between gap-4">
          <div>
            <Card.Title>1. Comando de conexión</Card.Title>
            <Card.Description>Pégalo en tu terminal con la app corriendo.</Card.Description>
          </div>
          <CopyButton label="Copiar comando" value={command} />
        </Card.Header>
        <Card.Content>
          <pre className="overflow-x-auto rounded-lg bg-default/10 p-3 text-xs">{command}</pre>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="flex-row items-center justify-between gap-4">
          <div>
            <Card.Title>2. Tu token de acceso</Card.Title>
            <Card.Description>
              Identifica a {session.email} y caduca en 90 días.
            </Card.Description>
          </div>
          <CopyButton label="Copiar token" value={token} />
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          <p className="overflow-x-auto break-all rounded-lg bg-default/10 p-3 font-mono text-xs">
            {token}
          </p>
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Trátalo como una contraseña</Alert.Title>
              <Alert.Description>
                Quien tenga este token puede leer y modificar tus equipos. Para revocarlo hay que
                cambiar AUTH_SECRET, lo que invalida también las sesiones abiertas.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Herramientas expuestas</Card.Title>
          <Card.Description>
            Las mismas de lib/tools.ts que consume el asistente.
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          {Object.entries(toolDescriptions).map(([name, description]) => (
            <div key={name} className="flex flex-col gap-1">
              <Chip size="sm">{name}</Chip>
              <span className="text-sm text-muted">{description}</span>
            </div>
          ))}
        </Card.Content>
      </Card>
    </section>
  );
}
