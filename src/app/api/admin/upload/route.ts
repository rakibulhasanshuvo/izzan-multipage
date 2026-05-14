import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { promises as fs } from "fs";
import path from "path";

export const POST = withAuth(apiHandler(async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type (images/videos)
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
  if (!allowedMimeTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Please upload an image or video." }, { status: 400 });
  }

  // Ensure public/uploads directory exists
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  // Generate safe unique filename
  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.name);
  const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${cleanName}_${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadsDir, filename);

  await fs.writeFile(filePath, buffer);

  const fileUrl = `/uploads/${filename}`;
  return NextResponse.json({ success: true, url: fileUrl });
}, "Failed to upload file"));
