import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <section className="flex justify-center py-10">
      <AuthForm
        mode="login"
        next={next?.startsWith("/") ? next : "/coleccion"}
      />
    </section>
  );
}
