import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getImpersonatedUser } from "@/lib/impersonate";
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
  const impersonation = await getImpersonatedUser();

  if (impersonation) {
    return (
      <MainLayoutClient
        userName={impersonation.impersonatedUser.name || "User"}
        userEmail={impersonation.impersonatedUser.email}
        userImage={impersonation.impersonatedUser.image || undefined}
        userRole={impersonation.impersonatedUser.role}
        isImpersonating
        realUserName={impersonation.realUser.name || "Admin"}
      >
        {children}
      </MainLayoutClient>
    );
  }

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
