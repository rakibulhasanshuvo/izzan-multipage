"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { checkAdminAuth } from "@/lib/auth";

async function ensureAdmin() {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const adminToken = process.env.ADMIN_TOKEN;
    if (!token || !adminToken || token !== adminToken) {
      throw new Error("Unauthorized");
    }
  }
}

export async function updateOrderStatus(id: string, status: string) {
  await ensureAdmin();
  if (!id || !status || typeof status !== "string" || status.trim() === "") {
    throw new Error("Invalid input");
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id }
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: status.trim() },
  });

  revalidatePath("/admin/orders");
  return order;
}

export async function deleteProduct(id: string) {
  await ensureAdmin();
  if (!id) throw new Error("Missing product ID");

  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name must be a non-empty string"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Invalid price"),
  originalPrice: z.coerce.number().nullable().optional(),
  img: z.string().optional(),
  hoverImg: z.string().optional().nullable(),
  categories: z.string().optional(),
  badge: z.string().optional().nullable(),
  stock: z.coerce.number().min(0, "Invalid stock"),
});

const ProductUpdateSchema = ProductSchema.partial().extend({
  id: z.string().min(1, "Missing product ID")
});

export async function createProduct(data: unknown) {
  await ensureAdmin();
  const parsed = ProductSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Missing required fields or invalid data");
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      originalPrice: parsed.data.originalPrice || null,
      img: parsed.data.img || "",
      hoverImg: parsed.data.hoverImg || null,
      categories: parsed.data.categories || "",
      badge: parsed.data.badge || null,
      stock: parsed.data.stock,
    },
  });

  revalidatePath("/admin/products");
  return product;
}

export async function updateProduct(data: unknown) {
  await ensureAdmin();
  const parsed = ProductUpdateSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Missing product ID or invalid data");
  }

  const { id, ...updateFields } = parsed.data;

  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) throw new Error("Product not found");

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...updateFields,
      description: updateFields.description !== undefined ? updateFields.description || null : undefined,
      originalPrice: updateFields.originalPrice !== undefined ? updateFields.originalPrice || null : undefined,
      hoverImg: updateFields.hoverImg !== undefined ? updateFields.hoverImg || null : undefined,
      badge: updateFields.badge !== undefined ? updateFields.badge || null : undefined,
    },
  });

  revalidatePath("/admin/products");
  return product;
}

const SettingsSchema = z.object({
  firstName: z.string().min(1, "First name must be a non-empty string").optional(),
  lastName: z.string().min(1, "Last name must be a non-empty string").optional(),
  email: z.string().email("Valid email is required").optional(),
  bio: z.string().optional(),
  emailAlerts: z.boolean().optional(),
  orderNotifs: z.boolean().optional(),
  marketingUpdates: z.boolean().optional(),
});

export async function updateSettings(data: unknown) {
  await ensureAdmin();
  const parsed = SettingsSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid settings data");
  }

  let settings = await prisma.adminSettings.findFirst();

  if (settings) {
    settings = await prisma.adminSettings.update({
      where: { id: settings.id },
      data: parsed.data,
    });
  } else {
    settings = await prisma.adminSettings.create({
      data: {
        firstName: parsed.data.firstName || "Admin",
        lastName: parsed.data.lastName || "User",
        email: parsed.data.email || "admin@example.com",
        bio: parsed.data.bio || "",
        emailAlerts: parsed.data.emailAlerts ?? true,
        orderNotifs: parsed.data.orderNotifs ?? true,
        marketingUpdates: parsed.data.marketingUpdates ?? false,
      },
    });
  }

  revalidatePath("/admin/settings");
  return settings;
}

export async function updateCMSContent(id: string, value: string) {
  await ensureAdmin();
  if (!id || value === undefined || (typeof value === "string" && value.trim() === "")) {
    throw new Error("Missing required fields");
  }
  const content = await prisma.cMSContent.update({
    where: { id },
    data: { value: String(value) },
  });

  revalidatePath("/admin/cms");
  revalidatePath("/");
  return content;
}
