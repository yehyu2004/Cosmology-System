import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "impersonate-uid";

export interface ImpersonationResult {
  realUser: {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
    role: string;
  };
  impersonatedUser: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
}

export async function getImpersonatedUser(): Promise<ImpersonationResult | null> {
  const cookieStore = await cookies();
  const uid = cookieStore.get(COOKIE_NAME)?.value;
  if (!uid) return null;

  const session = await auth();
  if (!session?.user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const realRole = (session.user as any).role as string;
  if (realRole !== "ADMIN") return null;

  const impersonatedUser = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  if (!impersonatedUser) return null;

  return {
    realUser: {
      id: session.user.id!,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image,
      role: realRole,
    },
    impersonatedUser,
  };
}
