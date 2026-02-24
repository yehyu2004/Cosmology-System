import OpenAI from "openai";
import {
  GRADING_SYSTEM_PROMPT,
  DEFAULT_RUBRIC,
  SCORING_GUIDELINES,
  FEEDBACK_FORMAT,
  CALIBRATION_EXAMPLES,
  CATEGORY_META,
} from "@/lib/grading-rubric";
import type { AIGradingResult, AICategoryScore, CategoryKey } from "@/lib/grading-rubric";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Valid tier scores for each category — only these values are accepted. */
const VALID_TIER_SCORES: Record<CategoryKey, number[]> = {
  animeIntroduction: [10, 8, 6, 4, 2, 0],
  cosmologyAnimeConnection: [30, 25, 20, 15, 10, 5, 0],
  cosmologicalConcepts: [30, 25, 20, 15, 10, 5, 0],
  references: [15, 12, 9, 6, 3, 0],
  writingQuality: [15, 12, 9, 6, 3, 0],
};

/**
 * Snap a score to the nearest valid tier value (always rounding down).
 * If the score is already a valid tier value, return it unchanged.
 */
function snapToTier(key: CategoryKey, rawScore: number): number {
  const tiers = VALID_TIER_SCORES[key];
  const meta = CATEGORY_META.find((m) => m.key === key)!;
  const clamped = Math.max(0, Math.min(meta.maxScore, rawScore));
  // Find the highest tier value <= clamped score
  for (const tier of tiers) {
    if (tier <= clamped) return tier;
  }
  return 0;
}

/**
 * Validate and normalize the AI's parsed response into a clean AIGradingResult.
 * - Ensures all categories exist with valid tier scores
 * - Recomputes total from category sum (never trusts AI's reported total)
 */
function validateResult(parsed: Record<string, unknown>): AIGradingResult {
  const categories = (parsed.categories || {}) as Record<string, Record<string, unknown>>;

  const validated: Record<string, AICategoryScore> = {};
  for (const meta of CATEGORY_META) {
    const cat = categories[meta.key];
    const rawScore = cat ? Number(cat.score) : 0;
    const snapped = snapToTier(meta.key, Number.isFinite(rawScore) ? rawScore : 0);
    validated[meta.key] = {
      score: snapped,
      maxScore: meta.maxScore,
      rationale: cat?.rationale ? String(cat.rationale) : "No rationale provided.",
    };
  }

  const computedTotal = Object.values(validated).reduce((sum, c) => sum + c.score, 0);

  return {
    score: computedTotal,
    categories: validated as AIGradingResult["categories"],
    feedback: parsed.feedback ? String(parsed.feedback) : "No feedback provided.",
  };
}

export async function aiGradeReport({
  assignmentTitle,
  assignmentDescription,
  rubric,
  maxPoints,
  reportText,
  pageImageUrls,
}: {
  assignmentTitle: string;
  assignmentDescription: string | null;
  rubric: string | null;
  maxPoints: number;
  reportText: string;
  pageImageUrls?: string[];
}): Promise<AIGradingResult | null> {
  const effectiveRubric = rubric?.trim() || DEFAULT_RUBRIC;

  const userPrompt = `Assignment: ${assignmentTitle}
${assignmentDescription ? `Description: ${assignmentDescription}` : ""}

Grading Rubric:
${effectiveRubric}

${SCORING_GUIDELINES}

${CALIBRATION_EXAMPLES}

Max Points: ${maxPoints}

Student Report Content:
${reportText.slice(0, 50000)}

Grade this report. Respond with ONLY the JSON object described below — no markdown fences, no extra text.

${FEEDBACK_FORMAT}`;

  // Build content array: text first, then page images (if any)
  const userContent: OpenAI.Responses.ResponseInputContent[] = [
    { type: "input_text", text: userPrompt },
  ];

  if (pageImageUrls && pageImageUrls.length > 0) {
    for (const url of pageImageUrls) {
      userContent.push({
        type: "input_image",
        image_url: url,
        detail: "low",
      });
    }
  }

  const response = await openai.responses.create({
    model: "gpt-5.2",
    temperature: 0.2,
    input: [
      { role: "developer", content: GRADING_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    text: { format: { type: "json_object" } },
  });

  const content = response.output_text;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    return validateResult(parsed);
  } catch {
    return null;
  }
}
