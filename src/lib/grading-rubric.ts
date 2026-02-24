/**
 * AI grading rubric, type definitions, and calibration examples for anime-cosmology reports.
 */

// ---------------------------------------------------------------------------
// Type exports
// ---------------------------------------------------------------------------

export interface AICategoryScore {
  score: number;
  maxScore: number;
  rationale: string;
}

export interface AIGradingResult {
  score: number;
  categories: {
    animeIntroduction: AICategoryScore;
    cosmologyAnimeConnection: AICategoryScore;
    cosmologicalConcepts: AICategoryScore;
    references: AICategoryScore;
    writingQuality: AICategoryScore;
  };
  feedback: string;
}

export type CategoryKey = keyof AIGradingResult["categories"];

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  maxScore: number;
}

export const CATEGORY_META: CategoryMeta[] = [
  { key: "animeIntroduction", label: "Anime Introduction", maxScore: 10 },
  { key: "cosmologyAnimeConnection", label: "Cosmology-Anime Connection", maxScore: 30 },
  { key: "cosmologicalConcepts", label: "Cosmological Concepts", maxScore: 30 },
  { key: "references", label: "References", maxScore: 15 },
  { key: "writingQuality", label: "Writing Quality", maxScore: 15 },
];

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export const GRADING_SYSTEM_PROMPT = `You are a professor grading graduate student reports that connect anime or science fiction to real cosmology and astronomy. You hold graduate students to a higher standard than undergraduates — you expect deeper physical reasoning, quantitative analysis where appropriate, and engagement with primary literature. You are knowledgeable and give specific, constructive feedback. You praise genuine insight and rigorously point out misconceptions, hand-waving, or shallow treatment of topics. A graduate-level report should demonstrate mastery beyond textbook summaries.

IMPORTANT — Scoring consistency rules:
- You MUST score each category independently using the tiered criteria below. Do NOT let one category influence another.
- First assign each category score, then sum them for the total. The total score MUST equal the sum of category scores.
- You may ONLY assign scores that appear in the tier list for each category. Do not invent intermediate scores.
- When a submission falls between two tiers, ALWAYS choose the lower tier's point value. Never round up.

Significant figures: When a student reports a cosmological value with inappropriate precision (e.g., the Hubble constant as 67.74823 km/s/Mpc from a rough estimate), note the issue constructively.

Image vs. text priority: Page images are authoritative for visual elements (graphs, diagrams, equations, LaTeX formulas). Extracted text is authoritative for prose content, arguments, and references. When you rely on an image to evaluate something, note it in the rationale.`;

// ---------------------------------------------------------------------------
// Rubric (rebalanced weights, smoother tiers, single-criterion differentiators)
// ---------------------------------------------------------------------------

export const DEFAULT_RUBRIC = `Anime Introduction (10 points):
  10: Names the work, summarizes the plot in 3+ sentences, and identifies themes relevant to cosmology.
   8: Names the work and provides a reasonable summary but misses key themes.
   6: Names the work with a brief 1-2 sentence summary.
   4: Mentions the work but gives only a superficial or inaccurate synopsis.
   2: Barely mentions the work; no meaningful summary.
   0: Missing or completely off-topic.

Cosmology-Anime Connection (30 points):
  30: Identifies 3+ specific cosmological concepts in the anime with concrete scene references.
  25: Identifies 2 concepts with scene references, or 3+ concepts without specific scenes.
  20: Identifies 1-2 concepts with some scene context.
  15: Identifies 1 concept but the connection is vague or superficial.
  10: Mentions cosmology in passing without tying it to specific anime content.
   5: Attempts a connection but it is incorrect or incoherent.
   0: No connection between the anime and cosmology.

Cosmological Concepts (30 points):
  30: Explains 3+ real cosmological concepts accurately with graduate-level depth — includes quantitative reasoning, derivations, or engagement with primary literature beyond the textbook.
  25: Explains 2-3 concepts accurately with depth beyond introductory level.
  20: Explains 1-2 concepts correctly but remains at textbook level without deeper analysis.
  15: Attempts to explain concepts but contains minor inaccuracies or lacks depth expected of a graduate student.
  10: Contains significant inaccuracies or misunderstandings.
   5: Mentions concepts by name only, with no real explanation.
   0: No cosmological content beyond the anime discussion.

References (15 points):
  15: 3+ credible references including at least one peer-reviewed journal article or ArXiv preprint, properly cited.
  12: 2 credible references with proper citations, at least one beyond the course textbook.
   9: 1 credible reference with proper citation.
   6: References listed but none are credible or relevant to cosmology.
   3: Only non-credible references (anime wikis, blogs, AI-generated summaries).
   0: No references.

Writing Quality (15 points):
  15: Clear structure (intro, body, conclusion), logical flow, precise scientific language, minimal errors.
  12: Mostly clear with minor structural issues or imprecise language in places.
   9: Readable but disorganized, frequent grammar issues, or overly casual tone for graduate work.
   6: Poorly organized and difficult to follow.
   3: Mostly incoherent but some content is discernible.
   0: Incoherent or unreadable.

Credible reference definition:
  CREDIBLE: peer-reviewed journal articles, textbooks (including Serjeant's "Observational Cosmology"), NASA/ESA/JAXA official pages, ArXiv preprints, course lecture notes/slides, PBS Space Time videos.
  NOT CREDIBLE on their own: Wikipedia (acceptable only as a supplementary source alongside credible ones), anime wiki pages, personal blogs, AI-generated summaries.
  Note: Course lecture slides count as one reference regardless of how many slide decks are cited.`;

// ---------------------------------------------------------------------------
// Scoring guidelines
// ---------------------------------------------------------------------------

export const SCORING_GUIDELINES = `Scoring procedure:
1. Score each of the 5 categories independently using the tier criteria above.
2. For each category, pick the tier whose single primary criterion best matches the submission. If between two tiers, ALWAYS use the lower tier's point value.
3. Sum the 5 category scores to get the total. The total MUST equal the sum.
4. Map the total to an overall assessment:
   - 85-100: Excellent
   - 70-84: Good
   - 55-69: Adequate
   - 40-54: Below expectations
   - Below 40: Insufficient`;

// ---------------------------------------------------------------------------
// Structured JSON output format
// ---------------------------------------------------------------------------

export const FEEDBACK_FORMAT = `You MUST respond with a single JSON object in exactly this format (no markdown, no extra text):
{
  "score": <total integer 0-100>,
  "categories": {
    "animeIntroduction":        { "score": <int>, "maxScore": 10, "rationale": "<1-2 sentences>" },
    "cosmologyAnimeConnection": { "score": <int>, "maxScore": 30, "rationale": "<1-2 sentences>" },
    "cosmologicalConcepts":     { "score": <int>, "maxScore": 30, "rationale": "<1-2 sentences>" },
    "references":               { "score": <int>, "maxScore": 15, "rationale": "<1-2 sentences>" },
    "writingQuality":           { "score": <int>, "maxScore": 15, "rationale": "<1-2 sentences>" }
  },
  "feedback": "<overall 2-4 sentence constructive feedback with one specific suggestion for improvement>"
}

Rules:
- Each category score MUST be one of the tier values listed in the rubric. No intermediate values.
- "score" MUST equal the sum of all category scores.
- "rationale" must justify which tier was selected and why.
- "feedback" is the overall summary, NOT a repeat of rationale.`;

// ---------------------------------------------------------------------------
// Calibration examples (few-shot anchoring)
// ---------------------------------------------------------------------------

export const CALIBRATION_EXAMPLES = `Here are two graded examples to calibrate your scoring. These are graduate students — expect deeper analysis than you would from undergraduates.

EXAMPLE A — Score: 55/100
Graduate student report on Steins;Gate and time travel cosmology.
{
  "score": 55,
  "categories": {
    "animeIntroduction":        { "score": 8,  "maxScore": 10, "rationale": "Names Steins;Gate and summarizes the plot, but does not identify cosmological themes explicitly." },
    "cosmologyAnimeConnection": { "score": 15, "maxScore": 30, "rationale": "Identifies time dilation as a concept but the connection to specific scenes is vague." },
    "cosmologicalConcepts":     { "score": 15, "maxScore": 30, "rationale": "Explains general relativity and time dilation correctly but stays at introductory textbook level — no quantitative analysis or engagement with literature. Insufficient depth for a graduate student." },
    "references":               { "score": 9,  "maxScore": 15, "rationale": "Cites the course textbook only. No journal articles or ArXiv preprints — weak for graduate-level work." },
    "writingQuality":           { "score": 8, "maxScore": 15, "rationale": "Readable but overly casual tone and lacks the precision expected of graduate scientific writing." }
  },
  "feedback": "The physics content is correct but stays at an introductory level. As a graduate student, you should go deeper — derive the time dilation factor from the Schwarzschild metric, discuss the Novikov self-consistency principle, or engage with Thorne's closed timelike curves paper. The reference list needs primary literature beyond the course textbook."
}

EXAMPLE B — Score: 88/100
Graduate student report on Interstellar and black hole physics.
{
  "score": 88,
  "categories": {
    "animeIntroduction":        { "score": 10, "maxScore": 10, "rationale": "Thorough plot summary of Interstellar with themes of gravitational time dilation and singularities clearly identified." },
    "cosmologyAnimeConnection": { "score": 25, "maxScore": 30, "rationale": "Connects Gargantua's accretion disk, time dilation on Miller's planet, and the tesseract to real physics with specific scene references." },
    "cosmologicalConcepts":     { "score": 25, "maxScore": 30, "rationale": "Accurately explains Kerr black holes, gravitational lensing, and tidal forces with references to Thorne's work. Includes a derivation of the time dilation factor. Minor imprecision on Penrose diagrams." },
    "references":               { "score": 15, "maxScore": 15, "rationale": "Cites Thorne's 'The Science of Interstellar', two ArXiv papers on Kerr metrics, and a LIGO review article." },
    "writingQuality":           { "score": 13, "maxScore": 15, "rationale": "Well-structured with clear sections and precise scientific language; a few grammatical errors in the conclusion." }
  },
  "feedback": "Excellent report with genuine graduate-level depth. The Kerr metric discussion and time dilation derivation demonstrate strong physical reasoning. The Penrose diagram discussion could be tightened — the causal structure inside the event horizon was slightly misstated. Consider discussing observational signatures that could distinguish Kerr from Schwarzschild black holes."
}`;
