import { NextResponse } from "next/server";
import { requireApiAuth, isErrorResponse } from "@/lib/api-auth";
import { getFromR2 } from "@/lib/r2";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const auth = await requireApiAuth();
  if (isErrorResponse(auth)) return auth;

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
