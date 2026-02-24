"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  totalPoints: number;
  reportNumber: number;
  rubric: string | null;
  published: boolean;
}

interface Submission {
  id: string;
  fileUrl: string | null;
  fileName: string | null;
  submittedAt: string;
  totalScore: number | null;
  gradedAt: string | null;
  feedback: string | null;
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role as string | undefined;
  const isStaff = userRole && ["TA", "PROFESSOR", "ADMIN"].includes(userRole);

  useEffect(() => {
    fetch(`/api/assignments/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setAssignment(d.data?.assignment || null);
        setSubmission(d.data?.submission || null);
      })
      .catch((err) => console.error("[assignment:fetch]", { error: err.message }))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !assignment) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadData.error || "Upload failed");
        return;
      }

      const subRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          fileUrl: uploadData.data.url,
          fileName: uploadData.data.name,
        }),
      });
      const subData = await subRes.json();
      if (!subRes.ok) {
        toast.error(subData.error || "Submission failed");
        return;
      }

      setSubmission(subData.data);
      toast.success("Report submitted successfully");
    } catch (err) {
      console.error("[submission:upload]", { error: err instanceof Error ? err.message : String(err) });
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6 text-center text-gray-500">Assignment not found.</div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{assignment.title}</h1>
            <Badge variant="outline">Report {assignment.reportNumber}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {assignment.dueDate
              ? `Due: ${new Date(assignment.dueDate).toLocaleString()}`
              : "No due date"}{" "}
            · {Number(assignment.totalPoints)} points
          </p>
        </div>
      </div>

      {assignment.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{assignment.description}</p>
          </CardContent>
        </Card>
      )}

      {!isStaff && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Submission</CardTitle>
          </CardHeader>
          <CardContent>
            {submission ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Submitted: {submission.fileName}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  {submission.fileUrl && (
                    <Link href={submission.fileUrl} target="_blank">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  )}
                </div>

                {submission.gradedAt && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Grade</span>
                      <Badge className="text-base">
                        {Number(submission.totalScore)} / {Number(assignment.totalPoints)}
                      </Badge>
                    </div>
                    {submission.feedback && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Feedback</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" disabled={uploading} asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Uploading..." : "Re-upload"}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No submission yet. Upload your report (PDF).</p>
                <label className="cursor-pointer">
                  <Button disabled={uploading} asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Report"}
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isStaff && (
        <Card>
          <CardContent className="py-6 text-center">
            <Link href="/grading">
              <Button>Go to Grading</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
