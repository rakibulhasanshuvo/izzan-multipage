"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkAdminAuth } from "@/lib/auth";
import {
  ORDER_STATUSES,
  type OrderStatus,
  createProductSchema,
  updateProductSchema,
} from "@/lib/validation";
import {
  updateOrderStatusWithLifecycle,
  OrderLifecycleError,
} from "@/lib/order-lifecycle";
import { sanitizeCmsValue } from "@/lib/sanitize";
import { serializeOrder, serializeProduct } from "@/lib/serialize";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

async function ensureAdmin() {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }
}

// Optional string columns: an explicitly submitted empty value clears the
// column (null) instead of storing "". Falsy values like 0 are preserved.
function emptyToNull(value: string | null | undefined): string | null | undefined {
  return value === undefined ? undefined : value === "" ? null : value;
}

export async function updateOrderStatus(id: string, status: string) {
  await ensureAdmin();
  if (
    !id ||
    !status ||
    typeof status !== "string" ||
    !ORDER_STATUSES.includes(status.trim() as OrderStatus)
  ) {
    throw new Error(`Invalid input. Status must be one of: ${ORDER_STATUSES.join(", ")}`);
  }

  try {
    const order = await updateOrderStatusWithLifecycle(id, status.trim() as OrderStatus);

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return serializeOrder(order);
  } catch (error: unknown) {
    if (error instanceof OrderLifecycleError) {
      throw new Error(error.message);
    }
    throw error;
  }
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
  revalidatePath("/admin");
  return serializeOrder(order);
}

export async function deleteProduct(id: string) {
  await ensureAdmin();
  if (!id) throw new Error("Missing product ID");

  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/admin/products");
  // Keep the ISR storefront catalog in sync with inventory changes
  revalidatePath("/");
  revalidatePath("/shop");
  return { success: true };
}

export async function createProduct(data: unknown) {
  await ensureAdmin();
  const parsed = createProductSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Missing required fields or invalid data");
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      description: emptyToNull(parsed.data.description) ?? null,
      price: parsed.data.price,
      originalPrice: parsed.data.originalPrice ?? null,
      img: parsed.data.img,
      hoverImg: emptyToNull(parsed.data.hoverImg) ?? null,
      categories: parsed.data.categories,
      badge: emptyToNull(parsed.data.badge) ?? null,
      stock: parsed.data.stock,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  return serializeProduct(product);
}

export async function updateProduct(data: unknown) {
  await ensureAdmin();
  const parsed = updateProductSchema.safeParse(data);
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
      name: updateFields.name,
      description: emptyToNull(updateFields.description),
      price: updateFields.price,
      // 0 is a legitimate sale-price value and must survive the update
      originalPrice: updateFields.originalPrice,
      img: updateFields.img,
      hoverImg: emptyToNull(updateFields.hoverImg),
      categories: updateFields.categories,
      badge: emptyToNull(updateFields.badge),
      stock: updateFields.stock,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  return serializeProduct(product);
}

const SettingsSchema = z.object({
  firstName: z.string().min(1, "First name must be a non-empty string").optional(),
  lastName: z.string().min(1, "Last name must be a non-empty string").optional(),
  // Empty string = "no change" (the column is NOT NULL + unique in the DB)
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  bio: z.string().optional(),
  emailAlerts: z.boolean().optional(),
  orderNotifs: z.boolean().optional(),
  marketingUpdates: z.boolean().optional(),
  avatarUrl: z.string().optional().nullable(),
});

export async function updateSettings(data: unknown) {
  await ensureAdmin();
  const parsed = SettingsSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid settings data");
  }

  // "" means the field was cleared client-side; since AdminSettings.email is
  // NOT NULL we treat that as "keep current value" rather than failing.
  const { email, ...settingsFields } = parsed.data;
  const updateData: typeof settingsFields & { email?: string } = { ...settingsFields };
  if (email) {
    updateData.email = email;
  }

  let settings = await prisma.adminSettings.findFirst();

  try {
    if (settings) {
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      settings = await prisma.adminSettings.create({
        data: {
          firstName: parsed.data.firstName || "Admin",
          lastName: parsed.data.lastName || "User",
          email: email || "admin@example.com",
          bio: parsed.data.bio || "",
          emailAlerts: parsed.data.emailAlerts ?? true,
          orderNotifs: parsed.data.orderNotifs ?? true,
          marketingUpdates: parsed.data.marketingUpdates ?? false,
          // Without this, a first-save on a fresh install silently drops the
          // avatar that was just uploaded.
          avatarUrl: parsed.data.avatarUrl || null,
        },
      });
    }
  } catch (error: unknown) {
    // Unique constraint violation on the settings email
    const err = error as { code?: string };
    if (err?.code === "P2002") {
      throw new Error("This email is already in use");
    }
    throw error;
  }

  revalidatePath("/admin/settings");
  return settings;
}

export async function updateCMSContent(id: string, value: string) {
  await ensureAdmin();
  if (!id || value === undefined) {
    throw new Error("Missing required fields");
  }
  // Sanitize HTML before storing — same policy as the /api/admin/cms route
  const content = await prisma.cMSContent.update({
    where: { id },
    data: { value: sanitizeCmsValue(String(value)) },
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
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: updateData,
    });
  }

  return { success: true };
}
