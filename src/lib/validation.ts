import { z } from "zod";

// --- Shared Order Status Whitelist ---
export const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// --- Checkout Order Validation ---
export const MAX_QUANTITY_PER_ITEM = 10;

export const checkoutItemSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
  name: z.string().trim().max(200, "Item name is too long").optional(),
  variant: z.string().trim().max(100, "Variant is too long").optional(),
  quantity: z
    .number()
    .int()
    .positive("Quantity must be a positive integer")
    .max(MAX_QUANTITY_PER_ITEM, `Quantity cannot exceed ${MAX_QUANTITY_PER_ITEM} per item`),
  price: z.number().optional(),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[+]?[\d\s\-().]{7,20}$/, "Invalid phone number"),
  email: z.string().trim().email("Invalid email address").optional().nullable().or(z.literal("")),
  zila: z.string().trim().min(1, "Zila is required").max(120),
  upozila: z.string().trim().min(1, "Upozila is required").max(120),
  shippingAddress: z.string().trim().min(1, "Shipping address is required").max(500, "Address is too long"),
  idempotencyKey: z.string().max(128).optional().nullable(),
  // Honeypot: hidden client-side field that only bots fill in. Accepted here
  // so the payload shape stays stable; the orders route rejects non-empty values.
  companyWebsite: z.string().max(200).optional().nullable(),
  items: z.array(checkoutItemSchema).min(1, "Cart cannot be empty").max(50, "Too many items in cart"),
});

// --- Admin Product Validation ---
export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().optional().nullable(),
    price: z.coerce.number().nonnegative("Price must be a non-negative number"),
    originalPrice: z.preprocess(val => val === '' ? null : val, z.coerce.number().nonnegative().optional().nullable()),
    img: z.string().trim().min(1, "Image URL/path is required"),
    hoverImg: z.string().trim().optional().nullable(),
    categories: z.string().trim().min(1, "Categories are required"),
    badge: z.string().trim().optional().nullable(),
    stock: z.coerce.number().int().nonnegative("Stock must be a non-negative integer"),
  })
  .superRefine((data, ctx) => {
    if (data.originalPrice != null && data.originalPrice <= data.price) {
      ctx.addIssue({
        code: "custom",
        message: "Compare-at price must be greater than the regular price",
        path: ["originalPrice"],
      });
    }
  });

export const updateProductSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    if (data.originalPrice != null && data.price != null && data.originalPrice <= data.price) {
      ctx.addIssue({
        code: "custom",
        message: "Compare-at price must be greater than the regular price",
        path: ["originalPrice"],
      });
    }
  });

// --- Client Checkout Form (subset of checkoutSchema submitted to the API) ---
export const checkoutFormSchema = checkoutSchema.pick({
  name: true,
  phone: true,
  email: true,
  zila: true,
  upozila: true,
  shippingAddress: true,
});
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// --- Contact Form ---
export const contactFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  contactEmail: z.string().trim().email("Invalid email address"),
  subject: z.enum(["General Inquiry", "Wholesale", "Shipping Question", "Other"]),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be under 2000 characters"),
  // Honeypot: hidden client-side field that only bots fill in.
  companyWebsite: z.string().max(200).optional().nullable(),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

// --- Newsletter Signup ---
export const newsletterSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(254),
  // Honeypot: hidden client-side field that only bots fill in.
  companyWebsite: z.string().max(200).optional().nullable(),
});
export type NewsletterValues = z.infer<typeof newsletterSchema>;

// --- Admin Login Form ---
export const loginFormSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

// --- Admin Product Editor Form (reuses createProductSchema; same fields apply when updating) ---
export const productFormSchema = createProductSchema;
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;

// --- Admin Settings Forms ---
export const settingsProfileFormSchema = z.object({
  // Mirrors the server schema (actions.ts) so clearing a name surfaces a
  // field-level error here instead of a generic server rejection.
  firstName: z.string().trim().min(1, "First name must be a non-empty string"),
  lastName: z.string().trim().min(1, "Last name must be a non-empty string"),
  email: z.string().trim().email("Invalid email address").or(z.literal("")),
  bio: z.string(),
  emailAlerts: z.boolean(),
  orderNotifs: z.boolean(),
  marketingUpdates: z.boolean(),
  avatarUrl: z.string(),
});
export type SettingsProfileFormValues = z.infer<typeof settingsProfileFormSchema>;

export const securityFormSchema = z
  .object({
    username: z.string().trim().min(1, "Username is required"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => !data.newPassword || data.newPassword.length >= 8, {
    message: "New password must be at least 8 characters",
    path: ["newPassword"],
  });
export type SecurityFormValues = z.infer<typeof securityFormSchema>;

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
