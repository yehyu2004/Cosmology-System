import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isErrorResponse } from "@/lib/api-auth";

const VALID_ROLES = ["STUDENT", "TA", "PROFESSOR", "ADMIN"] as const;
const ROLE_RANK: Record<string, number> = { STUDENT: 0, TA: 1, PROFESSOR: 2, ADMIN: 3 };

export async function GET() {
  const authResult = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
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

export async function DELETE(req: NextRequest) {
  const authResult = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
  if (isErrorResponse(authResult)) return authResult;

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (userId === authResult.user.id) {
    return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const callerRank = ROLE_RANK[authResult.user.role] ?? 0;
  const targetRank = ROLE_RANK[target.role] ?? 0;

  if (callerRank <= targetRank) {
    return NextResponse.json(
      { error: "You can only delete users with a lower role than yours" },
      { status: 403 }
    );
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
