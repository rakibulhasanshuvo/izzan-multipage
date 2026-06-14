import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import { createCustomerSchema, updateCustomerSchema } from "@/lib/validation";

export const POST = withAuth(apiHandler(async function POST(req: NextRequest) {
  const data = await req.json();
  const validationResult = createCustomerSchema.safeParse(data);
  if (!validationResult.success) {
    const error = validationResult.error.issues[0];
    if (error.path.includes("name") || error.path.includes("phone")) {
      return NextResponse.json({ error: "Missing required fields (name, phone)" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const validatedData = validationResult.data;
  const customer = await prisma.customer.create({
    data: {
      name: validatedData.name,
      email: validatedData.email || null,
      phone: validatedData.phone,
      zila: validatedData.zila || "",
      upozila: validatedData.upozila || "",
      location: validatedData.location || null,
      tier: validatedData.tier || "Bronze",
      totalSpend: validatedData.totalSpend || 0,
    },
  });
  return NextResponse.json(customer);
}, "Failed to create customer"));

export const PATCH = withAuth(apiHandler(async function PATCH(req: NextRequest) {
  const data = await req.json();
  
  if (!data.id) {
    return NextResponse.json({ error: "Missing customer ID" }, { status: 400 });
  }

  const validationResult = updateCustomerSchema.safeParse(data);
  if (!validationResult.success) {
    const error = validationResult.error.issues[0];
    let msg = error.message;
    if (error.path.includes("name")) msg = "Name must be a non-empty string";
    if (error.path.includes("email")) msg = "Invalid email";
    if (error.path.includes("totalSpend")) msg = "Invalid total spend";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const validatedData = validationResult.data;
  const updateFields: Record<string, unknown> = {};

  if (validatedData.name !== undefined) updateFields.name = validatedData.name;
  if (validatedData.phone !== undefined) updateFields.phone = validatedData.phone;
  if (validatedData.email !== undefined) updateFields.email = validatedData.email;
  if (validatedData.zila !== undefined) updateFields.zila = validatedData.zila;
  if (validatedData.upozila !== undefined) updateFields.upozila = validatedData.upozila;
  if (validatedData.location !== undefined) updateFields.location = validatedData.location;
  if (validatedData.tier !== undefined) updateFields.tier = validatedData.tier;
  if (validatedData.totalSpend !== undefined) updateFields.totalSpend = validatedData.totalSpend;

  const existingCustomer = await prisma.customer.findUnique({
    where: { id: data.id }
  });

  if (!existingCustomer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const customer = await prisma.customer.update({
    where: { id: data.id },
    data: updateFields,
  });

  return NextResponse.json(customer);
}, "Failed to update customer"));
