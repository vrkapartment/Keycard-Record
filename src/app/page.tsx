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
    { label: "ห้องทั้งหมด", value: roomCount, colorClass: "text-ink" },
    { label: "Active", value: activeCount, colorClass: "text-active-text" },
    {
      label: "Process Inactive",
      value: processInactiveCount,
      colorClass: "text-pending-text",
    },
    {
      label: "Inactive",
      value: inactiveCount,
      colorClass: "text-inactive-text",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">ภาพรวมระบบ</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border-strong bg-paper p-4"
          >
            <div className={`text-2xl font-semibold ${stat.colorClass}`}>
              {stat.value}
            </div>
            <div className="text-xs text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-medium text-muted">
          บัตรที่รอดำเนินการปิดใช้งาน (Process Inactive)
        </h2>
        {processInactiveCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-ink">
            {processInactiveCount} รอ
          </span>
        )}
        <Link
          href="/cards?status=PROCESS_INACTIVE"
          className="ml-auto text-sm text-primary underline underline-offset-2"
        >
          ดูทั้งหมด
        </Link>
      </div>

      {pendingCards.length === 0 ? (
        <p className="text-sm text-muted">ไม่มีบัตรที่รอดำเนินการ</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">รหัสบัตร</th>
                <th className="px-4 py-2 font-medium">ห้อง</th>
                <th className="px-4 py-2 font-medium">สถานะ</th>
                <th className="px-4 py-2 font-medium">รอมาตั้งแต่</th>
              </tr>
            </thead>
            <tbody>
              {pendingCards.map((card) => (
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
                  <td className="px-4 py-2">{card.room.number}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={card.status} />
                  </td>
                  <td className="px-4 py-2 text-muted">
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
