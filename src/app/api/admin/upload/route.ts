import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import sharp from "sharp";

// Magic number check for basic images/videos
function isValidFileType(buffer: Buffer): boolean {
  const hex = buffer.toString('hex', 0, 4);
  // JPEG
  if (hex.startsWith('ffd8ff')) return true;
  // PNG
  if (hex.startsWith('89504e47')) return true;
  // GIF
  if (hex.startsWith('47494638')) return true;
  // WEBP
  if (hex.startsWith('52494646')) return true;
  // MP4
  if (buffer.toString('hex', 4, 8) === '66747970') return true;
  // WebM
  if (hex.startsWith('1a45dfa3')) return true;
  return false;
}

export const POST = withAuth(apiHandler(async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
  if (!allowedMimeTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Please upload an image or video." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  let buffer: Buffer = Buffer.from(arrayBuffer);

  if (!isValidFileType(buffer)) {
    return NextResponse.json({ error: "Invalid file content. Spoofing detected." }, { status: 400 });
  }

  // If it is an image (not a video), compress using sharp
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    const compressedBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true }) // Prevent extremely large images
      .webp({ quality: 80 }) // Convert/compress to WebP
      .toBuffer();
    buffer = compressedBuffer as unknown as Buffer;
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  let ext = path.extname(file.name);
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    ext = ".webp";
  }
  const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${cleanName}_${uniqueSuffix}${ext}`;

  if (process.env.STORAGE_PROVIDER === "vercel") {
    // Vercel Blob Upload
    const blob = await put(filename, file, { access: 'public' });
    return NextResponse.json({ success: true, url: blob.url });
  } else {
    // Local File System Upload
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  }
}, "Failed to upload file"));
