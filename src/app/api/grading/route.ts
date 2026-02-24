import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isErrorResponse } from "@/lib/api-auth";
import { aiGradeReport } from "@/lib/ai";
import { z } from "zod";
import fs from "fs";
import path from "path";

export async function DELETE(req: Request) {
  const auth = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json();
  const { submissionId } = body;

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      totalScore: null,
      feedback: null,
      gradedAt: null,
      gradedById: null,
      aiScore: null,
      aiFeedback: null,
    },
  });

  return NextResponse.json({ data: updated });
}

const GradeSchema = z.object({
  submissionId: z.string(),
  totalScore: z.number().min(0),
  feedback: z.string().max(10000).optional(),
});

export async function POST(req: Request) {
  const auth = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
  if (isErrorResponse(auth)) return auth;

  const body = GradeSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: body.data.submissionId },
    include: { assignment: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const maxPoints = Number(submission.assignment.totalPoints);
  if (body.data.totalScore > maxPoints) {
    return NextResponse.json(
      { error: `Score must be between 0 and ${maxPoints}` },
      { status: 400 }
    );
  }

  const updated = await prisma.submission.update({
    where: { id: body.data.submissionId },
    data: {
      totalScore: body.data.totalScore,
      feedback: body.data.feedback || null,
      gradedAt: new Date(),
      gradedById: auth.user.id,
    },
    include: {
      gradedBy: { select: { name: true } },
    },
  });

  return NextResponse.json({ data: updated });
}

export async function PUT(req: Request) {
  const auth = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
  if (isErrorResponse(auth)) return auth;

  const { submissionId } = await req.json();
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (!submission.fileUrl) {
    return NextResponse.json({ error: "No file uploaded for this submission" }, { status: 400 });
  }

  let reportText = "";
  try {
    const filePath = path.resolve(process.cwd(), "public", submission.fileUrl.replace(/^\//, ""));
    const publicDir = path.resolve(process.cwd(), "public");
    if (!filePath.startsWith(publicDir + path.sep)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }
    const buffer = fs.readFileSync(filePath);
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    reportText = parsed.text;
  } catch (err) {
    console.error("[grading:ai-extract]", { submissionId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 });
  }

  if (!reportText.trim()) {
    return NextResponse.json({ error: "Could not extract text from PDF. The file may be scanned or image-only." }, { status: 400 });
  }

  const result = await aiGradeReport({
    assignmentTitle: submission.assignment.title,
    assignmentDescription: submission.assignment.description,
    rubric: submission.assignment.rubric,
    maxPoints: Number(submission.assignment.totalPoints),
    reportText,
  });

  if (!result) {
    return NextResponse.json({ error: "AI grading failed" }, { status: 500 });
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      aiFeedback: result.feedback,
      aiScore: result.score,
    },
  });

  return NextResponse.json({ data: result });
}
