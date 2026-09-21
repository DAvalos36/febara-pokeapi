import { redirect } from "next/navigation";

import { ChatPanel } from "@/components/chat-panel";
import { currentUser } from "@/lib/current-user";

export const metadata = { title: "Asistente" };

export default async function ChatPage() {
  const session = await currentUser();

  if (!session) redirect("/login");

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Asistente</h1>
        <p className="text-muted">
          Analiza tus equipos, compara Pokémon y sugiere incorporaciones.
        </p>
      </header>

      <ChatPanel />
    </section>
  );
}
