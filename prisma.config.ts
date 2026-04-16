import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const databaseUrl = env("DATABASE_URL");
const shadowDatabaseUrl =
  process.env.SHADOW_DATABASE_URL &&
  process.env.SHADOW_DATABASE_URL !== databaseUrl
    ? process.env.SHADOW_DATABASE_URL
    : undefined;

// Prisma ORM 7: le `url` datasource est déplacé dans `prisma.config.ts`
export default defineConfig({
  datasource: {
    url: databaseUrl,
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
  migrations: {
    seed: "node prisma/seed.js",
  },
});

