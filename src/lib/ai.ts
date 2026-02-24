import OpenAI from "openai";
import {
  GRADING_SYSTEM_PROMPT,
  DEFAULT_RUBRIC,
  SCORING_GUIDELINES,
  FEEDBACK_FORMAT,
} from "@/lib/grading-rubric";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function aiGradeReport({
  assignmentTitle,
  assignmentDescription,
  rubric,
  maxPoints,
  reportText,
}: {
  assignmentTitle: string;
  assignmentDescription: string | null;
  rubric: string | null;
  maxPoints: number;
  reportText: string;
}): Promise<{ score: number; feedback: string } | null> {
  const effectiveRubric = rubric?.trim() || DEFAULT_RUBRIC;

  const userPrompt = `Assignment: ${assignmentTitle}
${assignmentDescription ? `Description: ${assignmentDescription}` : ""}

Grading Rubric:
${effectiveRubric}

${SCORING_GUIDELINES}

Max Points: ${maxPoints}

Student Report Content:
${reportText.slice(0, 15000)}

Grade this report and provide:
1. A numeric score (0 to ${maxPoints})
2. Constructive feedback following this format:

${FEEDBACK_FORMAT}

Respond in JSON format: {"score": <number>, "feedback": "<string>"}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: GRADING_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content);
  return {
    score: Math.min(Math.max(0, Number(parsed.score)), maxPoints),
    feedback: String(parsed.feedback),
  };
}
