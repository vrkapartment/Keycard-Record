"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardStatus, Prisma } from "@/generated/prisma/client";
import { isCardStatus, isValidCardCode } from "@/lib/validation";
import { verifySession } from "@/lib/session";

export async function createCard(formData: FormData) {
  await verifySession();
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
  await verifySession();
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
  await verifySession();
  const existing = await prisma.keycard.findUnique({ where: { id: cardId } });
  if (!existing) {
    redirect("/cards");
  }

  try {
    await prisma.keycard.delete({ where: { id: cardId } });
  } catch (err) {
    const alreadyGone =
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025";
    if (!alreadyGone) throw err;
  }
  revalidatePath("/cards");
  revalidatePath(`/rooms/${existing.roomId}`);
  redirect("/cards");
}

export async function changeCardStatus(cardId: number, formData: FormData) {
  await verifySession();
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
