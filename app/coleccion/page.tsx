import { redirect } from "next/navigation";

import { currentUser } from "@/lib/current-user";

export const metadata = { title: "Mi colección" };

export default async function ColeccionPage() {
  const session = await currentUser();

  if (!session) redirect("/login");

  return (
    <section className="py-10">
      <h1 className="text-2xl font-semibold">Mi colección</h1>
      <p className="text-muted">Sesión iniciada como {session.email}</p>
    </section>
  );
}
