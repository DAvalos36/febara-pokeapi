export type Credentials = { email: string; password: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseCredentials(body: unknown): Credentials | string {
  if (typeof body !== "object" || body === null)
    return "Cuerpo de la petición inválido";

  const { email, password } = body as Record<string, unknown>;

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return "Correo electrónico inválido";
  }

  if (typeof password !== "string" || password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }

  return { email: email.trim().toLowerCase(), password };
}
