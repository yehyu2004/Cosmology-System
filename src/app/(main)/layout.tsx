import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayoutClient from "./MainLayoutClient";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session.user as any).role || "STUDENT";

  return (
    <MainLayoutClient
      userName={session.user.name || "User"}
      userEmail={session.user.email || ""}
      userImage={session.user.image || undefined}
      userRole={userRole}
    >
      {children}
    </MainLayoutClient>
  );
}
