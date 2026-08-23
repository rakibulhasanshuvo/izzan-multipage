import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
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

// Extensions are enforced independently of MIME/magic checks so that a
// crafted file can never be stored as an executable type (e.g. .html)
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm"];

// Per-IP daily upload quota to prevent disk exhaustion
const MAX_DAILY_UPLOAD_BYTES = 500 * 1024 * 1024; // 500 MB / day / IP
// Prune stale entries once the map grows past this size so it cannot grow unbounded
const MAX_QUOTA_MAP_ENTRIES = 1000;
const uploadQuotaMap = new Map<string, { date: string; bytes: number }>();

function pruneStaleQuotas(today: string): void {
  if (uploadQuotaMap.size <= MAX_QUOTA_MAP_ENTRIES) return;
  for (const [ip, record] of uploadQuotaMap) {
    if (record.date !== today) {
      uploadQuotaMap.delete(ip);
    }
  }
}

function trackUploadBytes(ip: string, bytes: number): void {
  const today = new Date().toISOString().slice(0, 10);
  const record = uploadQuotaMap.get(ip);
  if (!record || record.date !== today) {
    uploadQuotaMap.set(ip, { date: today, bytes });
    pruneStaleQuotas(today);
    return;
  }
  record.bytes += bytes;
}

export const POST = withAuth(apiHandler(async function POST(req: NextRequest) {
  // Rate limit uploads separately from general admin traffic
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`upload:${ip}`, 20);
  if (!allowed) {
    return NextResponse.json({ error: "Too many upload requests. Please try again later." }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // File size limits: 10 MB for images, 100 MB for videos
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
  if (!allowedMimeTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Please upload an image or video." }, { status: 400 });
  }

  const originalExt = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(originalExt)) {
    return NextResponse.json(
      { error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 }
    );
  }

  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return NextResponse.json({ error: `File too large. Maximum size is ${maxMB} MB.` }, { status: 400 });
  }

  // Daily aggregate quota per client IP
  const today = new Date().toISOString().slice(0, 10);
  const quota = uploadQuotaMap.get(ip);
  if (quota && quota.date === today && quota.bytes + file.size > MAX_DAILY_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Daily upload quota exceeded. Please try again tomorrow." }, { status: 429 });
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
  let ext = originalExt;
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    ext = ".webp";
  }
  const cleanName = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${cleanName}_${uniqueSuffix}${ext}`;

  if (process.env.STORAGE_PROVIDER === "vercel") {
    // Vercel Blob Upload
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type.startsWith("image/") && file.type !== "image/gif" ? "image/webp" : file.type,
    });
    trackUploadBytes(ip, buffer.byteLength);
    return NextResponse.json({ success: true, url: blob.url });
  } else {
    // Local File System Upload
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer, { mode: 0o644 });
    trackUploadBytes(ip, buffer.byteLength);
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  }
}, "Failed to upload file"));
