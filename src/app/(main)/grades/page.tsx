"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Grades</h1>

      {grades.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No graded submissions yet.
          </CardContent>
        </Card>
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
