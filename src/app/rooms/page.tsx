import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardStatus, Prisma } from "@/generated/prisma/client";
import { formatImportSummary } from "@/lib/validation";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SuccessBanner } from "@/components/SuccessBanner";
import { RoomSearchInput } from "@/components/RoomSearchInput";
import { CsvImportPanel } from "@/components/CsvImportPanel";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    error?: string;
    imported?: string;
    rooms?: string;
    cards?: string;
    skipped?: string;
  }>;
}) {
  const { q, error, imported, rooms: roomsCreated, cards: cardsCreated, skipped } =
    await searchParams;

  const where: Prisma.RoomWhereInput = q
    ? {
        OR: [
          { number: { contains: q.trim(), mode: "insensitive" } },
          { note: { contains: q.trim(), mode: "insensitive" } },
        ],
      }
    : {};

  const [rooms, cardCounts] = await Promise.all([
    prisma.room.findMany({ where, orderBy: { number: "asc" } }),
    prisma.keycard.groupBy({ by: ["roomId", "status"], _count: { _all: true } }),
  ]);

  const countsByRoom = new Map<number, { total: number; active: number }>();
  for (const group of cardCounts) {
    const entry = countsByRoom.get(group.roomId) ?? { total: 0, active: 0 };
    entry.total += group._count._all;
    if (group.status === CardStatus.ACTIVE) entry.active += group._count._all;
    countsByRoom.set(group.roomId, entry);
  }

  const importMessage =
    imported === "1"
      ? formatImportSummary({
          roomsCreated: Number(roomsCreated ?? 0),
          cardsCreated: Number(cardsCreated ?? 0),
          skipped: Number(skipped ?? 0),
        })
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ห้องทั้งหมด</h1>
        <Link
          href="/rooms/new"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-ink hover:bg-primary-hover"
        >
          + เพิ่มห้อง
        </Link>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={importMessage} />

      <Suspense fallback={<div className="h-[42px]" />}>
        <RoomSearchInput />
      </Suspense>

      {rooms.length === 0 ? (
        <EmptyState
          message={q ? "ไม่พบห้องที่ตรงกับคำค้นหา" : "ยังไม่มีห้องในระบบ"}
          action={
            !q ? (
              <Link
                href="/rooms/new"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-ink hover:bg-primary-hover"
              >
                + เพิ่มห้องแรก
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => {
            const counts = countsByRoom.get(room.id) ?? { total: 0, active: 0 };
            return (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="hoverable-row flex items-center justify-between gap-3 rounded-lg border border-border bg-paper p-4 transition-transform active:scale-[0.98]"
              >
                <div className="min-w-0">
                  <div className="text-base font-semibold">ห้อง {room.number}</div>
                  {room.note && (
                    <div className="mt-0.5 truncate text-xs text-muted">
                      {room.note}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right text-xs text-muted">
                  <div className="text-sm font-medium text-ink">
                    {counts.total} การ์ด
                  </div>
                  <div className="text-active-text">{counts.active} Active</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CsvImportPanel />
    </div>
  );
}
