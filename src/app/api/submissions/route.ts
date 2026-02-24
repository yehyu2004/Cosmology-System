import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, isErrorResponse } from "@/lib/api-auth";

export async function POST(req: Request) {
  const auth = await requireApiAuth();
  if (isErrorResponse(auth)) return auth;

  const body = await req.json();
  const { assignmentId, fileUrl, fileName } = body;

  if (!assignmentId || !fileUrl) {
    return NextResponse.json({ error: "assignmentId and fileUrl are required" }, { status: 400 });
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment || !assignment.published) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  // Check if an existing submission has been graded
  const existing = await prisma.submission.findUnique({
    where: {
      assignmentId_userId: {
        assignmentId,
        userId: auth.user.id,
      },
    },
    select: { gradedAt: true },
  });

  if (existing?.gradedAt) {
    return NextResponse.json(
      { error: "Cannot resubmit — assignment has been graded. Ask your TA to return it." },
      { status: 403 }
    );
  }

  const submission = await prisma.submission.upsert({
    where: {
      assignmentId_userId: {
        assignmentId,
        userId: auth.user.id,
      },
    },
    update: {
      fileUrl,
      fileName,
      submittedAt: new Date(),
      aiScore: null,
      aiFeedback: null,
      returnedAt: null,
    },
    create: {
      assignmentId,
      userId: auth.user.id,
      fileUrl,
      fileName,
    },
  });

  return NextResponse.json({ data: submission }, { status: 201 });
}
