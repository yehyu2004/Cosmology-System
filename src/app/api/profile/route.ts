import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, isErrorResponse } from "@/lib/api-auth";

export async function GET() {
  const authResult = await requireApiAuth();
  if (isErrorResponse(authResult)) return authResult;

  const user = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      studentId: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireApiAuth();
  if (isErrorResponse(authResult)) return authResult;

  const body = await req.json();
  const { studentId } = body;

  if (typeof studentId !== "string" && studentId !== null) {
    return NextResponse.json(
      { error: "studentId must be a string or null" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: authResult.user.id },
    data: { studentId: studentId || null },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      studentId: true,
    },
  });

  return NextResponse.json(updated);
}
