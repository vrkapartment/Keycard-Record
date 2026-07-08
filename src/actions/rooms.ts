"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createRoom(formData: FormData) {
  const number = String(formData.get("number") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!number) {
    redirect(`/rooms/new?error=${encodeURIComponent("กรุณาระบุหมายเลขห้อง")}`);
  }

  const existing = await prisma.room.findUnique({ where: { number } });
  if (existing) {
    redirect(`/rooms/new?error=${encodeURIComponent("มีห้องหมายเลขนี้อยู่แล้ว")}`);
  }

  await prisma.room.create({ data: { number, note: note || null } });
  revalidatePath("/rooms");
  redirect("/rooms");
}

export async function updateRoom(roomId: number, formData: FormData) {
  const number = String(formData.get("number") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!number) {
    redirect(
      `/rooms/${roomId}/edit?error=${encodeURIComponent("กรุณาระบุหมายเลขห้อง")}`
    );
  }

  const existing = await prisma.room.findUnique({ where: { number } });
  if (existing && existing.id !== roomId) {
    redirect(
      `/rooms/${roomId}/edit?error=${encodeURIComponent("มีห้องหมายเลขนี้อยู่แล้ว")}`
    );
  }

  await prisma.room.update({
    where: { id: roomId },
    data: { number, note: note || null },
  });
  revalidatePath("/rooms");
  revalidatePath(`/rooms/${roomId}`);
  redirect(`/rooms/${roomId}`);
}

export async function deleteRoom(roomId: number) {
  const cardCount = await prisma.keycard.count({ where: { roomId } });
  if (cardCount > 0) {
    redirect(
      `/rooms/${roomId}?error=${encodeURIComponent(
        "ลบห้องนี้ไม่ได้ เนื่องจากยังมีบัตรคีย์การ์ดอยู่ในห้อง"
      )}`
    );
  }

  await prisma.room.delete({ where: { id: roomId } });
  revalidatePath("/rooms");
  redirect("/rooms");
}
