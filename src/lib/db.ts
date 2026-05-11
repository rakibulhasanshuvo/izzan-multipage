import { PrismaClient } from "@/generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { env } from "./env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const databaseUrl = env.DATABASE_URL;
const isSqlite = databaseUrl?.startsWith("file:") || !databaseUrl;

export const prisma =
  globalForPrisma.prisma ||
  (isSqlite
    ? new PrismaClient({
        adapter: new PrismaBetterSqlite3({ 
          url: databaseUrl || `file:${path.resolve(process.cwd(), "prisma", "dev.db")}` 
        }),
      })
    : new PrismaClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
