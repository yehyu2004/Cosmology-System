"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, FileText, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  reportNumber: number;
  totalPoints: number;
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

export default function GradingPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assignments")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.data || []).filter((a: Assignment) => true);
        setAssignments(list);
        if (list.length > 0) setSelectedAssignment(list[0].id);
      })
      .catch((err) => console.error("[grading:fetch-assignments]", { error: err.message }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAssignment) return;
    fetch(`/api/assignments/${selectedAssignment}/submissions`)
      .then((r) => r.json())
      .then((d) => {
        setSubmissions(d.data || []);
        setSelectedSubmission(null);
      })
      .catch((err) => console.error("[grading:fetch-submissions]", { error: err.message }));
  }, [selectedAssignment]);

  function selectSubmission(sub: Submission) {
    setSelectedSubmission(sub);
    setScore(sub.totalScore != null ? String(Number(sub.totalScore)) : "");
    setFeedback(sub.feedback || "");
  }

  async function handleAiAssist() {
    if (!selectedSubmission) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/grading", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: selectedSubmission.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "AI grading failed");
        return;
      }
      setScore(String(data.data.score));
      setFeedback(data.data.feedback);
      toast.success("AI suggestion loaded");
    } catch (err) {
      console.error("[grading:ai-assist]", { error: err instanceof Error ? err.message : String(err) });
      toast.error("AI grading failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSaveGrade() {
    if (!selectedSubmission) return;
    const numScore = Number(score);
    const assignment = assignments.find((a) => a.id === selectedAssignment);
    if (!assignment) return;

    if (!Number.isFinite(numScore) || numScore < 0 || numScore > Number(assignment.totalPoints)) {
      toast.error(`Score must be between 0 and ${Number(assignment.totalPoints)}`);
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
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSubmission.id
            ? { ...s, totalScore: numScore, feedback, gradedAt: new Date().toISOString() }
            : s
        )
      );
      setSelectedSubmission({
        ...selectedSubmission,
        totalScore: numScore,
        feedback,
        gradedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[grading:save]", { error: err instanceof Error ? err.message : String(err) });
      toast.error("Failed to save grade");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-80 border-r dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 shrink-0">
        <div className="p-4 border-b dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Grading</h2>
          <select
            className="w-full rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                Report {a.reportNumber}: {a.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {submissions.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No submissions yet.</p>
          ) : (
            submissions.map((sub) => (
              <button
                key={sub.id}
                onClick={() => selectSubmission(sub)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                  selectedSubmission?.id === sub.id && "bg-indigo-50 dark:bg-indigo-500/10"
                )}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {sub.user.name || sub.user.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {sub.gradedAt ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                      Graded: {Number(sub.totalScore)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Ungraded</Badge>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!selectedSubmission ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a submission to grade
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedSubmission.user.name || selectedSubmission.user.email}
                </h3>
                <p className="text-sm text-gray-500">
                  Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>
              {selectedSubmission.fileUrl && (
                <a href={selectedSubmission.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View PDF
                  </Button>
                </a>
              )}
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Grade</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAiAssist}
                  disabled={aiLoading || !selectedSubmission.fileUrl}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiLoading ? "Analyzing..." : "AI Assist"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="score">
                    Score (out of{" "}
                    {Number(assignments.find((a) => a.id === selectedAssignment)?.totalPoints || 100)})
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    min={0}
                    max={Number(assignments.find((a) => a.id === selectedAssignment)?.totalPoints || 100)}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback on the student's report..."
                    rows={8}
                  />
                </div>

                {selectedSubmission.aiFeedback && (
                  <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                      AI Suggestion: {Number(selectedSubmission.aiScore)} pts
                    </p>
                    <p className="text-sm text-indigo-800 dark:text-indigo-300 whitespace-pre-wrap">
                      {selectedSubmission.aiFeedback}
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSaveGrade} disabled={saving || !score}>
                    {saving ? "Saving..." : selectedSubmission.gradedAt ? "Update Grade" : "Submit Grade"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
