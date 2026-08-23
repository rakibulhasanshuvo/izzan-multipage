import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pingRedis } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  let db: "ok" | "error" = "error";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "ok";
  } catch (error) {
    console.error("Health check: database unreachable", error);
  }

  const redis = await pingRedis();
  // Redis is optional (in-memory fallback exists), so only the DB gates health
  const status = db === "ok" ? "ok" : "unhealthy";

  return NextResponse.json(
    { status, db, redis },
    { status: db === "ok" ? 200 : 503 }
  );
}
