import { NextResponse } from "next/server";
import { requireApiAuth, isErrorResponse } from "@/lib/api-auth";
import fs from "fs";
import path from "path";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(req: Request) {
  const auth = await requireApiAuth();
  if (isErrorResponse(auth)) return auth;

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 413 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 413 });
  }

  // Verify PDF magic bytes (%PDF-)
  if (buffer.length < 5 || buffer.toString("utf8", 0, 5) !== "%PDF-") {
    return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
  }

  const uploadDir = path.resolve(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}-${safeName}`;
  const filePath = path.resolve(uploadDir, fileName);

  if (!filePath.startsWith(uploadDir + path.sep)) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  fs.writeFileSync(filePath, buffer);

  return NextResponse.json({
    data: {
      url: `/uploads/${fileName}`,
      name: file.name,
    },
  });
}
