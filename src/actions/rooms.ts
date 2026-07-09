"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardStatus, Prisma } from "@/generated/prisma/client";
import { isCardStatus, isSafeLocalPath, isValidCardCode } from "@/lib/validation";
import { verifySession } from "@/lib/session";

// Returns undefined when the CSV cell is blank (caller should fall back to
// a default), null when it's present but not a parseable date.
function parseOptionalDate(value: string): Date | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createRoom(formData: FormData) {
  await verifySession();
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
  await verifySession();
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
  await verifySession();
  const cardCount = await prisma.keycard.count({ where: { roomId } });
  if (cardCount > 0) {
    redirect(
      `/rooms/${roomId}?error=${encodeURIComponent(
        "ลบห้องนี้ไม่ได้ เนื่องจากยังมีบัตรคีย์การ์ดอยู่ในห้อง"
      )}`
    );
  }

  try {
    await prisma.room.delete({ where: { id: roomId } });
  } catch (err) {
    const alreadyGone =
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025";
    if (!alreadyGone) throw err;
  }
  revalidatePath("/rooms");
  redirect("/rooms");
}

export async function importRoomsCsv(formData: FormData) {
  await verifySession();
  const file = formData.get("file");
  const redirectToRaw = String(formData.get("redirectTo") ?? "/rooms");
  const redirectTo = isSafeLocalPath(redirectToRaw) ? redirectToRaw : "/rooms";

  if (!(file instanceof File) || file.size === 0) {
    redirect(`${redirectTo}?error=${encodeURIComponent("กรุณาเลือกไฟล์ CSV")}`);
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.data.length === 0) {
    redirect(`${redirectTo}?error=${encodeURIComponent("ไฟล์ CSV ไม่มีข้อมูล")}`);
  }

  const existingRooms = await prisma.room.findMany();
  const roomIdByNumber = new Map(existingRooms.map((room) => [room.number, room.id]));

  let roomsCreated = 0;
  let cardsCreated = 0;
  let skipped = 0;

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const number = String(row.number ?? "").trim();
    const note = String(row.note ?? "").trim();
    const cardCode = String(row.cardCode ?? "").trim();

    if (!number) {
      skipped += 1;
      continue;
    }

    let roomId = roomIdByNumber.get(number);
    if (!roomId) {
      const room = await prisma.room.create({
        data: { number, note: note || null },
      });
      roomId = room.id;
      roomIdByNumber.set(number, roomId);
      roomsCreated += 1;
    }

    if (cardCode) {
      if (!isValidCardCode(cardCode)) {
        skipped += 1;
        continue;
      }

      const statusRaw = String(row.status ?? "").trim();
      const status = statusRaw
        ? isCardStatus(statusRaw) ? statusRaw : null
        : CardStatus.ACTIVE;
      if (status === null) {
        skipped += 1;
        continue;
      }

      const createdAt = parseOptionalDate(String(row.createdAt ?? ""));
      const statusChangedAtRaw = parseOptionalDate(String(row.statusChangedAt ?? ""));
      const cancelledAtRaw = parseOptionalDate(String(row.cancelledAt ?? ""));
      if (createdAt === null || statusChangedAtRaw === null || cancelledAtRaw === null) {
        skipped += 1;
        continue;
      }

      const statusChangedAt = statusChangedAtRaw ?? createdAt;
      const cancelledAt =
        status === CardStatus.INACTIVE ? cancelledAtRaw ?? statusChangedAt ?? undefined : null;

      await prisma.keycard.create({
        data: { roomId, code: cardCode, status, createdAt, statusChangedAt, cancelledAt },
      });
      cardsCreated += 1;
    }
  }

  revalidatePath("/rooms");
  revalidatePath("/cards");
  revalidatePath("/");

  const params = new URLSearchParams({
    imported: "1",
    rooms: String(roomsCreated),
    cards: String(cardsCreated),
    skipped: String(skipped),
  });
  redirect(`${redirectTo}?${params.toString()}`);
}
