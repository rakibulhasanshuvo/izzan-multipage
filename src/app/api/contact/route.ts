import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { contactFormSchema } from "@/lib/validation";

export const POST = apiHandler(async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`contact:${ip}`, 5);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again later." },
      { status: 429 }
    );
  }

  const data = await req.json();
  const validationResult = contactFormSchema.safeParse(data);
  if (!validationResult.success) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const { fullName, contactEmail, subject, message, companyWebsite } = validationResult.data;

  // Honeypot: the hidden "companyWebsite" field is never filled by humans.
  if (companyWebsite && companyWebsite.trim() !== "") {
    logger.warn("Contact honeypot triggered", { ip });
    return NextResponse.json({ success: true });
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: fullName,
        email: contactEmail,
        subject,
        message,
      },
    });
  } catch (error) {
    logger.error("Failed to persist contact message", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}, "Failed to send message");
