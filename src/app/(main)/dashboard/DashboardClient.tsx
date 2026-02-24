"use client";

import Link from "next/link";
import {
  Users,
  FileText,
  CheckCircle2,
  Clock,
  BookOpen,
  PlusCircle,
  Telescope,
  ClipboardCheck,
  BarChart3,
  AlertCircle,
  Calendar,
} from "lucide-react";
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

interface RecentSubmission {
  id: string;
  submittedAt: string;
  totalScore: number | null;
  gradedAt: string | null;
  user: { name: string | null; email: string };
  assignment: { id: string; title: string; reportNumber: number; totalPoints: number };
}

interface Props {
  userRole: string;
  userId: string;
  userName: string;
  formattedDate: string;
  assignments: Assignment[];
  students: Student[];
  recentSubmissions: RecentSubmission[];
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function DashboardClient({
  userRole,
  userId,
  userName,
  formattedDate,
  assignments,
  students,
  recentSubmissions,
}: Props) {
  const isStaff = userRole !== "STUDENT";

  const totalStudents = students.length;
  const totalAssignments = assignments.length;
  const ungradedCount = assignments.reduce(
    (acc, a) => acc + a.submissions.filter((s) => !s.gradedAt).length,
    0
  );

  const mySubmissions = assignments.filter((a) =>
    a.submissions.some((s) => s.userId === userId)
  );
  const myGraded = assignments.filter((a) =>
    a.submissions.some((s) => s.userId === userId && s.gradedAt)
  );

  // Stats config
  const statsCards = isStaff
    ? [
        {
          label: "Total Students",
          value: totalStudents,
          icon: Users,
          href: "/admin/users",
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-500/10",
        },
        {
          label: "Assignments",
          value: totalAssignments,
          icon: FileText,
          href: "/assignments",
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-500/10",
        },
        {
          label: "To Grade",
          value: ungradedCount,
          icon: ClipboardCheck,
          href: "/grading",
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-50 dark:bg-amber-500/10",
        },
      ]
    : [
        {
          label: "Available",
          value: totalAssignments,
          icon: FileText,
          href: "/assignments",
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-500/10",
        },
        {
          label: "Submitted",
          value: mySubmissions.length,
          icon: CheckCircle2,
          href: "/assignments",
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-500/10",
        },
        {
          label: "Graded",
          value: myGraded.length,
          icon: BarChart3,
          href: "/grades",
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-500/10",
        },
      ];

  // Quick start actions
  const quickActions = [
    {
      label: "Assignments",
      description: isStaff ? "Manage assignments" : "View & submit",
      href: "/assignments",
      icon: BookOpen,
      roles: ["STUDENT", "TA", "PROFESSOR", "ADMIN"],
    },
    {
      label: "Simulations",
      description: "Interactive demos",
      href: "/simulations",
      icon: Telescope,
      roles: ["STUDENT", "TA", "PROFESSOR", "ADMIN"],
    },
    {
      label: "Create Assignment",
      description: "New report task",
      href: "/assignments/create",
      icon: PlusCircle,
      roles: ["TA", "PROFESSOR", "ADMIN"],
    },
    {
      label: "Grading",
      description: "Review submissions",
      href: "/grading",
      icon: ClipboardCheck,
      roles: ["TA", "PROFESSOR", "ADMIN"],
    },
    {
      label: "My Grades",
      description: "Scores & feedback",
      href: "/grades",
      icon: BarChart3,
      roles: ["STUDENT"],
    },
  ].filter((a) => a.roles.includes(userRole));

  // Upcoming deadlines (student)
  const upcomingDeadlines = assignments
    .filter((a) => {
      if (!a.dueDate) return false;
      const due = new Date(a.dueDate);
      return due >= new Date();
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* A. Welcome Section */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {userName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{formattedDate}</p>
      </div>

      {/* B. Overview Stats */}
      <div>
        <SectionHeading title="Overview" subtitle="Your key numbers at a glance" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsCards.map((card, i) => (
            <Link
              key={card.label}
              href={card.href}
              className="animate-fade-in card-minimal p-5 flex items-center gap-4 hover:shadow-md active:scale-[0.98] transition-all"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* C. Quick Start */}
      <div>
        <SectionHeading title="Quick Start" subtitle="Jump to a section" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link
              key={action.label}
              href={action.href}
              className="animate-fade-in card-minimal p-4 flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all group"
              style={{ animationDelay: `${(i + 3) * 80}ms` }}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                <action.icon className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* D. Recent Activity */}
      <div>
        <SectionHeading title="Recent Activity" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Recent Submissions */}
          <div
            className="animate-fade-in card-minimal p-5"
            style={{ animationDelay: `${(quickActions.length + 3) * 80}ms` }}
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Recent Submissions
            </h3>
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No submissions yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentSubmissions.map((sub) => (
                  <li key={sub.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={isStaff ? `/grading` : `/assignments/${sub.assignment.id}`}
                      className="flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {isStaff
                            ? sub.user.name || sub.user.email
                            : sub.assignment.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isStaff && (
                            <span>Report {sub.assignment.reportNumber} &middot; </span>
                          )}
                          {new Date(sub.submittedAt).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {sub.gradedAt ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {Number(sub.totalScore)}/{Number(sub.assignment.totalPoints)}
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs gap-1">
                            <Clock className="w-3 h-3" />
                            {isStaff ? "Needs grading" : "Pending"}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: Deadlines (student) / Submission Status (staff) */}
          <div
            className="animate-fade-in card-minimal p-5"
            style={{ animationDelay: `${(quickActions.length + 4) * 80}ms` }}
          >
            {isStaff ? (
              <>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  Submission Status
                </h3>
                {assignments.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">No assignments yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {assignments.map((a) => {
                      const submitted = a.submissions.length;
                      const graded = a.submissions.filter((s) => s.gradedAt).length;
                      return (
                        <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                          <Link
                            href="/grading"
                            className="flex items-center justify-between gap-3 group"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Report {a.reportNumber}: {a.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {submitted}/{totalStudents} submitted &middot; {graded}/{submitted || 1} graded
                              </p>
                            </div>
                            {submitted > 0 && graded === submitted ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                Complete
                              </Badge>
                            ) : submitted > graded ? (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                                {submitted - graded} to grade
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                No submissions
                              </Badge>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Upcoming Deadlines
                </h3>
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">No upcoming deadlines.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {upcomingDeadlines.map((a) => {
                      const due = new Date(a.dueDate!);
                      const daysLeft = Math.ceil(
                        (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );
                      const submitted = a.submissions.some((s) => s.userId === userId);
                      return (
                        <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                          <Link
                            href={`/assignments/${a.id}`}
                            className="flex items-center justify-between gap-3 group"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {a.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Due {due.toLocaleDateString("en-US")} &middot;{" "}
                                {daysLeft <= 1 ? "Due tomorrow" : `${daysLeft} days left`}
                              </p>
                            </div>
                            {submitted ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Submitted
                              </Badge>
                            ) : daysLeft <= 2 ? (
                              <Badge variant="destructive" className="text-xs gap-1">
                                <AlertCircle className="w-3 h-3" /> Urgent
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Clock className="w-3 h-3" /> Pending
                              </Badge>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
