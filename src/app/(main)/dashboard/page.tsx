import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getImpersonatedUser } from "@/lib/impersonate";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const impersonation = await getImpersonatedUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = impersonation ? impersonation.impersonatedUser.role : ((session.user as any).role as string);
  const userId = impersonation ? impersonation.impersonatedUser.id : session.user.id!;
  const userName = impersonation ? (impersonation.impersonatedUser.name || "Student") : (session.user.name || "Student");

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const assignments = await prisma.assignment.findMany({
    where: { published: true },
    orderBy: { reportNumber: "asc" },
    include: {
      submissions: {
        select: {
          id: true,
          userId: true,
          totalScore: true,
          gradedAt: true,
          submittedAt: true,
        },
      },
    },
  });

  const students = userRole !== "STUDENT"
    ? await prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true },
      })
    : [];

  const recentSubmissions = await prisma.submission.findMany({
    where: userRole === "STUDENT" ? { userId } : {},
    orderBy: { submittedAt: "desc" },
    take: 5,
    include: {
      user: { select: { name: true, email: true } },
      assignment: { select: { id: true, title: true, reportNumber: true, totalPoints: true } },
    },
  });

  return (
    <DashboardClient
      userRole={userRole}
      userId={userId}
      userName={userName}
      formattedDate={formattedDate}
      assignments={JSON.parse(JSON.stringify(assignments))}
      students={students}
      recentSubmissions={JSON.parse(JSON.stringify(recentSubmissions))}
    />
  );
}
