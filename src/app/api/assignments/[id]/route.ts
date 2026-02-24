import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, getEffectiveUser, isErrorResponse } from "@/lib/api-auth";
import { z } from "zod";

const UpdateAssignmentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  totalPoints: z.number().min(0).max(10000).optional(),
  published: z.boolean().optional(),
  rubric: z.string().max(10000).optional().nullable(),
  pdfUrl: z.string().max(500).optional().nullable(),
}).strict();

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

  const parsed = UpdateAssignmentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const body = parsed.data;
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
