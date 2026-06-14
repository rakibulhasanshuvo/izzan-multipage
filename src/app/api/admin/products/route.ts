import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";
import { createProductSchema, updateProductSchema } from "@/lib/validation";

export const GET = withAuth(apiHandler(async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(products);
}, "Failed to fetch products"));

export const POST = withAuth(apiHandler(async function POST(req: NextRequest) {
  const data = await req.json();
  const validationResult = createProductSchema.safeParse(data);
  if (!validationResult.success) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const validatedData = validationResult.data;
  const product = await prisma.product.create({
    data: {
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      originalPrice: validatedData.originalPrice,
      img: validatedData.img,
      hoverImg: validatedData.hoverImg,
      categories: validatedData.categories,
      badge: validatedData.badge,
      stock: validatedData.stock,
    },
  });
  return NextResponse.json(product);
}, "Failed to create product"));

export const PATCH = withAuth(apiHandler(async function PATCH(req: NextRequest) {
  const data = await req.json();
  
  if (!data.id) {
    return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
  }

  const validationResult = updateProductSchema.safeParse(data);
  if (!validationResult.success) {
    const error = validationResult.error.issues[0];
    let msg = error.message;
    if (error.path.includes("name")) msg = "Name must be a non-empty string";
    if (error.path.includes("price")) msg = "Invalid price";
    if (error.path.includes("originalPrice")) msg = "Invalid original price";
    if (error.path.includes("stock")) msg = "Invalid stock";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const validatedData = validationResult.data;
  const updateFields: Record<string, unknown> = {};

  if (validatedData.name !== undefined) updateFields.name = validatedData.name;
  if (validatedData.description !== undefined) updateFields.description = validatedData.description;
  if (validatedData.price !== undefined) updateFields.price = validatedData.price;
  if (validatedData.originalPrice !== undefined) updateFields.originalPrice = validatedData.originalPrice;
  if (validatedData.img !== undefined) updateFields.img = validatedData.img;
  if (validatedData.hoverImg !== undefined) updateFields.hoverImg = validatedData.hoverImg;
  if (validatedData.categories !== undefined) updateFields.categories = validatedData.categories;
  if (validatedData.badge !== undefined) updateFields.badge = validatedData.badge;
  if (validatedData.stock !== undefined) updateFields.stock = validatedData.stock;

  // Prevent IDOR or update of non-existent record gracefully
  const existingProduct = await prisma.product.findUnique({
    where: { id: validatedData.id }
  });

  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = await prisma.product.update({
    where: { id: validatedData.id },
    data: updateFields,
  });
  return NextResponse.json(product);
}, "Failed to update product"));

export const DELETE = withAuth(apiHandler(async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

  await prisma.product.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}, "Failed to delete product"));
