import "server-only";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

declare global {
  var __styleEchangePool: pg.Pool | undefined;
  var __styleEchangePrisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL manquante.");
}

const pool =
  globalThis.__styleEchangePool ??
  new pg.Pool({
    connectionString,
  });

// Prisma adapter type defs peuvent diverger selon les versions de `pg`.
// Runtime OK (meme approche que le seed), on cast pour debloquer TS.
const adapter = new PrismaPg(pool as unknown as any);

export const prisma =
  globalThis.__styleEchangePrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.__styleEchangePool = pool;
  globalThis.__styleEchangePrisma = prisma;
}

