"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

interface GradeEntry {
  id: string;
  totalScore: number | null;
  gradedAt: string | null;
  feedback: string | null;
  submittedAt: string;
  assignment: {
    id: string;
    title: string;
    reportNumber: number;
    totalPoints: number;
  };
  gradedBy: { name: string | null } | null;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grades")
      .then((r) => r.json())
      .then((d) => setGrades(d.data || []))
      .catch((err) => console.error("[grades:fetch]", { error: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Grades</h1>

      {grades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <GraduationCap className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            No graded submissions yet.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Your grades will appear here once your submissions are reviewed.
          </p>
          <Link
            href="/assignments"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-700 transition-colors"
          >
            View Assignments
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {grades.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{entry.assignment.title}</CardTitle>
                  <p className="text-sm text-gray-500">Report {entry.assignment.reportNumber}</p>
                </div>
                {entry.gradedAt ? (
                  <Badge className="text-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {Number(entry.totalScore)} / {Number(entry.assignment.totalPoints)}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Awaiting grade</Badge>
                )}
              </CardHeader>
              {entry.feedback && (
                <CardContent>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs font-medium text-gray-500 mb-1">Feedback</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {entry.feedback}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
