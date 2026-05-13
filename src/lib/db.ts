import { PrismaClient } from "@/generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";
import { env } from "./env";
import logger from "@/lib/logger";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const databaseUrl = env.DATABASE_URL;
const isSqlite = databaseUrl?.startsWith("file:") || !databaseUrl;

let dbPath = databaseUrl ? databaseUrl.replace("file:", "") : path.resolve(process.cwd(), "prisma", "dev.db");

if (isSqlite && process.env.NODE_ENV === "production" && !databaseUrl) {
  // In Vercel, the file system is read-only except for /tmp.
  // We need to copy the seeded database to /tmp so we can write to it.
  const tmpPath = path.join("/tmp", "dev.db");
  if (!fs.existsSync(tmpPath)) {
    try {
      fs.copyFileSync(dbPath, tmpPath);
    } catch (e) {
      logger.error("Failed to copy database to /tmp", { error: e });
    }
  }
  dbPath = tmpPath;
}

export const prisma =
  globalForPrisma.prisma ||
  (isSqlite
    ? new PrismaClient({
        adapter: new PrismaBetterSqlite3({ 
          url: `file:${dbPath}`
        }),
      })
    : new PrismaClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
