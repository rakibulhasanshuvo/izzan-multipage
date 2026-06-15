import { z } from "zod";

// --- Checkout Order Validation ---
export const checkoutItemSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
  name: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  price: z.number().optional(),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  email: z.string().trim().email("Invalid email address").optional().nullable().or(z.literal("")),
  zila: z.string().trim().min(1, "Zila is required"),
  upozila: z.string().trim().min(1, "Upozila is required"),
  shippingAddress: z.string().trim().min(1, "Shipping address is required"),
  idempotencyKey: z.string().optional().nullable(),
  items: z.array(checkoutItemSchema).min(1, "Cart cannot be empty"),
});

// --- Admin Product Validation ---
export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().nonnegative("Price must be a non-negative number"),
  originalPrice: z.preprocess(val => val === '' ? null : val, z.coerce.number().nonnegative().optional().nullable()),
  img: z.string().trim().min(1, "Image URL/path is required"),
  hoverImg: z.string().trim().optional().nullable(),
  categories: z.string().trim().min(1, "Categories are required"),
  badge: z.string().trim().optional().nullable(),
  stock: z.coerce.number().int().nonnegative("Stock must be a non-negative integer"),
});

export const updateProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().trim().min(1, "Name must be a non-empty string").optional(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().nonnegative("Price must be a non-negative number").optional(),
  originalPrice: z.preprocess(val => val === '' ? null : val, z.coerce.number().nonnegative().optional().nullable()),
  img: z.string().trim().min(1, "Image must be a non-empty string").optional(),
  hoverImg: z.string().trim().optional().nullable(),
  categories: z.string().trim().min(1, "Categories must be a non-empty string").optional(),
  badge: z.string().trim().optional().nullable(),
  stock: z.coerce.number().int().nonnegative("Stock must be a non-negative integer").optional(),
});

// --- Admin Customer Validation ---
export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  email: z.string().trim().email("Invalid email address").optional().nullable().or(z.literal("")),
  zila: z.string().trim().optional().nullable(),
  upozila: z.string().trim().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  tier: z.string().trim().optional(),
  totalSpend: z.coerce.number().nonnegative("Total spend must be a non-negative number").optional(),
});

export const updateCustomerSchema = z.object({
  id: z.string().min(1, "Customer ID is required"),
  name: z.string().trim().min(1, "Name must be a non-empty string").optional(),
  phone: z.string().trim().min(1, "Phone number must be a non-empty string").optional(),
  email: z.string().trim().email("Invalid email address").optional().nullable().or(z.literal("")),
  zila: z.string().trim().optional(),
  upozila: z.string().trim().optional(),
  location: z.string().trim().optional().nullable(),
  tier: z.string().trim().optional(),
  totalSpend: z.coerce.number().nonnegative("Total spend must be a non-negative number").optional(),
});
