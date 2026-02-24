import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    cookieName: request.nextUrl.protocol === "https:"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  if (!token) {
    const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assignments/:path*",
    "/grades/:path*",
    "/grading/:path*",
    "/simulations/:path*",
    "/settings/:path*",
    "/api/((?!auth).*)",
  ],
};
