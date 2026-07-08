"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardStatus } from "@/generated/prisma/client";
import { isCardStatus, isValidCardCode } from "@/lib/validation";

export async function createCard(formData: FormData) {
  const roomId = Number(formData.get("roomId"));
  const code = String(formData.get("code") ?? "").trim();

  if (!roomId || !isValidCardCode(code)) {
    redirect(
      `/cards/new?error=${encodeURIComponent(
        "กรุณาเลือกห้องและกรอกรหัสบัตรเป็นตัวเลข 5 หลัก"
      )}`
    );
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    redirect(`/cards/new?error=${encodeURIComponent("ไม่พบห้องที่เลือก")}`);
  }

  await prisma.keycard.create({ data: { roomId, code } });
  revalidatePath("/cards");
  revalidatePath(`/rooms/${roomId}`);
  redirect("/cards");
}

export async function updateCard(cardId: number, formData: FormData) {
  const roomId = Number(formData.get("roomId"));
  const code = String(formData.get("code") ?? "").trim();

  if (!roomId || !isValidCardCode(code)) {
    redirect(
      `/cards/${cardId}/edit?error=${encodeURIComponent(
        "กรุณาเลือกห้องและกรอกรหัสบัตรเป็นตัวเลข 5 หลัก"
      )}`
    );
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    redirect(
      `/cards/${cardId}/edit?error=${encodeURIComponent("ไม่พบห้องที่เลือก")}`
    );
  }

  await prisma.keycard.update({
    where: { id: cardId },
    data: { roomId, code },
  });
  revalidatePath("/cards");
  revalidatePath(`/cards/${cardId}`);
  redirect(`/cards/${cardId}`);
}

export async function deleteCard(cardId: number) {
  const card = await prisma.keycard.delete({ where: { id: cardId } });
  revalidatePath("/cards");
  revalidatePath(`/rooms/${card.roomId}`);
  redirect("/cards");
}

export async function changeCardStatus(cardId: number, formData: FormData) {
  const status = String(formData.get("status") ?? "");

  if (!isCardStatus(status)) {
    redirect(`/cards/${cardId}?error=${encodeURIComponent("สถานะไม่ถูกต้อง")}`);
  }

  const now = new Date();
  await prisma.keycard.update({
    where: { id: cardId },
    data: {
      status,
      statusChangedAt: now,
      cancelledAt: status === CardStatus.INACTIVE ? now : null,
    },
  });
  revalidatePath("/cards");
  revalidatePath(`/cards/${cardId}`);
  revalidatePath("/");
  redirect(`/cards/${cardId}`);
}
