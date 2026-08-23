import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/client";
import { logger } from "@/lib/logger";

type RouteHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse> | NextResponse;

export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 100;

export function parsePageParams(url: URL, defaultLimit: number = DEFAULT_PAGE_LIMIT) {
  const pageRaw = Number(url.searchParams.get("page"));
  const limitRaw = Number(url.searchParams.get("limit"));
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
  const limit =
    Number.isFinite(limitRaw) && limitRaw >= 1
      ? Math.min(Math.floor(limitRaw), MAX_PAGE_LIMIT)
      : defaultLimit;
  return { page, limit, skip: (page - 1) * limit };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return NextResponse.json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

export function apiHandler(handler: RouteHandler, defaultErrorMessage: string = "Internal Server Error"): RouteHandler {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      if (error instanceof Error) { logger.error("API Error:", { error: error.message }); } else { logger.error("API Error:", { error: String(error) }); }

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
          { error: "Bad Request" },
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
