import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardStatus } from "@/generated/prisma/client";
import { STATUS_LABELS, STATUS_ORDER, isCardStatus } from "@/lib/validation";
import { EmptyState } from "@/components/EmptyState";
import { CardListItem } from "@/components/CardListItem";

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ roomId?: string; status?: string; q?: string }>;
}) {
  const { roomId, status, q } = await searchParams;

  const where: {
    roomId?: number;
    status?: CardStatus;
    code?: { contains: string };
  } = {};

  if (roomId) where.roomId = Number(roomId);
  if (status && isCardStatus(status)) where.status = status;
  if (q) where.code = { contains: q.trim() };

  const [cards, rooms] = await Promise.all([
    prisma.keycard.findMany({
      where,
      include: { room: true },
      orderBy: { statusChangedAt: "desc" },
    }),
    prisma.room.findMany({ orderBy: { number: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">บัตรคีย์การ์ดทั้งหมด</h1>
        <Link
          href="/cards/new"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-paper hover:bg-primary-hover"
        >
          + เพิ่มบัตร
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-col gap-3 rounded-lg border border-border bg-paper p-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            className="mb-1 block text-xs font-medium text-muted"
            htmlFor="filter-roomId"
          >
            ห้อง
          </label>
          <select
            id="filter-roomId"
            name="roomId"
            defaultValue={roomId ?? ""}
            className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
          >
            <option value="">ทั้งหมด</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.number}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label
            className="mb-1 block text-xs font-medium text-muted"
            htmlFor="filter-status"
          >
            สถานะ
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
          >
            <option value="">ทั้งหมด</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label
            className="mb-1 block text-xs font-medium text-muted"
            htmlFor="filter-q"
          >
            ค้นหารหัสบัตร
          </label>
          <input
            id="filter-q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="เช่น 00042"
            className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md border border-border-strong px-3 py-2 text-sm font-medium hover:bg-surface-sunken sm:flex-none"
          >
            ค้นหา
          </button>
          {(roomId || status || q) && (
            <Link
              href="/cards"
              className="flex items-center text-sm text-muted underline underline-offset-2"
            >
              ล้างตัวกรอง
            </Link>
          )}
        </div>
      </form>

      {cards.length === 0 ? (
        <EmptyState message="ไม่พบบัตรที่ตรงกับเงื่อนไข" />
      ) : (
        <div className="space-y-2">
          {cards.map((card) => (
            <CardListItem
              key={card.id}
              id={card.id}
              code={card.code}
              status={card.status}
              roomNumber={card.room.number}
              dateLabel="เปลี่ยนสถานะล่าสุด"
              date={card.statusChangedAt.toLocaleString("th-TH")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
