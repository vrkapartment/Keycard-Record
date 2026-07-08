import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardStatus } from "@/generated/prisma/client";
import { EmptyState } from "@/components/EmptyState";

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { number: "asc" },
    include: {
      cards: { select: { status: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">ห้องทั้งหมด</h1>
        <Link
          href="/rooms/new"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-paper hover:bg-primary-hover"
        >
          + เพิ่มห้อง
        </Link>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          message="ยังไม่มีห้องในระบบ"
          action={
            <Link
              href="/rooms/new"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-paper hover:bg-primary-hover"
            >
              + เพิ่มห้องแรก
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">ห้อง</th>
                <th className="px-4 py-2 font-medium">หมายเหตุ</th>
                <th className="px-4 py-2 font-medium">บัตรทั้งหมด</th>
                <th className="px-4 py-2 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const activeCount = room.cards.filter(
                  (c) => c.status === CardStatus.ACTIVE
                ).length;
                return (
                  <tr
                    key={room.id}
                    className="hoverable-row border-t border-border"
                  >
                    <td className="px-4 py-2">
                      <Link
                        href={`/rooms/${room.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {room.number}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-muted">
                      {room.note || "-"}
                    </td>
                    <td className="px-4 py-2">{room.cards.length}</td>
                    <td className="px-4 py-2">{activeCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
