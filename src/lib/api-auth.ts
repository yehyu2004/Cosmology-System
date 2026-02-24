import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UserRole = "STUDENT" | "TA" | "PROFESSOR" | "ADMIN";

export interface ApiUser {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  image?: string | null;
}

export interface AuthResult {
  user: ApiUser;
}

export async function requireApiAuth(): Promise<AuthResult | NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as ApiUser;
  return { user };
}

export async function requireApiRole(
  roles: UserRole[]
): Promise<AuthResult | NextResponse> {
  const result = await requireApiAuth();
  if (result instanceof NextResponse) return result;
  if (!roles.includes(result.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

export function isErrorResponse(
  result: AuthResult | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}

/**
 * Returns the effective user for API requests, supporting admin impersonation.
 * For GET requests: if the real user is ADMIN and impersonate-uid cookie is set,
 * returns the impersonated user.
 * For mutating requests (POST/PATCH/PUT/DELETE): always returns the real user.
 */
export async function getEffectiveUser(
  req: NextRequest
): Promise<AuthResult | NextResponse> {
  const result = await requireApiAuth();
  if (result instanceof NextResponse) return result;

  if (req.method !== "GET") return result;
  if (result.user.role !== "ADMIN") return result;

  const cookieStore = await cookies();
  const uid = cookieStore.get("impersonate-uid")?.value;
  if (!uid) return result;

  const target = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  if (!target) return result;

  return { user: { ...target, role: target.role as UserRole } };
}
