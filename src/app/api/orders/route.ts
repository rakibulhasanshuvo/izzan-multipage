import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation";

export const POST = apiHandler(async function POST(req: NextRequest) {
  // Rate limiting to prevent checkout spam
  const ip = getClientIp(req);
  const isAllowed = await checkRateLimit(`order:${ip}`);
  if (!isAllowed) {
    return NextResponse.json({ error: "Too many checkout requests. Please try again later." }, { status: 429 });
  }

  const data = await req.json();
  const validationResult = checkoutSchema.safeParse(data);
  if (!validationResult.success) {
    return NextResponse.json({ error: "Missing required fields or empty cart" }, { status: 400 });
  }

  const { name, phone, email, zila, upozila, shippingAddress, items, idempotencyKey } = validationResult.data;

  // Idempotency check to prevent duplicate orders
  if (idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey }
    });
    if (existingOrder) {
      return NextResponse.json({ success: true, orderId: existingOrder.id, message: "Order already processed" });
    }
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

  // Handle unique constraint check for email if updating an existing customer
  let finalEmail = email || null;
  if (customer && email && customer.email !== email) {
    const existingEmailCustomer = await prisma.customer.findUnique({
      where: { email }
    });
    if (existingEmailCustomer && existingEmailCustomer.id !== customer.id) {
      // Email is already in use by another customer, skip updating email to prevent unique constraint error
      finalEmail = customer.email;
    }
  }

  const locationStr = `${shippingAddress}, ${upozila}, ${zila}`;

  try {
    const orderResult = await prisma.$transaction(async (tx) => {
      // 1. Price verification & Stock validation
      const productIds = items.map((item: { id: string }) => item.id);
      const dbProductsList = await tx.product.findMany({
        where: { id: { in: productIds } }
      });
      const dbProducts = new Map(dbProductsList.map(p => [p.id, p]));

      // Track in-memory stock to handle multiple entries of same product in one order
      const stockTracker = new Map(dbProductsList.map(p => [p.id, p.stock]));
      // Consolidate stock updates to reduce DB calls
      const stockUpdates = new Map<string, number>();

      let calculatedTotal = 0;
      for (const item of items) {
        if (!item.id || !item.quantity || item.quantity <= 0) {
           throw new Error(`Invalid item structure for ${item.name || 'unknown item'}`);
        }

        let dbProduct = dbProducts.get(item.id);

        if (!dbProduct && item.name) {
          // Fallback to name-based lookup if ID changed across DB resets
          // Look up in our pre-fetched map
          dbProduct = Array.from(dbProducts.values()).find(p => p.name === item.name);

          if (!dbProduct) {
             // Fallback to DB query only if not pre-fetched
             dbProduct = (await tx.product.findFirst({
               where: { name: item.name }
             })) || undefined;
             if (dbProduct) {
                dbProducts.set(dbProduct.id, dbProduct);
                stockTracker.set(dbProduct.id, dbProduct.stock);
             }
          }
        }

        if (!dbProduct) {
          throw new Error(`Product not found: ${item.name || item.id}`);
        }

        // Ensure we're using the correct current ID from the DB
        item.id = dbProduct.id;
        item.price = dbProduct.price; // Update price from DB to avoid mismatched data

        const currentStock = stockTracker.get(dbProduct.id) ?? dbProduct.stock;
        
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${dbProduct.name}. Only ${currentStock} left.`);
        }

        // Update in-memory tracker
        stockTracker.set(item.id, currentStock - item.quantity);

        // Accumulate stock updates
        stockUpdates.set(item.id, (stockUpdates.get(item.id) || 0) + item.quantity);

        // Calculate total securely from DB prices
        calculatedTotal += dbProduct.price * item.quantity;
      }

      // Perform consolidated stock updates and verify stock limits inside the write transaction
      for (const [productId, quantity] of stockUpdates.entries()) {
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } }
        });

        if (updatedProduct.stock < 0) {
          throw new Error(`Insufficient stock for ${updatedProduct.name}. Only ${updatedProduct.stock + quantity} left.`);
        }
      }

      // 2. Customer Upsert
      let txCustomer;
      if (!customer) {
        txCustomer = await tx.customer.create({
          data: {
            name,
            phone,
            email: finalEmail,
            zila: zila || "",
            upozila: upozila || "",
            location: locationStr,
            totalSpend: calculatedTotal,
          }
        });
      } else {
        txCustomer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name,
            email: finalEmail || customer.email,
            zila: zila || customer.zila,
            upozila: upozila || customer.upozila,
            location: locationStr,
            totalSpend: { increment: calculatedTotal },
          }
        });
      }

      // 3. Order Creation
      const txOrder = await tx.order.create({
        data: {
          customerName: name,
          customerEmail: finalEmail,
          customerPhone: phone,
          zila: zila || "",
          upozila: upozila || "",
          shippingAddress: shippingAddress || "",
          items: JSON.stringify(items),
          totalAmount: calculatedTotal,
          customerId: txCustomer.id,
          status: "Pending",
          idempotencyKey: idempotencyKey || null,
        }
      });

      return txOrder;
    });

    return NextResponse.json({ success: true, orderId: orderResult.id });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to process order" }, { status: 400 });
  }
}, "Failed to create order");
