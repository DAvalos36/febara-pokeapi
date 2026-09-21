import path from "node:path";

import { defineConfig, env } from "prisma/config";

process.loadEnvFile();

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: { path: path.join("prisma", "migrations") },
  datasource: { url: env("DATABASE_URL") },
});
