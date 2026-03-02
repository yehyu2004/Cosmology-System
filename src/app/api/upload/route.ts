import { NextResponse } from "next/server";
import { requireApiAuth, isErrorResponse } from "@/lib/api-auth";
import { uploadToR2 } from "@/lib/r2";

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5 MB (Vercel Hobby limit)

export async function POST(req: Request) {
  const auth = await requireApiAuth();
  if (isErrorResponse(auth)) return auth;

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 4.5 MB)" }, { status: 413 });
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
    return NextResponse.json({ error: "File too large (max 4.5 MB)" }, { status: 413 });
  }

  // Verify PDF magic bytes (%PDF-)
  if (buffer.length < 5 || buffer.toString("utf8", 0, 5) !== "%PDF-") {
    return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `submissions/${timestamp}-${safeName}`;

  await uploadToR2(buffer, key, "application/pdf");

  return NextResponse.json({
    data: {
      url: key,
      name: file.name,
    },
  });
}
