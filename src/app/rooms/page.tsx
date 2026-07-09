import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardStatus, Prisma } from "@/generated/prisma/client";
import { importRoomsCsv } from "@/actions/rooms";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SuccessBanner } from "@/components/SuccessBanner";
import { SubmitButton } from "@/components/SubmitButton";
import { RoomSearchInput } from "@/components/RoomSearchInput";
import { UploadIcon, DownloadIcon } from "@/components/icons";

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

  const rooms = await prisma.room.findMany({
    where,
    orderBy: { number: "asc" },
    include: { cards: { select: { status: true } } },
  });

  const importMessage =
    imported === "1"
      ? `นำเข้าเสร็จแล้ว: เพิ่มห้อง ${roomsCreated ?? 0} ห้อง, เพิ่มบัตร ${
          cardsCreated ?? 0
        } ใบ` + (Number(skipped) > 0 ? ` (ข้าม ${skipped} แถวที่ไม่ถูกต้อง)` : "")
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ห้องทั้งหมด</h1>
        <Link
          href="/rooms/new"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-paper hover:bg-primary-hover"
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
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-paper hover:bg-primary-hover"
              >
                + เพิ่มห้องแรก
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => {
            const activeCount = room.cards.filter(
              (c) => c.status === CardStatus.ACTIVE
            ).length;
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
                    {room.cards.length} การ์ด
                  </div>
                  <div className="text-active-text">{activeCount} Active</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <details className="group rounded-lg border border-border bg-paper">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium">
          <UploadIcon className="h-4 w-4 text-muted" />
          นำเข้าห้อง/บัตรจาก CSV
        </summary>
        <div className="space-y-3 border-t border-border px-4 py-4">
          <a
            href="/templates/rooms-template.csv"
            download
            className="inline-flex items-center gap-1.5 text-sm text-primary underline underline-offset-2"
          >
            <DownloadIcon className="h-4 w-4" />
            ดาวน์โหลด Template CSV
          </a>
          <p className="text-xs text-muted">
            คอลัมน์: number (หมายเลขห้อง, จำเป็น) · note (หมายเหตุ, ไม่บังคับ) ·
            cardCode (รหัสบัตร 5 หลัก, ไม่บังคับ) — ใส่หลายแถวหมายเลขห้องเดียวกันเพื่อเพิ่มหลายการ์ดในห้องเดียว
          </p>
          <form
            action={importRoomsCsv}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              aria-label="ไฟล์ CSV"
              className="flex-1 rounded-md border border-border-strong bg-paper px-3 py-2 text-sm"
            />
            <SubmitButton pendingText="กำลังนำเข้า…" size="sm">
              นำเข้า
            </SubmitButton>
          </form>
        </div>
      </details>
    </div>
  );
}
