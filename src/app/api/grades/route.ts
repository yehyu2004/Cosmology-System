import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, isErrorResponse } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiAuth();
  if (isErrorResponse(auth)) return auth;

  const submissions = await prisma.submission.findMany({
    where: { userId: auth.user.id },
    include: {
      assignment: {
        select: { id: true, title: true, reportNumber: true, totalPoints: true },
      },
      gradedBy: { select: { name: true } },
    },
    orderBy: { assignment: { reportNumber: "asc" } },
  });

  return NextResponse.json({ data: submissions });
}
