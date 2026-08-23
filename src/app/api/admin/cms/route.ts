import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import { sanitizeCmsValue } from "@/lib/sanitize";
import { z } from "zod";

const cmsUpdateSchema = z.object({
  id: z.string().min(1, "CMS content ID is required"),
  value: z.string(),
});

export const PATCH = withAuth(apiHandler(async function PATCH(req: NextRequest) {
  const data = await req.json();

  const validationResult = cmsUpdateSchema.safeParse(data);
  if (!validationResult.success) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { id, value } = validationResult.data;

  // Sanitize HTML content before storing (defense-in-depth)
  const sanitizedValue = sanitizeCmsValue(value);

  const content = await prisma.cMSContent.update({
    where: { id },
    data: { value: sanitizedValue },
  });

  return NextResponse.json(content);
}, "Failed to update CMS content"));
