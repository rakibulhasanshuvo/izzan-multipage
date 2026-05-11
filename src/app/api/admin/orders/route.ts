import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";

export const PATCH = withAuth(apiHandler(async function PATCH(req: NextRequest) {
  const data = await req.json();
  const { id, status } = data;

  if (!id) {
    return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
  }

  if (status === undefined || typeof status !== "string" || status.trim() === "") {
    return NextResponse.json({ error: "Status must be a non-empty string" }, { status: 400 });
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id }
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: status.trim() },
  });

  return NextResponse.json(order);
}, "Failed to update order"));
