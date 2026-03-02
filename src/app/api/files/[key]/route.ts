import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, isErrorResponse } from "@/lib/api-auth";
import { getFromR2 } from "@/lib/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const auth = await requireApiAuth();
  if (isErrorResponse(auth)) return auth;

  // Check for Vercel Blob URL passed as query parameter
  const blobUrl = req.nextUrl.searchParams.get("url");
  if (blobUrl) {
    try {
      const buffer = await getFromR2(blobUrl);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="report.pdf"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  // Local storage key: /api/files/<filename>
  const { key } = await params;

  // Only allow safe characters — prevent path traversal
  if (!/^[\w._-]+\.pdf$/i.test(key)) {
    return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
  }

  const r2Key = `submissions/${key}`;

  try {
    const buffer = await getFromR2(r2Key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${key}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
