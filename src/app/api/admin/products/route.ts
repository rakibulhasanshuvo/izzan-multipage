import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiHandler } from "@/lib/api";

export const GET = withAuth(apiHandler(async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _url = req.url;
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(products);
}, "Failed to fetch products"));

export const POST = withAuth(apiHandler(async function POST(req: NextRequest) {
  const data = await req.json();
  if (!data.name || !data.price || data.stock === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
      img: data.img,
      hoverImg: data.hoverImg,
      categories: data.categories,
      badge: data.badge,
      stock: parseInt(data.stock),
    },
  });
  return NextResponse.json(product);
}, "Failed to create product"));

export const PATCH = withAuth(apiHandler(async function PATCH(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;

  if (!id) {
    return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
  }

  const updateFields: Record<string, unknown> = {};

  if (updateData.name !== undefined) {
    if (typeof updateData.name !== "string" || updateData.name.trim() === "") {
      return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
    }
    updateFields.name = updateData.name.trim();
  }

  if (updateData.description !== undefined) updateFields.description = updateData.description;

  if (updateData.price !== undefined) {
    const parsedPrice = parseFloat(updateData.price);
    if (isNaN(parsedPrice)) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    updateFields.price = parsedPrice;
  }

  if (updateData.originalPrice !== undefined) {
    if (updateData.originalPrice) {
      const parsedOriginalPrice = parseFloat(updateData.originalPrice);
      if (isNaN(parsedOriginalPrice)) {
        return NextResponse.json({ error: "Invalid original price" }, { status: 400 });
      }
      updateFields.originalPrice = parsedOriginalPrice;
    } else {
      updateFields.originalPrice = null;
    }
  }

  if (updateData.img !== undefined) updateFields.img = updateData.img;
  if (updateData.hoverImg !== undefined) updateFields.hoverImg = updateData.hoverImg;
  if (updateData.categories !== undefined) updateFields.categories = updateData.categories;
  if (updateData.badge !== undefined) updateFields.badge = updateData.badge;

  if (updateData.stock !== undefined) {
    const parsedStock = parseInt(updateData.stock, 10);
    if (isNaN(parsedStock)) {
      return NextResponse.json({ error: "Invalid stock" }, { status: 400 });
    }
    updateFields.stock = parsedStock;
  }

  // Prevent IDOR or update of non-existent record gracefully
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = await prisma.product.update({
    where: { id },
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
