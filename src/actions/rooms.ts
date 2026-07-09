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
  const number = String(formData.get("number") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  const [, existing] = await Promise.all([
    verifySession(),
    number ? prisma.room.findUnique({ where: { number } }) : null,
  ]);

  if (!number) {
    redirect(`/rooms/new?error=${encodeURIComponent("กรุณาระบุหมายเลขห้อง")}`);
  }
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

  const [, existing] = await Promise.all([
    verifySession(),
    number ? prisma.room.findUnique({ where: { number } }) : null,
  ]);

  if (!number) {
    redirect(
      `/rooms/${roomId}/edit?error=${encodeURIComponent("กรุณาระบุหมายเลขห้อง")}`
    );
  }
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
  const [, cardCount] = await Promise.all([
    verifySession(),
    prisma.keycard.count({ where: { roomId } }),
  ]);
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

  const existingRooms = await prisma.room.findMany({ select: { id: true, number: true } });
  const roomIdByNumber = new Map(existingRooms.map((room) => [room.number, room.id]));
  const newRoomNotes = new Map<string, string | null>();

  type PendingCard = {
    number: string;
    code: string;
    status: CardStatus;
    createdAt: Date;
    statusChangedAt: Date;
    cancelledAt: Date | null;
  };
  const pendingCards: PendingCard[] = [];
  let skipped = 0;

  for (const row of parsed.data) {
    const number = String(row.number ?? "").trim();
    const note = String(row.note ?? "").trim();
    const cardCode = String(row.cardCode ?? "").trim();

    if (!number) {
      skipped += 1;
      continue;
    }

    if (!roomIdByNumber.has(number) && !newRoomNotes.has(number)) {
      newRoomNotes.set(number, note || null);
    }

    if (!cardCode) continue;

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

    const resolvedCreatedAt = createdAt ?? new Date();
    const statusChangedAt = statusChangedAtRaw ?? resolvedCreatedAt;
    const cancelledAt =
      status === CardStatus.INACTIVE ? cancelledAtRaw ?? statusChangedAt : null;

    pendingCards.push({
      number,
      code: cardCode,
      status,
      createdAt: resolvedCreatedAt,
      statusChangedAt,
      cancelledAt,
    });
  }

  if (newRoomNotes.size > 0) {
    await prisma.room.createMany({
      data: Array.from(newRoomNotes, ([number, note]) => ({ number, note })),
      skipDuplicates: true,
    });
    const createdRooms = await prisma.room.findMany({
      where: { number: { in: Array.from(newRoomNotes.keys()) } },
      select: { id: true, number: true },
    });
    for (const room of createdRooms) roomIdByNumber.set(room.number, room.id);
  }

  const cardsData = pendingCards.map((card) => ({
    roomId: roomIdByNumber.get(card.number)!,
    code: card.code,
    status: card.status,
    createdAt: card.createdAt,
    statusChangedAt: card.statusChangedAt,
    cancelledAt: card.cancelledAt,
  }));

  if (cardsData.length > 0) {
    await prisma.keycard.createMany({ data: cardsData });
  }

  const roomsCreated = newRoomNotes.size;
  const cardsCreated = cardsData.length;

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
