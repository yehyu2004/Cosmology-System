import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, getEffectiveUser, isErrorResponse } from "@/lib/api-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getEffectiveUser(req);
  if (isErrorResponse(auth)) return auth;

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { name: true } },
    },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const isStaff = ["TA", "PROFESSOR", "ADMIN"].includes(auth.user.role);
  if (!assignment.published && !isStaff) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const submission = await prisma.submission.findUnique({
    where: {
      assignmentId_userId: {
        assignmentId: params.id,
        userId: auth.user.id,
      },
    },
    include: {
      gradedBy: { select: { name: true } },
    },
  });

  return NextResponse.json({ data: { assignment, submission } });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json();

  const assignment = await prisma.assignment.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.published !== undefined && { published: body.published }),
      ...(body.rubric !== undefined && { rubric: body.rubric }),
      ...(body.totalPoints !== undefined && { totalPoints: body.totalPoints }),
    },
  });

  return NextResponse.json({ data: assignment });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
  if (isErrorResponse(auth)) return auth;

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: { _count: { select: { submissions: true } } },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  await prisma.assignment.delete({ where: { id: params.id } });

  return NextResponse.json({ data: { deleted: true } });
}
