import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt";

// Optimistic check only (cookie + signature, no DB) — Proxy runs on every
// request including prefetches, so the DB-backed "secure" check lives in
// verifySession() inside Server Actions/Components instead.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const payload = await verifySessionToken(token);

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|login|templates).*)",
  ],
};
