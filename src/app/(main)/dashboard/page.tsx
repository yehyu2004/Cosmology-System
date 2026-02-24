import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session.user as any).role as string;
  const userId = session.user.id;

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

  return (
    <DashboardClient
      userRole={userRole}
      userId={userId}
      assignments={JSON.parse(JSON.stringify(assignments))}
      students={students}
    />
  );
}
