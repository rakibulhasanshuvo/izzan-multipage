import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";

export const POST = withAuth(apiHandler(async function POST(req: NextRequest) {
  const data = await req.json();
  if (!data.name || !data.email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      location: data.location || null,
      tier: data.tier || "Bronze",
      totalSpend: data.totalSpend ? parseFloat(data.totalSpend) : 0,
    },
  });
  return NextResponse.json(customer);
}, "Failed to create customer"));

export const PATCH = withAuth(apiHandler(async function PATCH(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;

  if (!id) {
    return NextResponse.json({ error: "Missing customer ID" }, { status: 400 });
  }

  const updateFields: Record<string, unknown> = {};

  if (updateData.name !== undefined) {
    if (typeof updateData.name !== "string" || updateData.name.trim() === "") {
      return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
    }
    updateFields.name = updateData.name.trim();
  }

  if (updateData.email !== undefined) {
    if (typeof updateData.email !== "string" || updateData.email.trim() === "" || !updateData.email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    updateFields.email = updateData.email.trim();
  }

  if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
  if (updateData.location !== undefined) updateFields.location = updateData.location;
  if (updateData.tier !== undefined) updateFields.tier = updateData.tier;

  if (updateData.totalSpend !== undefined) {
    const parsedSpend = parseFloat(updateData.totalSpend);
    if (isNaN(parsedSpend)) {
      return NextResponse.json({ error: "Invalid total spend" }, { status: 400 });
    }
    updateFields.totalSpend = parsedSpend;
  }

  const existingCustomer = await prisma.customer.findUnique({
    where: { id }
  });

  if (!existingCustomer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: updateFields,
  });

  return NextResponse.json(customer);
}, "Failed to update customer"));
