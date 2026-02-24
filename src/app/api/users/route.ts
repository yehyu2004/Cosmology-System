import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isErrorResponse } from "@/lib/api-auth";

const VALID_ROLES = ["STUDENT", "TA", "PROFESSOR", "ADMIN"] as const;

export async function GET() {
  const authResult = await requireApiRole(["ADMIN"]);
  if (isErrorResponse(authResult)) return authResult;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      studentId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireApiRole(["ADMIN"]);
  if (isErrorResponse(authResult)) return authResult;

  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !role) {
    return NextResponse.json(
      { error: "userId and role are required" },
      { status: 400 }
    );
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  // Prevent admins from demoting themselves
  if (userId === authResult.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      studentId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}
