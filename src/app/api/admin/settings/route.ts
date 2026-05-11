import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";


export const PATCH = withAuth(apiHandler(async function PATCH(req: NextRequest) {
  const data = await req.json();

  if (data.firstName !== undefined && (typeof data.firstName !== 'string' || data.firstName.trim() === '')) {
    return NextResponse.json({ error: "First name must be a non-empty string" }, { status: 400 });
  }
  if (data.lastName !== undefined && (typeof data.lastName !== 'string' || data.lastName.trim() === '')) {
    return NextResponse.json({ error: "Last name must be a non-empty string" }, { status: 400 });
  }
  if (data.email !== undefined && (typeof data.email !== 'string' || data.email.trim() === '' || !data.email.includes('@'))) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (data.bio !== undefined && typeof data.bio !== 'string') {
    return NextResponse.json({ error: "Bio must be a string" }, { status: 400 });
  }

  // In a real app, this would be tied to the logged-in user.
  // Here we'll just update the first settings record, or create it if it doesn't exist.

  let settings = await prisma.adminSettings.findFirst();

  if (settings) {
    settings = await prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        bio: data.bio,
        emailAlerts: data.emailAlerts,
        orderNotifs: data.orderNotifs,
        marketingUpdates: data.marketingUpdates,
      },
    });
  } else {
    settings = await prisma.adminSettings.create({
      data: {
        firstName: data.firstName || "Admin",
        lastName: data.lastName || "User",
        email: data.email || "admin@example.com",
        bio: data.bio || "",
        emailAlerts: data.emailAlerts ?? true,
        orderNotifs: data.orderNotifs ?? true,
        marketingUpdates: data.marketingUpdates ?? false,
      },
    });
  }

  return NextResponse.json(settings);
}, "Failed to update settings"));
