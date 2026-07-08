import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardStatus } from "@/generated/prisma/client";
import { StatusBadge } from "@/components/StatusBadge";

export default async function Home() {
  const [roomCount, activeCount, processInactiveCount, inactiveCount, pendingCards] =
    await Promise.all([
      prisma.room.count(),
      prisma.keycard.count({ where: { status: CardStatus.ACTIVE } }),
      prisma.keycard.count({ where: { status: CardStatus.PROCESS_INACTIVE } }),
      prisma.keycard.count({ where: { status: CardStatus.INACTIVE } }),
      prisma.keycard.findMany({
        where: { status: CardStatus.PROCESS_INACTIVE },
        include: { room: true },
        orderBy: { statusChangedAt: "asc" },
        take: 10,
      }),
    ]);

  const stats = [
    { label: "ห้องทั้งหมด", value: roomCount },
    { label: "Active", value: activeCount },
    { label: "Process Inactive", value: processInactiveCount },
    { label: "Inactive", value: inactiveCount },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">ภาพรวมระบบ</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-zinc-200 bg-white p-4"
          >
            <div className="text-2xl font-semibold">{stat.value}</div>
            <div className="text-xs text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500">
          บัตรที่รอดำเนินการปิดใช้งาน (Process Inactive)
        </h2>
        <Link
          href="/cards?status=PROCESS_INACTIVE"
          className="text-sm text-zinc-600 underline underline-offset-2"
        >
          ดูทั้งหมด
        </Link>
      </div>

      {pendingCards.length === 0 ? (
        <p className="text-sm text-zinc-500">ไม่มีบัตรที่รอดำเนินการ</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">รหัสบัตร</th>
                <th className="px-4 py-2 font-medium">ห้อง</th>
                <th className="px-4 py-2 font-medium">สถานะ</th>
                <th className="px-4 py-2 font-medium">รอมาตั้งแต่</th>
              </tr>
            </thead>
            <tbody>
              {pendingCards.map((card) => (
                <tr key={card.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    <Link
                      href={`/cards/${card.id}`}
                      className="font-mono font-medium hover:underline"
                    >
                      {card.code}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{card.room.number}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={card.status} />
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    {card.statusChangedAt.toLocaleDateString("th-TH")}
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
