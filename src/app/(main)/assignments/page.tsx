"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { useEffectiveRole } from "@/components/providers/EffectiveRoleContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateOnly } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  totalPoints: number;
  published: boolean;
  reportNumber: number;
  createdBy: { name: string | null };
  _count: { submissions: number };
  mySubmission?: { totalScore: number | null; gradedAt: string | null } | null;
}

export default function AssignmentsPage() {
  const userRole = useEffectiveRole();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const isStaff = ["TA", "PROFESSOR", "ADMIN"].includes(userRole);

  useEffect(() => {
    fetch("/api/assignments")
      .then((r) => r.json())
      .then((d) => setAssignments(d.data || []))
      .catch((err) => console.error("[assignments:fetch]", { error: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        {isStaff && (
          <Link href="/assignments/create">
            <Button className="gap-2" size="sm">
              <Plus className="w-4 h-4" />
              Create Assignment
            </Button>
          </Link>
        )}
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No assignments yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Link key={assignment.id} href={`/assignments/${assignment.id}`}>
              <Card className="hover:border-blue-500/30 active:scale-[0.99] transition-all cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {assignment.title}
                      </h3>
                      {!assignment.published && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {assignment.dueDate ? formatDateOnly(assignment.dueDate) : "No due date"}
                      </span>
                      {isStaff && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {assignment._count.submissions} {assignment._count.submissions === 1 ? "submission" : "submissions"}
                        </span>
                      )}
                      <span>{Number(assignment.totalPoints)} pts</span>
                    </div>
                  </div>
                  {!isStaff && assignment.mySubmission && (
                    assignment.mySubmission.gradedAt ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {assignment.mySubmission.totalScore}/{assignment.totalPoints}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                    )
                  )}
                  <Badge variant="outline">Report {assignment.reportNumber}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
