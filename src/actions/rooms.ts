"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { isValidCardCode } from "@/lib/validation";

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
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/rooms?error=${encodeURIComponent("กรุณาเลือกไฟล์ CSV")}`);
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.data.length === 0) {
    redirect(`/rooms?error=${encodeURIComponent("ไฟล์ CSV ไม่มีข้อมูล")}`);
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
      await prisma.keycard.create({ data: { roomId, code: cardCode } });
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
  redirect(`/rooms?${params.toString()}`);
}
