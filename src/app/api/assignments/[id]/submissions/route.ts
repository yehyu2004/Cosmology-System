import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isErrorResponse } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
  if (isErrorResponse(auth)) return auth;

  const submissions = await prisma.submission.findMany({
    where: { assignmentId: params.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      gradedBy: { select: { name: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ data: submissions });
}
