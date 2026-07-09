"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, verifySession } from "@/lib/session";

const PIN_REGEX = /^\d{6}$/;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

async function getClientIp() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

function safeNextPath(next: string) {
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("://")
    ? next
    : "/";
}

export async function login(formData: FormData) {
  const pin = String(formData.get("pin") ?? "").trim();
  const next = safeNextPath(String(formData.get("next") ?? "/"));
  const ip = await getClientIp();

  const recentAttempts = await prisma.loginAttempt.count({
    where: { ip, createdAt: { gt: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) } },
  });

  if (recentAttempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    redirect(
      `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        "พยายามผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่"
      )}`
    );
  }

  if (!PIN_REGEX.test(pin)) {
    redirect(
      `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        "กรุณากรอกรหัส PIN 6 หลัก"
      )}`
    );
  }

  const config = await prisma.appConfig.findFirst();
  const valid = config ? await bcrypt.compare(pin, config.pinHash) : false;

  if (!valid || !config) {
    await prisma.loginAttempt.create({ data: { ip } });
    redirect(
      `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        "รหัส PIN ไม่ถูกต้อง"
      )}`
    );
  }

  await prisma.loginAttempt.deleteMany({ where: { ip } });
  await createSession(config.version);
  redirect(next);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function changePin(formData: FormData) {
  await verifySession();

  const currentPin = String(formData.get("currentPin") ?? "").trim();
  const newPin = String(formData.get("newPin") ?? "").trim();
  const confirmPin = String(formData.get("confirmPin") ?? "").trim();

  const config = await prisma.appConfig.findFirst();
  if (!config) {
    redirect(`/settings?error=${encodeURIComponent("ยังไม่มีการตั้งค่า PIN")}`);
  }

  const currentValid = await bcrypt.compare(currentPin, config.pinHash);
  if (!currentValid) {
    redirect(`/settings?error=${encodeURIComponent("รหัส PIN ปัจจุบันไม่ถูกต้อง")}`);
  }

  if (!PIN_REGEX.test(newPin)) {
    redirect(`/settings?error=${encodeURIComponent("รหัส PIN ใหม่ต้องเป็นตัวเลข 6 หลัก")}`);
  }

  if (newPin !== confirmPin) {
    redirect(`/settings?error=${encodeURIComponent("รหัส PIN ใหม่ไม่ตรงกัน (ยืนยันไม่ตรงกับที่กรอก)")}`);
  }

  const newHash = await bcrypt.hash(newPin, 10);
  const updated = await prisma.appConfig.update({
    where: { id: config.id },
    data: { pinHash: newHash, version: { increment: 1 } },
  });

  // Re-issue this session under the new version so the person who just
  // changed the PIN doesn't get logged out too — every OTHER active session
  // (on other staff phones) will be rejected on their next request.
  await createSession(updated.version);

  redirect("/settings?success=1");
}
