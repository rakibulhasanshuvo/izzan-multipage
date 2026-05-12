import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/client";
import { logger } from "@/lib/logger";

type RouteHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse> | NextResponse;

export function apiHandler(handler: RouteHandler, defaultErrorMessage: string = "Internal Server Error"): RouteHandler {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      logger.error("API Error:", error);

      const err = error as Error & { code?: string };
      if (error instanceof Prisma.PrismaClientKnownRequestError || (err && typeof err === 'object' && 'code' in err)) {
        // P2025: An operation failed because it depends on one or more records that were required but not found.
        if (err.code === 'P2025') {
          return NextResponse.json(
            { error: "Record not found" },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { error: "Bad Request: " + err.message },
          { status: 400 }
        );
      }

      if (error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientRustPanicError || (err && typeof err === 'object' && err.message?.includes('connection'))) {
        return NextResponse.json(
          { error: "Service Unavailable: Database connection error" },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: defaultErrorMessage },
        { status: 500 }
      );
    }
  };
}
