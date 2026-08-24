import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { newsletterSchema } from "@/lib/validation";

export const POST = apiHandler(async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`newsletter:${ip}`, 5);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const data = await req.json();
  const validationResult = newsletterSchema.safeParse(data);
  if (!validationResult.success) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { email, companyWebsite } = validationResult.data;

  // Honeypot: the hidden "companyWebsite" field is never filled by humans.
  if (companyWebsite && companyWebsite.trim() !== "") {
    logger.warn("Newsletter honeypot triggered", { ip });
    return NextResponse.json({ success: true });
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  } catch (error) {
    logger.error("Failed to persist newsletter subscription", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}, "Failed to subscribe");
