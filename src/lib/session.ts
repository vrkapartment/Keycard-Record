import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signSession, verifySessionToken } from "@/lib/jwt";

const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export async function createSession(version: number) {
  const token = await signSession({ v: version });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// "Secure" check per the Next.js authentication guide's optimistic-vs-secure
// distinction: this hits the DB to confirm the session's PIN version still
// matches, so changing the shared PIN invalidates every other active session.
export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const payload = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!payload) redirect("/login");

  const config = await prisma.appConfig.findFirst();
  if (!config || payload.v !== config.version) redirect("/login");

  return { authenticated: true as const };
});
