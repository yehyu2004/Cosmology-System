import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isErrorResponse } from "@/lib/api-auth";
import { aiGradeReport } from "@/lib/ai";
import { pdfToImages } from "@/lib/pdf-to-images";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Simple in-memory rate limiter for AI grading (per user, 5 requests per minute)
const aiRateLimit = new Map<string, number[]>();
const AI_RATE_LIMIT = 5;
const AI_RATE_WINDOW = 60_000;

function checkAiRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = (aiRateLimit.get(userId) || []).filter((t) => now - t < AI_RATE_WINDOW);
  if (timestamps.length >= AI_RATE_LIMIT) return false;
  timestamps.push(now);
  aiRateLimit.set(userId, timestamps);
  return true;
}

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
      returnedAt: new Date(),
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

  if (!checkAiRateLimit(auth.user.id)) {
    return NextResponse.json({ error: "Too many AI grading requests. Please wait a minute." }, { status: 429 });
  }

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

  const filePath = path.resolve(process.cwd(), "public", submission.fileUrl.replace(/^\//, ""));
  const publicDir = path.resolve(process.cwd(), "public");
  if (!filePath.startsWith(publicDir + path.sep)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = fs.readFileSync(filePath);
  } catch (err) {
    console.error("[grading:read-file]", { submissionId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to read PDF file" }, { status: 500 });
  }

  let reportText = "";
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: pdfBuffer });
    const textResult = await parser.getText();
    reportText = textResult.text;
    await parser.destroy();
  } catch (err) {
    console.error("[grading:ai-extract]", { submissionId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 });
  }

  if (!reportText.trim()) {
    return NextResponse.json({ error: "Could not extract text from PDF. The file may be scanned or image-only." }, { status: 400 });
  }

  // Convert PDF pages to images for vision-based grading (non-blocking on failure)
  const pageImageUrls = await pdfToImages(pdfBuffer);

  const result = await aiGradeReport({
    assignmentTitle: submission.assignment.title,
    assignmentDescription: submission.assignment.description,
    rubric: submission.assignment.rubric,
    maxPoints: Number(submission.assignment.totalPoints),
    reportText,
    pageImageUrls,
  });

  if (!result) {
    return NextResponse.json({ error: "AI grading failed" }, { status: 500 });
  }

  // Store structured JSON (categories + feedback) in aiFeedback text field
  const structuredFeedback = JSON.stringify({
    categories: result.categories,
    feedback: result.feedback,
  });

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      aiFeedback: structuredFeedback,
      aiScore: result.score,
    },
  });

  return NextResponse.json({ data: result });
}
