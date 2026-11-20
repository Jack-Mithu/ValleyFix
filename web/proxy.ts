import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/app/lib/session";

// Next.js 16 "Proxy" (formerly Middleware) runs before every matched request.
//
// This is only an OPTIMISTIC check: "is there a session cookie at all?"
// It does not verify the token (that would mean calling the backend on every
// request, including prefetches). The real check happens in each protected
// page via getCurrentUser(), and the backend checks again on every API call.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only run on areas that need a logged-in user.
  matcher: ["/dashboard/:path*", "/technician/:path*", "/admin/:path*"],
};
