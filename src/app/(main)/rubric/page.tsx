import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CATEGORY_META } from "@/lib/grading-rubric";

/* ── tier data for each category ── */

const TIERS: Record<string, { score: number; description: string }[]> = {
  animeIntroduction: [
    { score: 10, description: "Names the work, summarizes plot in 3+ sentences, identifies cosmology-relevant themes" },
    { score: 8, description: "Names the work, reasonable summary, but misses key themes" },
    { score: 6, description: "Names the work with a brief 1\u20132 sentence summary" },
    { score: 4, description: "Mentions the work but only superficial or inaccurate synopsis" },
    { score: 2, description: "Barely mentions the work; no meaningful summary" },
    { score: 0, description: "Missing or completely off-topic" },
  ],
  cosmologyAnimeConnection: [
    { score: 30, description: "3+ cosmological concepts identified with concrete scene references" },
    { score: 25, description: "2 concepts with scene references, or 3+ concepts without specific scenes" },
    { score: 20, description: "1\u20132 concepts with some scene context" },
    { score: 15, description: "1 concept but the connection is vague or superficial" },
    { score: 10, description: "Mentions cosmology in passing without tying it to the anime" },
    { score: 5, description: "Attempts a connection but it is incorrect or incoherent" },
    { score: 0, description: "No connection between the anime and cosmology" },
  ],
  cosmologicalConcepts: [
    { score: 30, description: "3+ real concepts explained accurately, goes beyond anime-level discussion" },
    { score: 25, description: "2\u20133 concepts explained accurately with some depth" },
    { score: 20, description: "1\u20132 concepts explained correctly at a basic level" },
    { score: 15, description: "Attempts to explain concepts but contains minor inaccuracies" },
    { score: 10, description: "Contains significant inaccuracies or misunderstandings" },
    { score: 5, description: "Mentions concepts by name only, with no real explanation" },
    { score: 0, description: "No cosmological content beyond the anime discussion" },
  ],
  references: [
    { score: 10, description: "3+ credible references, properly cited" },
    { score: 8, description: "2 credible references with proper citations" },
    { score: 6, description: "1 credible reference with proper citation" },
    { score: 4, description: "References listed but none are credible or relevant" },
    { score: 2, description: "Only non-credible references (anime wikis, blogs, AI summaries)" },
    { score: 0, description: "No references" },
  ],
  writingQuality: [
    { score: 20, description: "Clear structure (intro, body, conclusion), logical flow, minimal errors" },
    { score: 16, description: "Mostly clear with minor structural issues or a few grammar errors" },
    { score: 12, description: "Readable but disorganized or frequent grammar issues" },
    { score: 8, description: "Poorly organized and difficult to follow" },
    { score: 4, description: "Mostly incoherent but some content is discernible" },
    { score: 0, description: "Incoherent or unreadable" },
  ],
};

const GRADE_SCALE = [
  { range: "85 \u2013 100", label: "Excellent", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { range: "70 \u2013 84", label: "Good", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  { range: "55 \u2013 69", label: "Adequate", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  { range: "40 \u2013 54", label: "Below Expectations", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  { range: "0 \u2013 39", label: "Insufficient", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
];

/* ── colour helpers for tier rows ── */

function tierColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.85) return "bg-emerald-50 dark:bg-emerald-900/20";
  if (pct >= 0.65) return "bg-blue-50 dark:bg-blue-900/20";
  if (pct >= 0.45) return "bg-yellow-50 dark:bg-yellow-900/20";
  if (pct >= 0.2) return "bg-orange-50 dark:bg-orange-900/20";
  return "bg-red-50 dark:bg-red-900/20";
}

function scoreBadge(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.85) return "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100";
  if (pct >= 0.65) return "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100";
  if (pct >= 0.45) return "bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100";
  if (pct >= 0.2) return "bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100";
  return "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100";
}

/* ── page ── */

export default function RubricPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/assignments"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grading Rubric</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your report is scored across 5 categories for a total of 100 points. Between two tiers, the lower score is used.
        </p>
        </div>
      </div>

      {/* ── Point distribution bar ── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Point Distribution</h2>
        <div className="flex rounded-lg overflow-hidden text-xs font-bold text-white">
          <div className="bg-violet-500 text-center py-2" style={{ width: "10%" }}>10</div>
          <div className="bg-blue-500 text-center py-2" style={{ width: "30%" }}>30</div>
          <div className="bg-cyan-500 text-center py-2" style={{ width: "30%" }}>30</div>
          <div className="bg-amber-500 text-center py-2" style={{ width: "10%" }}>10</div>
          <div className="bg-rose-500 text-center py-2" style={{ width: "20%" }}>20</div>
        </div>
        <div className="flex text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
          <div style={{ width: "10%" }} className="text-center">Intro</div>
          <div style={{ width: "30%" }} className="text-center">Connection</div>
          <div style={{ width: "30%" }} className="text-center">Concepts</div>
          <div style={{ width: "10%" }} className="text-center">Refs</div>
          <div style={{ width: "20%" }} className="text-center">Writing</div>
        </div>
      </div>

      {/* ── Rubric tables ── */}
      {CATEGORY_META.map(({ key, label, maxScore }, idx) => (
        <div
          key={key}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {idx + 1}. {label}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {maxScore} pts
            </span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="w-20 px-5 py-2 text-left font-medium">Score</th>
                <th className="px-5 py-2 text-left font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {TIERS[key].map((tier) => (
                <tr
                  key={tier.score}
                  className={`border-t border-gray-100 dark:border-gray-800 ${tierColor(tier.score, maxScore)}`}
                >
                  <td className="px-5 py-2.5 align-top">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ${scoreBadge(tier.score, maxScore)}`}
                    >
                      {tier.score}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-gray-700 dark:text-gray-300">
                    {tier.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* ── Credible references ── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">What Counts as a Credible Reference?</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Course lecture slides count as one reference regardless of how many slide decks are cited.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">Credible</p>
            <ul className="text-sm text-emerald-900 dark:text-emerald-200 space-y-1 list-disc list-inside">
              <li>Peer-reviewed journal articles</li>
              <li>Textbooks (incl. Serjeant&apos;s <em>Observational Cosmology</em>)</li>
              <li>NASA / ESA / JAXA official pages</li>
              <li>ArXiv preprints</li>
              <li>Course lecture notes / slides</li>
              <li>PBS Space Time videos</li>
            </ul>
          </div>
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-xs font-bold text-red-800 dark:text-red-300 mb-2">Not Credible (on their own)</p>
            <ul className="text-sm text-red-900 dark:text-red-200 space-y-1 list-disc list-inside">
              <li>Wikipedia (OK only as supplementary)</li>
              <li>Anime wiki pages</li>
              <li>Personal blogs</li>
              <li>AI-generated summaries</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Overall grade scale ── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Overall Grade Scale</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {GRADE_SCALE.map((g) => (
            <div key={g.range} className={`rounded-lg p-3 text-center ${g.color}`}>
              <p className="text-base font-bold">{g.range}</p>
              <p className="text-xs font-medium mt-0.5">{g.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
