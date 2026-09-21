import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <section className="flex justify-center py-10">
      <AuthForm mode="registro" next="/coleccion" />
    </section>
  );
}
