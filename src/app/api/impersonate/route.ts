import { NextRequest, NextResponse } from "next/server";
import { requireApiRole, isErrorResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const COOKIE_NAME = "impersonate-uid";

export async function POST(req: NextRequest) {
  const result = await requireApiRole(["ADMIN"]);
  if (isErrorResponse(result)) return result;

  const { userId } = await req.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, target.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return NextResponse.json(target);
}

export async function DELETE() {
  const result = await requireApiRole(["ADMIN"]);
  if (isErrorResponse(result)) return result;

  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  return NextResponse.json({ ok: true });
}
