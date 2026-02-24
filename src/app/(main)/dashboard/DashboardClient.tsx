"use client";

import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Assignment {
  id: string;
  title: string;
  reportNumber: number;
  dueDate: string | null;
  totalPoints: number;
  submissions: {
    id: string;
    userId: string;
    totalScore: number | null;
    gradedAt: string | null;
    submittedAt: string;
  }[];
}

interface Student {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  userRole: string;
  userId: string;
  assignments: Assignment[];
  students: Student[];
}

export default function DashboardClient({ userRole, userId, assignments, students }: Props) {
  const isStaff = userRole !== "STUDENT";

  if (isStaff) {
    return <StaffDashboard assignments={assignments} students={students} />;
  }
  return <StudentDashboard assignments={assignments} userId={userId} />;
}

function StaffDashboard({ assignments, students }: { assignments: Assignment[]; students: Student[] }) {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Overview</h1>
        <p className="text-gray-500 mt-1">{students.length} students enrolled</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assignments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Submissions to Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {assignments.reduce((acc, a) => acc + a.submissions.filter((s) => !s.gradedAt).length, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-800">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">Student</th>
                    {assignments.map((a) => (
                      <th key={a.id} className="text-center py-2 px-2 font-medium text-gray-500">
                        Report {a.reportNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b dark:border-gray-800">
                      <td className="py-2 pr-4 text-gray-900 dark:text-white">
                        {student.name || student.email}
                      </td>
                      {assignments.map((a) => {
                        const sub = a.submissions.find((s) => s.userId === student.id);
                        return (
                          <td key={a.id} className="text-center py-2 px-2">
                            {!sub ? (
                              <Badge variant="secondary" className="text-xs">Not submitted</Badge>
                            ) : sub.gradedAt ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                {Number(sub.totalScore)}/{Number(a.totalPoints)}
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                                Submitted
                              </Badge>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StudentDashboard({ assignments, userId }: { assignments: Assignment[]; userId: string }) {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No assignments published yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => {
            const submission = assignment.submissions.find((s) => s.userId === userId);
            const isDuePast = assignment.dueDate && new Date(assignment.dueDate) < new Date();

            return (
              <Card key={assignment.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                    <p className="text-sm text-gray-500">
                      {assignment.dueDate
                        ? `Due: ${new Date(assignment.dueDate).toLocaleDateString()}`
                        : "No due date"}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {!submission ? (
                      isDuePast ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="w-3 h-3" /> Missing
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" /> Not submitted
                        </Badge>
                      )
                    ) : submission.gradedAt ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {Number(submission.totalScore)}/{Number(assignment.totalPoints)}
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 gap-1">
                        <Clock className="w-3 h-3" /> Awaiting grade
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
