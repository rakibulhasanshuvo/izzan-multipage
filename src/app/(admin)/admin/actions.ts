"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkAdminAuth } from "@/lib/auth";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

async function ensureAdmin() {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
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

export async function updateOrderTracking(
  id: string,
  trackingNumber: string | null | undefined,
  trackingCarrier: string | null | undefined
) {
  await ensureAdmin();
  if (!id) {
    throw new Error("Invalid input: Missing ID");
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id }
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      trackingNumber: trackingNumber ? trackingNumber.trim() : null,
      trackingCarrier: trackingCarrier ? trackingCarrier.trim() : null,
    },
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
  originalPrice: z.preprocess(val => val === '' ? null : val, z.coerce.number().nonnegative().nullable().optional()),
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
  if (!id || value === undefined) {
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

const CredentialsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newUsername: z.string().min(1, "New username is required").optional(),
  newPassword: z.string().optional(),
});

export async function updateAdminCredentials(data: unknown) {
  await ensureAdmin();

  const parsed = CredentialsSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid credentials data");
  }

  const { currentPassword, newUsername, newPassword } = parsed.data;

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }
  const adminId = session.user.id;

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });

  if (!admin) {
    throw new Error("Admin not found");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
  if (!isPasswordValid) {
    throw new Error("Incorrect current password");
  }

  const updateData: { username?: string; password?: string } = {};

  if (newUsername && newUsername.trim() !== "") {
    // Check if new username is already taken by another admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: newUsername }
    });
    if (existingAdmin && existingAdmin.id !== admin.id) {
      throw new Error("Username already taken");
    }
    updateData.username = newUsername.trim();
  }

  if (newPassword && newPassword.trim() !== "") {
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long");
    }
    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: updateData,
    });
  }

  return { success: true };
}
