import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import { logger } from "@/lib/logger";
import {
  checkRateLimit,
  getClientIp,
  MAX_PHONE_ORDERS_PER_HOUR,
  PHONE_ORDER_WINDOW_MS,
} from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation";

export const POST = apiHandler(async function POST(req: NextRequest) {
  // CSRF protection: Origin / Referer must match Host (fail-closed).
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  const parseHost = (value: string | null): string | null => {
    if (!value) return null;
    try {
      return new URL(value).host;
    } catch {
      return null;
    }
  };

  // Fall back to deriving host from req.url when the Host header is absent
  let effectiveHost = host;
  if (!effectiveHost) {
    try {
      effectiveHost = new URL(req.url).host;
    } catch {
      effectiveHost = null;
    }
  }

  const requestHost = parseHost(origin) ?? parseHost(referer);
  if (!requestHost || !effectiveHost || requestHost !== effectiveHost) {
    return NextResponse.json({ error: "Forbidden: cross-origin request" }, { status: 403 });
  }

  // Rate limiting to prevent checkout spam
  const ip = getClientIp(req);
  const isAllowed = await checkRateLimit(`order:${ip}`);
  if (!isAllowed) {
    return NextResponse.json({ error: "Too many checkout requests. Please try again later." }, { status: 429 });
  }

  const data = await req.json();
  const validationResult = checkoutSchema.safeParse(data);
  if (!validationResult.success) {
    // Surface our own static field message (never internals) so users see
    // e.g. "Quantity cannot exceed 10 per item" instead of a generic failure.
    const firstIssue = validationResult.error.issues[0]?.message;
    return NextResponse.json(
      { error: firstIssue || "Missing required fields or empty cart" },
      { status: 400 }
    );
  }

  const { name, phone, email, zila, upozila, shippingAddress, items, idempotencyKey, companyWebsite } = validationResult.data;

  // Honeypot: the hidden "companyWebsite" field is never filled by humans.
  // A non-empty value means an automated client submitted the form.
  if (companyWebsite && companyWebsite.trim() !== "") {
    logger.warn("Checkout honeypot triggered", { ip });
    return NextResponse.json({ error: "Failed to process order. Please try again." }, { status: 400 });
  }

  // Per-phone velocity limit: fake-order scams rotate IPs but reuse (or
  // flood) target phone numbers. Runs before any DB work so abuse is cheap
  // to reject. Retries of a legitimately failed checkout still fit in budget.
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length > 0) {
    const phoneAllowed = await checkRateLimit(
      `order-phone:${phoneDigits}`,
      MAX_PHONE_ORDERS_PER_HOUR,
      PHONE_ORDER_WINDOW_MS
    );
    if (!phoneAllowed) {
      logger.warn("Checkout phone velocity limit hit", { ip });
      return NextResponse.json(
        { error: "Too many orders from this phone number. Please contact us or try again later." },
        { status: 429 }
      );
    }
  }

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

  // Strips a trailing variant label like " (8 oz (220g) - Single Wick)" so
  // legacy carts that stored suffixed names still resolve to the base product.
  const baseName = (value: string): string =>
    value.replace(/\s*\([^()]*\)\s*$/, "").trim();

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

      let calculatedTotalCents = 0;
      for (const item of items) {
        if (!item.id || !item.quantity || item.quantity <= 0) {
           throw new Error(`Invalid item structure for ${item.name || 'unknown item'}`);
        }

        let dbProduct = dbProducts.get(item.id);

        if (!dbProduct && item.name) {
          // Fallback to name-based lookup if ID changed across DB resets.
          // Compare against the base name (variant suffix stripped).
          const lookupName = baseName(item.name);
          dbProduct = Array.from(dbProducts.values()).find(p => p.name === lookupName);

          if (!dbProduct && lookupName !== item.name.trim()) {
             // Fallback to DB query only if not pre-fetched
             dbProduct = (await tx.product.findFirst({
               where: { name: lookupName }
             })) || undefined;
          }
          if (!dbProduct) {
            dbProduct = (await tx.product.findFirst({
              where: { name: item.name.trim() }
            })) || undefined;
          }
          if (dbProduct) {
             dbProducts.set(dbProduct.id, dbProduct);
             stockTracker.set(dbProduct.id, dbProduct.stock);
          }
        }

        if (!dbProduct) {
          throw new Error(`Product not found: ${item.name || item.id}`);
        }

        // Ensure we're using the correct current ID from the DB
        item.id = dbProduct.id;
        // Store money as a plain number inside the serialized items JSON
        item.price = Number(dbProduct.price);

        const currentStock = stockTracker.get(dbProduct.id) ?? dbProduct.stock;

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${dbProduct.name}.`);
        }

        // Update in-memory tracker
        stockTracker.set(item.id, currentStock - item.quantity);

        // Accumulate stock updates
        stockUpdates.set(item.id, (stockUpdates.get(item.id) || 0) + item.quantity);

        // Calculate total securely from DB prices, accumulated in integer
        // cents to avoid binary floating-point drift.
        calculatedTotalCents += Math.round(Number(dbProduct.price) * 100) * item.quantity;
      }

      const calculatedTotal = calculatedTotalCents / 100;

      // Sanity ceiling against bulk fake orders / client bugs. The real
      // defense is DB-side pricing; this only blocks absurd aggregate totals.
      const maxOrderTotalRaw = process.env.MAX_ORDER_TOTAL ?? "";
      const maxOrderTotal = Number(maxOrderTotalRaw);
      if (maxOrderTotalRaw !== "" && !Number.isFinite(maxOrderTotal)) {
        // Misconfigured value would otherwise silently disable the ceiling.
        logger.warn("MAX_ORDER_TOTAL is set but not a valid number; ceiling disabled", {
          raw: maxOrderTotalRaw,
        });
      }
      if (Number.isFinite(maxOrderTotal) && maxOrderTotal > 0 && calculatedTotal > maxOrderTotal) {
        throw new Error("Order total exceeds the maximum allowed for a single order.");
      }

      // Perform consolidated stock updates and verify stock limits inside the write transaction
      for (const [productId, quantity] of stockUpdates.entries()) {
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } }
        });

        if (updatedProduct.stock < 0) {
          throw new Error(`Insufficient stock for ${updatedProduct.name}.`);
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
    const err = error as { message?: string; code?: string };

    // Idempotency race: a concurrent request with the same key already
    // created the order (unique violation). Report success with the
    // original order instead of a misleading failure.
    if (idempotencyKey && err?.code === "P2002") {
      try {
        const existingOrder = await prisma.order.findUnique({
          where: { idempotencyKey }
        });
        if (existingOrder) {
          return NextResponse.json({ success: true, orderId: existingOrder.id, message: "Order already processed" });
        }
      } catch {
        // fall through to generic handling below
      }
    }

    // Only forward whitelisted, user-facing business messages; anything else
    // (e.g. Prisma internals) is logged server-side and returned generically.
    const message = err?.message || "";
    const SAFE_MESSAGES = [
      "Insufficient stock",
      "Product not found:",
      "Invalid item structure",
      "Order total exceeds the maximum allowed",
    ];
    if (SAFE_MESSAGES.some((prefix) => message.startsWith(prefix))) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    logger.error("Order failed:", { error: message });
    return NextResponse.json({ error: "Failed to process order. Please try again." }, { status: 400 });
  }
}, "Failed to create order");
