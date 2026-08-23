import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { serializeOrder } from "@/lib/serialize";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/validation";
import {
  updateOrderStatusWithLifecycle,
  OrderLifecycleError,
} from "@/lib/order-lifecycle";

export const PATCH = withAuth(apiHandler(async function PATCH(req: NextRequest) {
  const data = await req.json();
  const { id, status } = data;

  if (!id) {
    return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
  }

  if (!status || typeof status !== "string" || !ORDER_STATUSES.includes(status.trim() as OrderStatus)) {
    return NextResponse.json({ error: `Invalid order status. Must be one of: ${ORDER_STATUSES.join(", ")}` }, { status: 400 });
  }

  try {
    const order = await updateOrderStatusWithLifecycle(id, status.trim() as OrderStatus);

    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return NextResponse.json(serializeOrder(order));
  } catch (error: unknown) {
    if (error instanceof OrderLifecycleError) {
      const isNotFound = error.message === "Order not found";
      return NextResponse.json({ error: error.message }, { status: isNotFound ? 404 : 400 });
    }
    throw error;
  }
}, "Failed to update order"));
