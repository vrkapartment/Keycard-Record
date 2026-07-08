import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { changeCardStatus, deleteCard } from "@/actions/cards";
import { ErrorBanner } from "@/components/ErrorBanner";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/validation";

export default async function CardDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ cardId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { cardId: cardIdParam } = await params;
  const { error } = await searchParams;
  const cardId = Number(cardIdParam);

  const card = await prisma.keycard.findUnique({
    where: { id: cardId },
    include: { room: true },
  });

  if (!card) notFound();

  const changeStatusForCard = changeCardStatus.bind(null, card.id);
  const deleteCardWithId = deleteCard.bind(null, card.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-mono text-xl font-semibold">{card.code}</h1>
          <p className="mt-1 text-sm text-muted">
            ห้อง{" "}
            <Link
              href={`/rooms/${card.roomId}`}
              className="text-primary hover:underline"
            >
              {card.room.number}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/cards/${card.id}/edit`}
            className="rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium hover:bg-surface-sunken"
          >
            แก้ไขบัตร
          </Link>
          <form action={deleteCardWithId}>
            <SubmitButton
              variant="destructive"
              size="sm"
              pendingText="กำลังลบ…"
            >
              ลบบัตร
            </SubmitButton>
          </form>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="mb-6 grid grid-cols-2 gap-4 rounded-md border border-border bg-paper p-4 text-sm sm:grid-cols-3">
        <div>
          <div className="text-xs text-muted">สถานะปัจจุบัน</div>
          <div className="mt-1">
            <StatusBadge status={card.status} />
          </div>
        </div>
        <div>
          <div className="text-xs text-muted">สร้างเมื่อ</div>
          <div className="mt-1">
            {card.createdAt.toLocaleDateString("th-TH")}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted">เปลี่ยนสถานะล่าสุด</div>
          <div className="mt-1">
            {card.statusChangedAt.toLocaleString("th-TH")}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted">วันที่ยกเลิก</div>
          <div className="mt-1">
            {card.cancelledAt
              ? card.cancelledAt.toLocaleDateString("th-TH")
              : "-"}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-paper p-4">
        <h2 className="mb-3 text-sm font-medium text-muted">
          เปลี่ยนสถานะ
        </h2>
        <form action={changeStatusForCard} className="flex items-end gap-3">
          <select
            name="status"
            aria-label="สถานะ"
            defaultValue={card.status}
            className="rounded-md border border-border-strong px-3 py-2 text-sm"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <SubmitButton pendingText="กำลังอัปเดต…">
            อัปเดตสถานะ
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
