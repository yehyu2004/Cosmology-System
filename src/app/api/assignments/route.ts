import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, getEffectiveUser, isErrorResponse } from "@/lib/api-auth";
import { z } from "zod";

const CreateAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime().optional(),
  totalPoints: z.number().min(0).max(10000).default(100),
  reportNumber: z.number().int().min(1).max(10),
  rubric: z.string().max(10000).optional(),
  pdfUrl: z.string().max(500).optional(),
  published: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const auth = await getEffectiveUser(req);
  if (isErrorResponse(auth)) return auth;

  const isStaff = ["TA", "PROFESSOR", "ADMIN"].includes(auth.user.role);

  const assignments = await prisma.assignment.findMany({
    where: isStaff ? {} : { published: true },
    orderBy: { reportNumber: "asc" },
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { submissions: true } },
      submissions: isStaff
        ? { where: { gradedAt: null }, select: { id: true } }
        : {
            where: { userId: auth.user.id },
            select: { totalScore: true, gradedAt: true },
          },
    },
  });

  const data = assignments.map(({ submissions, ...rest }) => ({
    ...rest,
    ungradedCount: isStaff && Array.isArray(submissions) ? submissions.length : 0,
    ...(!isStaff && {
      mySubmission: Array.isArray(submissions) && submissions.length > 0
        ? submissions[0]
        : null,
    }),
  }));

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const auth = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
  if (isErrorResponse(auth)) return auth;

  const body = CreateAssignmentSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      ...body.data,
      dueDate: body.data.dueDate ? new Date(body.data.dueDate) : null,
      totalPoints: body.data.totalPoints,
      createdById: auth.user.id,
    },
  });

  return NextResponse.json({ data: assignment }, { status: 201 });
}
