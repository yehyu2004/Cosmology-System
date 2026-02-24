import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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
