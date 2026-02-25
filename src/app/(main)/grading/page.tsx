"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw,
  Search,
  ChevronDown,
  Filter,
  ClipboardList,
  User,
  FileText,
  BookOpen,
  Brain,
  MessageSquare,
  Download,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_META } from "@/lib/grading-rubric";
import type { CategoryKey } from "@/lib/grading-rubric";

interface AiCategoryScore {
  score: number;
  maxScore: number;
  rationale: string;
}

type AiCategoryBreakdown = Record<CategoryKey, AiCategoryScore> | null;

/**
 * Parse aiFeedback — handles both structured JSON (new) and plain text (old submissions).
 * Returns { categories, feedback } or { categories: null, feedback: string }.
 */
function parseAiFeedback(raw: string | null): {
  categories: AiCategoryBreakdown;
  feedback: string;
} {
  if (!raw) return { categories: null, feedback: "" };
  try {
    const parsed = JSON.parse(raw);
    if (parsed.categories && typeof parsed.categories === "object") {
      return {
        categories: parsed.categories as Record<CategoryKey, AiCategoryScore>,
        feedback: parsed.feedback || "",
      };
    }
    return { categories: null, feedback: raw };
  } catch {
    // Old plain-text format
    return { categories: null, feedback: raw };
  }
}

function scoreColor(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.8) return "bg-emerald-500";
  if (pct >= 0.6) return "bg-amber-500";
  return "bg-red-500";
}

interface Assignment {
  id: string;
  title: string;
  reportNumber: number;
  totalPoints: number;
  _count: { submissions: number };
  ungradedCount: number;
}

interface Submission {
  id: string;
  fileUrl: string | null;
  fileName: string | null;
  submittedAt: string;
  totalScore: number | null;
  gradedAt: string | null;
  feedback: string | null;
  aiFeedback: string | null;
  aiScore: number | null;
  user: { id: string; name: string | null; email: string };
  gradedBy: { name: string | null } | null;
}

type FilterMode = "all" | "ungraded" | "graded";
type PickerFilter = "all" | "ungraded";

export default function GradingPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPhase, setAiPhase] = useState<"extracting" | "analyzing" | "generating" | null>(null);
  const [returning, setReturning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const aiAbortRef = useRef<string | null>(null);

  // Assignment picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerFilter, setPickerFilter] = useState<PickerFilter>("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    fetch("/api/assignments")
      .then((r) => r.json())
      .then((d) => setAssignments(d.data || []))
      .catch((err) => console.error("[grading:fetch-assignments]", { error: err.message }))
      .finally(() => setLoading(false));
  }, []);

  // Auto-select the assignment with the most ungraded submissions on initial load
  useEffect(() => {
    if (hasAutoSelected.current || assignments.length === 0 || selectedAssignmentId) return;
    hasAutoSelected.current = true;
    const best = assignments.reduce((prev, curr) =>
      curr.ungradedCount > prev.ungradedCount ? curr : prev
    );
    if (best.ungradedCount > 0) {
      setSelectedAssignmentId(best.id);
    }
  }, [assignments, selectedAssignmentId]);

  useEffect(() => {
    if (!selectedAssignmentId) return;
    setLoadingSubmissions(true);
    fetch(`/api/assignments/${selectedAssignmentId}/submissions`)
      .then((r) => r.json())
      .then((d) => {
        setSubmissions(d.data || []);
        setSelectedSubmission(null);
        setFilterMode("all");
      })
      .catch((err) => console.error("[grading:fetch-submissions]", { error: err.message }))
      .finally(() => setLoadingSubmissions(false));
  }, [selectedAssignmentId]);

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId);
  const maxPoints = Number(selectedAssignment?.totalPoints || 100);

  const gradedCount = submissions.filter((s) => s.gradedAt).length;
  const ungradedCount = submissions.filter((s) => !s.gradedAt).length;

  const filteredSubmissions = submissions.filter((s) => {
    if (filterMode === "ungraded") return !s.gradedAt;
    if (filterMode === "graded") return !!s.gradedAt;
    return true;
  });

  // Assignment picker filtering
  const filteredAssignments = assignments.filter((a) => {
    if (pickerSearch && !a.title.toLowerCase().includes(pickerSearch.toLowerCase())) return false;
    if (pickerFilter === "ungraded" && a.ungradedCount <= 0) return false;
    return true;
  });

  function selectSubmission(sub: Submission) {
    setSelectedSubmission(sub);
    if (sub.totalScore != null) {
      // Already graded — show the existing grade
      setScore(String(Number(sub.totalScore)));
      setFeedback(sub.feedback || "");
    } else if (sub.aiScore != null && sub.aiFeedback) {
      // AI already ran — pre-fill with AI suggestions
      setScore(String(Number(sub.aiScore)));
      const { feedback: aiFb } = parseAiFeedback(sub.aiFeedback);
      setFeedback(aiFb);
    } else {
      setScore("");
      setFeedback("");
    }
  }

  const runAiGrading = useCallback(async (submissionId: string) => {
    aiAbortRef.current = submissionId;
    setAiLoading(true);
    setAiPhase("extracting");

    const phaseTimer1 = setTimeout(() => {
      if (aiAbortRef.current === submissionId) setAiPhase("analyzing");
    }, 2000);
    const phaseTimer2 = setTimeout(() => {
      if (aiAbortRef.current === submissionId) setAiPhase("generating");
    }, 5000);

    try {
      const res = await fetch("/api/grading", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = await res.json();

      // If user navigated away from this submission, discard results
      if (aiAbortRef.current !== submissionId) return;

      if (!res.ok) {
        toast.error(data.error || "AI grading failed");
        return;
      }

      const aiResult = data.data;
      setScore(String(aiResult.score));
      setFeedback(aiResult.feedback);

      // Store structured JSON for category breakdown
      const structuredFeedback = JSON.stringify({
        categories: aiResult.categories,
        feedback: aiResult.feedback,
      });

      // Update the submission in the list with AI results
      setSelectedSubmission((prev) =>
        prev?.id === submissionId
          ? { ...prev, aiScore: aiResult.score, aiFeedback: structuredFeedback }
          : prev
      );
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, aiScore: aiResult.score, aiFeedback: structuredFeedback }
            : s
        )
      );

      toast.success("AI grading saved — review the suggestions below");
    } catch (err) {
      if (aiAbortRef.current !== submissionId) return;
      console.error("[grading:ai-assist]", { error: err instanceof Error ? err.message : String(err) });
      toast.error("AI grading failed");
    } finally {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      if (aiAbortRef.current === submissionId) {
        setAiLoading(false);
        setAiPhase(null);
        aiAbortRef.current = null;
      }
    }
  }, []);

  // Cancel AI grading if user navigates away from the submission
  useEffect(() => {
    return () => {
      if (aiAbortRef.current && aiAbortRef.current !== selectedSubmission?.id) {
        aiAbortRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubmission?.id]);

  function handleAiAssist() {
    if (!selectedSubmission) return;
    runAiGrading(selectedSubmission.id);
  }

  async function handleSaveGrade() {
    if (!selectedSubmission) return;
    const numScore = Number(score);

    if (!Number.isFinite(numScore) || numScore < 0 || numScore > maxPoints) {
      toast.error(`Score must be between 0 and ${maxPoints}`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/grading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          totalScore: numScore,
          feedback,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save grade");
        return;
      }
      toast.success("Grade saved");
      const updated = {
        ...selectedSubmission,
        totalScore: numScore,
        feedback,
        gradedAt: data.data.gradedAt || new Date().toISOString(),
        gradedBy: data.data.gradedBy || selectedSubmission.gradedBy,
      };
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSubmission.id ? updated : s))
      );
      setSelectedSubmission(updated);
    } catch (err) {
      console.error("[grading:save]", { error: err instanceof Error ? err.message : String(err) });
      toast.error("Failed to save grade");
    } finally {
      setSaving(false);
    }
  }

  async function handleReturnAssignment() {
    if (!selectedSubmission) return;
    const confirmed = window.confirm(
      "Return this assignment to the student?\n\n" +
      "This will clear the grade and feedback, allowing the student to upload a new submission. " +
      "This action cannot be undone."
    );
    if (!confirmed) return;
    setReturning(true);
    try {
      const res = await fetch("/api/grading", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: selectedSubmission.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to return assignment");
        return;
      }
      toast.success("Assignment returned — student can now resubmit");
      const cleared = {
        ...selectedSubmission,
        totalScore: null,
        feedback: null,
        gradedAt: null,
        gradedBy: null,
        aiScore: null,
        aiFeedback: null,
      };
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSubmission.id ? cleared : s))
      );
      setSelectedSubmission(cleared);
      setScore("");
      setFeedback("");
    } catch (err) {
      console.error("[grading:return]", { error: err instanceof Error ? err.message : String(err) });
      toast.error("Failed to return assignment");
    } finally {
      setReturning(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Grading
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review and grade student submissions
        </p>
      </div>

      {/* Assignment Picker & Controls */}
      <div className="space-y-3">
        {/* Assignment Picker Popover */}
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button className="flex h-10 w-full sm:w-96 items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <span className={selectedAssignmentId ? "text-gray-900 dark:text-gray-100 font-medium truncate" : "text-gray-400 dark:text-gray-500"}>
                {selectedAssignment?.title || "Select an assignment to grade"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="sm:w-96 p-0" align="start">
            {/* Search */}
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-800">
              {([
                { key: "all" as const, label: "All" },
                { key: "ungraded" as const, label: "Ungraded" },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setPickerFilter(f.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    pickerFilter === f.key
                      ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Assignment list */}
            <div className="max-h-64 overflow-y-auto p-1">
              {filteredAssignments.length === 0 ? (
                <div className="px-3 py-6 text-sm text-gray-400 text-center">
                  No matching assignments
                </div>
              ) : (
                filteredAssignments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSelectedAssignmentId(a.id);
                      setPickerOpen(false);
                      setPickerSearch("");
                    }}
                    className={`w-full text-left rounded-md px-3 py-2.5 transition-colors ${
                      a.id === selectedAssignmentId
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {a.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                      <span>{a._count.submissions} submissions</span>
                      {a.ungradedCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded font-semibold text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                          {a.ungradedCount} ungraded
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Submission controls — only visible after selecting an assignment */}
        {selectedAssignmentId && submissions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
              <SelectTrigger className="w-36 sm:w-44">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({submissions.length})</SelectItem>
                <SelectItem value="ungraded">Ungraded ({ungradedCount})</SelectItem>
                <SelectItem value="graded">Graded ({gradedCount})</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                const url = `/api/grading/export?assignmentId=${selectedAssignmentId}`;
                window.open(url, "_blank");
              }}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>

            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3 w-3" />
                {gradedCount} Graded
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <Clock className="h-3 w-3" />
                {ungradedCount} Ungraded
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      {!selectedAssignmentId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select an assignment to grade
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose an assignment from the dropdown above.
          </p>
        </div>
      ) : loadingSubmissions ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" role="status" aria-label="Loading" />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:h-[calc(100vh-16rem)]">
          {/* Submission List */}
          {!sidebarCollapsed ? (
          <div className="w-full md:w-80 shrink-0 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm max-h-[40vh] md:max-h-none">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Submissions ({filteredSubmissions.length})
                </h2>
              {selectedAssignment && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                  {selectedAssignment.title} &middot; {maxPoints} pts
                </p>
              )}
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Hide submissions list"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-1.5">
              {filteredSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="h-6 w-6 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {filterMode === "ungraded"
                      ? "All submissions graded!"
                      : filterMode === "graded"
                        ? "No graded submissions yet."
                        : "No submissions yet."}
                  </p>
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = selectedSubmission?.id === sub.id;
                  const isGraded = !!sub.gradedAt;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => selectSubmission(sub)}
                      className={`w-full text-left rounded-lg p-3 transition-colors border ${
                        isSelected
                          ? "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm"
                          : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                              : isGraded
                                ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {(sub.user.name || sub.user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {sub.user.name || sub.user.email}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {sub.user.email}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            Submitted{" "}
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }).format(new Date(sub.submittedAt))}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 ml-10 space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                            isGraded
                              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800"
                              : "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {isGraded ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {sub.totalScore != null ? Number(sub.totalScore) : "—"}/{maxPoints}
                        </span>
                        {!isGraded && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            <Clock className="h-3 w-3" />
                            Ungraded
                          </span>
                        )}
                        {sub.gradedBy?.name && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            Graded by {sub.gradedBy.name}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          ) : null}

          {/* Grading Panel */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            {selectedSubmission ? (
              <>
                {/* Panel Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                  {sidebarCollapsed && (
                    <button
                      onClick={() => setSidebarCollapsed(false)}
                      className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-1"
                      title="Show submissions list"
                    >
                      <PanelLeftOpen className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {selectedSubmission.user.name || selectedSubmission.user.email}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Submitted{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(selectedSubmission.submittedAt))}
                      </p>
                      {selectedSubmission.gradedBy?.name && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Graded by {selectedSubmission.gradedBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    {selectedSubmission.gradedAt ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Graded
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Ungraded
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-auto p-4 sm:p-6">
                  <div className="max-w-2xl mx-auto space-y-4">
                    {/* Student Report File */}
                    {selectedSubmission.fileUrl && (
                      <a
                        href={selectedSubmission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-200 truncate">
                            {selectedSubmission.fileName || "Student Report"}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Click to open PDF in new tab
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-blue-400 dark:text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-300 shrink-0" />
                      </a>
                    )}

                    {/* Grade Card */}
                    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Grade
                          </h4>
                          {selectedSubmission.aiScore != null && !aiLoading && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI: {Number(selectedSubmission.aiScore)}/{maxPoints}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAiAssist}
                          disabled={aiLoading || !selectedSubmission.fileUrl}
                          className="gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {aiLoading ? "Running..." : selectedSubmission.aiScore != null ? "Re-run AI" : "Run AI"}
                        </Button>
                      </div>

                      {/* AI Loading State */}
                      {aiLoading && (
                        <div className="px-4 py-6 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/40 dark:to-violet-900/40 flex items-center justify-center">
                                <Sparkles className="w-7 h-7 text-blue-500 dark:text-blue-400 animate-pulse" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 animate-ping opacity-40" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                AI is grading this report
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                You can read the PDF while waiting
                              </p>
                            </div>

                            {/* Progress Steps */}
                            <div className="w-full max-w-xs space-y-2">
                              {([
                                { key: "extracting" as const, icon: BookOpen, label: "Extracting text from PDF..." },
                                { key: "analyzing" as const, icon: Brain, label: "Analyzing cosmological content..." },
                                { key: "generating" as const, icon: MessageSquare, label: "Writing feedback..." },
                              ]).map((step) => {
                                const phases = ["extracting", "analyzing", "generating"] as const;
                                const currentIdx = aiPhase ? phases.indexOf(aiPhase) : -1;
                                const stepIdx = phases.indexOf(step.key);
                                const isActive = stepIdx === currentIdx;
                                const isDone = stepIdx < currentIdx;
                                return (
                                  <div
                                    key={step.key}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
                                      isActive
                                        ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                                        : isDone
                                          ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                                          : ""
                                    }`}
                                  >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${
                                      isActive
                                        ? "bg-blue-500 text-white"
                                        : isDone
                                          ? "bg-emerald-500 text-white"
                                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                    }`}>
                                      {isDone ? (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      ) : (
                                        <step.icon className={`w-3.5 h-3.5 ${isActive ? "animate-pulse" : ""}`} />
                                      )}
                                    </div>
                                    <span className={`text-xs font-medium transition-colors duration-500 ${
                                      isActive
                                        ? "text-blue-700 dark:text-blue-300"
                                        : isDone
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-gray-400 dark:text-gray-500"
                                    }`}>
                                      {isDone ? step.label.replace("...", "") : step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Category Breakdown */}
                      {(() => {
                        const { categories } = parseAiFeedback(selectedSubmission.aiFeedback);
                        if (!categories || aiLoading) return null;
                        return (
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                              AI Category Breakdown
                            </p>
                            <div className="space-y-2">
                              {CATEGORY_META.map((meta) => {
                                const cat = categories[meta.key];
                                if (!cat) return null;
                                const pct = meta.maxScore > 0 ? (cat.score / meta.maxScore) * 100 : 0;
                                return (
                                  <div key={meta.key} className="group">
                                    <div className="flex items-center justify-between text-xs mb-0.5">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {meta.label}
                                      </span>
                                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {cat.score}/{meta.maxScore}
                                      </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${scoreColor(cat.score, meta.maxScore)}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 hidden group-hover:block">
                                      {cat.rationale}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {selectedSubmission.aiScore != null ? Number(selectedSubmission.aiScore) : "—"}/{maxPoints}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="p-4 space-y-4">
                        <div>
                          <Label htmlFor="score">
                            Score (out of {maxPoints})
                          </Label>
                          <Input
                            id="score"
                            type="number"
                            min={0}
                            max={maxPoints}
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            placeholder={aiLoading ? "AI will suggest a score..." : "0"}
                            disabled={aiLoading}
                          />
                        </div>

                        <div>
                          <Label htmlFor="feedback">Feedback</Label>
                          <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder={aiLoading ? "AI is generating feedback..." : "Provide feedback on the student's report..."}
                            rows={8}
                            disabled={aiLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-end gap-2">
                            {selectedSubmission.gradedAt && (
                              <Button
                                variant="outline"
                                onClick={handleReturnAssignment}
                                disabled={returning || aiLoading}
                                className="gap-2"
                                title="Clear the grade and allow the student to resubmit"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {returning ? "Returning..." : "Return to Student"}
                              </Button>
                            )}
                            <Button onClick={handleSaveGrade} disabled={saving || !score || aiLoading}>
                              {saving
                                ? "Saving..."
                                : selectedSubmission.gradedAt
                                  ? "Update Grade"
                                  : "Submit Grade"}
                            </Button>
                          </div>
                          {selectedSubmission.gradedAt && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                              &ldquo;Return to Student&rdquo; clears the grade and lets the student upload a new submission.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 relative">
                {sidebarCollapsed && (
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors absolute top-4 left-4"
                    title="Show submissions list"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}
                <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Select a submission to grade
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose a student from the list on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
