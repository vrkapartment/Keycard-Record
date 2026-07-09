import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardStatus } from "@/generated/prisma/client";
import { AddCardForm } from "@/components/AddCardForm";
import { CardListItem } from "@/components/CardListItem";
import { EmptyState } from "@/components/EmptyState";

export default async function Home() {
  const [rooms, roomCount, activeCount, processInactiveCount, inactiveCount, pendingCards] =
    await Promise.all([
      prisma.room.findMany({ select: { id: true, number: true }, orderBy: { number: "asc" } }),
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
    <div className="space-y-8">
      <div>
        {rooms.length === 0 ? (
          <EmptyState
            message="ยังไม่มีห้องในระบบ กรุณาเพิ่มห้องก่อนจึงจะเพิ่มบัตรได้"
            action={
              <Link
                href="/rooms/new"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-ink hover:bg-primary-hover"
              >
                + เพิ่มห้อง
              </Link>
            }
          />
        ) : (
          <AddCardForm rooms={rooms} title="เพิ่มบัตรคีย์การ์ด" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border-strong bg-paper p-4"
          >
            <div className={`text-2xl font-semibold ${stat.colorClass}`}>
              {stat.value}
            </div>
            <div className="text-xs text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-medium text-muted">
            รอดำเนินการปิดใช้งาน
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
          <div className="space-y-2">
            {pendingCards.map((card) => (
              <CardListItem
                key={card.id}
                id={card.id}
                code={card.code}
                status={card.status}
                roomNumber={card.room.number}
                dateLabel="รอมาตั้งแต่"
                date={card.statusChangedAt.toLocaleDateString("th-TH")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
