import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardStatus } from "@/generated/prisma/client";
import { STATUS_LABELS, STATUS_ORDER, isCardStatus } from "@/lib/validation";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

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
    <div>
      <div className="mb-6 flex items-center justify-between">
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
        className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-border bg-paper p-3"
      >
        <div>
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
            className="rounded-md border border-border-strong px-2 py-1.5 text-sm"
          >
            <option value="">ทั้งหมด</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.number}
              </option>
            ))}
          </select>
        </div>
        <div>
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
            className="rounded-md border border-border-strong px-2 py-1.5 text-sm"
          >
            <option value="">ทั้งหมด</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
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
            className="rounded-md border border-border-strong px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium hover:bg-surface-sunken"
        >
          ค้นหา
        </button>
        {(roomId || status || q) && (
          <Link
            href="/cards"
            className="text-sm text-muted underline underline-offset-2"
          >
            ล้างตัวกรอง
          </Link>
        )}
      </form>

      {cards.length === 0 ? (
        <EmptyState message="ไม่พบบัตรที่ตรงกับเงื่อนไข" />
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">รหัสบัตร</th>
                <th className="px-4 py-2 font-medium">ห้อง</th>
                <th className="px-4 py-2 font-medium">สถานะ</th>
                <th className="px-4 py-2 font-medium">เปลี่ยนสถานะล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr
                  key={card.id}
                  className="hoverable-row border-t border-border"
                >
                  <td className="px-4 py-2">
                    <Link
                      href={`/cards/${card.id}`}
                      className="font-mono font-medium text-primary hover:underline"
                    >
                      {card.code}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/rooms/${card.roomId}`}
                      className="hover:underline"
                    >
                      {card.room.number}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={card.status} />
                  </td>
                  <td className="px-4 py-2 text-muted">
                    {card.statusChangedAt.toLocaleString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
