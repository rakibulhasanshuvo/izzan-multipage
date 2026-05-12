import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";

export const POST = apiHandler(async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, phone, email, zila, upozila, shippingAddress, items, totalAmount } = data;

  if (!name || !phone || !zila || !upozila || !shippingAddress || !items || totalAmount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Find or create customer by phone
  let customer = await prisma.customer.findUnique({
    where: { phone }
  });

  if (!customer && email) {
    // try to find by email if they provided one but phone wasn't found
    const customerByEmail = await prisma.customer.findUnique({
       where: { email }
    });
    if (customerByEmail) {
       customer = customerByEmail;
    }
  }

  const locationStr = `${shippingAddress}, ${upozila}, ${zila}`;

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        zila,
        upozila,
        location: locationStr,
        totalSpend: parseFloat(totalAmount),
      }
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name,
        email: email || customer.email,
        zila,
        upozila,
        location: locationStr,
        totalSpend: customer.totalSpend + parseFloat(totalAmount),
      }
    });
  }

  const order = await prisma.order.create({
    data: {
      customerName: name,
      customerEmail: email || null,
      customerPhone: phone,
      zila,
      upozila,
      shippingAddress,
      items: JSON.stringify(items),
      totalAmount: parseFloat(totalAmount),
      customerId: customer.id,
      status: "Pending",
    }
  });

  return NextResponse.json({ success: true, orderId: order.id });
}, "Failed to create order");
