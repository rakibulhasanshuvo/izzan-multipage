import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import sanitizeHtml from "sanitize-html";
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
  const sanitizedValue = sanitizeHtml(String(value), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class'],
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'width', 'height'],
    },
  });

  const content = await prisma.cMSContent.update({
    where: { id },
    data: { value: sanitizedValue },
  });

  return NextResponse.json(content);
}, "Failed to update CMS content"));
