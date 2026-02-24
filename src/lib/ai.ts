import OpenAI from "openai";

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
  const prompt = `You are a teaching assistant grading a student report for an Observational Cosmology course (textbook: "Observational Cosmology" by Stephen Serjeant, Cambridge University Press).

Assignment: ${assignmentTitle}
${assignmentDescription ? `Description: ${assignmentDescription}` : ""}
${rubric ? `Grading Rubric:\n${rubric}` : ""}
Max Points: ${maxPoints}

Student Report Content:
${reportText.slice(0, 15000)}

Grade this report and provide:
1. A numeric score (0 to ${maxPoints})
2. Constructive feedback covering:
   - Scientific accuracy and understanding of cosmological concepts
   - Quality of analysis and data interpretation
   - Clarity of presentation and writing
   - Suggestions for improvement

Respond in JSON format: {"score": <number>, "feedback": "<string>"}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content);
  return {
    score: Math.min(Math.max(0, Number(parsed.score)), maxPoints),
    feedback: String(parsed.feedback),
  };
}
