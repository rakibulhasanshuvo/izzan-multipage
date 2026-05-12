import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";

export const PATCH = withAuth(apiHandler(async function PATCH(req: NextRequest) {
  const { id, value } = await req.json();

  if (!id || value === undefined || (typeof value === "string" && value.trim() === "")) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const content = await prisma.cMSContent.update({
    where: { id },
    data: { value: String(value) },
  });

  return NextResponse.json(content);
}, "Failed to update CMS content"));
