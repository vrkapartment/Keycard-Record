import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardStatus } from "@/generated/prisma/client";
import { changeCardStatus, deleteCard } from "@/actions/cards";
import { ErrorBanner } from "@/components/ErrorBanner";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/validation";
import { MANUAL_SECTIONS, fillManualStep } from "@/lib/manual";

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

  const showDeleteInstructions = card.status === CardStatus.PROCESS_INACTIVE;
  const config = showDeleteInstructions ? await prisma.appConfig.findFirst() : null;
  const deleteCardSection = MANUAL_SECTIONS.find((s) => s.id === "delete-card");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
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
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/cards/${card.id}/edit`}
            className="rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium hover:bg-surface-sunken"
          >
            แก้ไข
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

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-paper p-4 text-sm">
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

      <div className="rounded-lg border border-border bg-paper p-4">
        <h2 className="mb-3 text-sm font-medium text-muted">
          เปลี่ยนสถานะ
        </h2>
        <form action={changeStatusForCard} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <select
            name="status"
            aria-label="สถานะ"
            defaultValue={card.status}
            className="rounded-md border border-border-strong px-3 py-2.5 text-sm sm:flex-1"
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

      {showDeleteInstructions && deleteCardSection && (
        <div className="rounded-lg border border-pending-text/30 bg-pending-bg p-4">
          <h2 className="mb-2 text-sm font-semibold text-pending-text">
            {deleteCardSection.title} (บัตรใบนี้)
          </h2>
          {!config?.masterKey && (
            <p className="mb-2 text-xs text-pending-text">
              ยังไม่ตั้งค่า Master Key —{" "}
              <Link href="/manual" className="underline underline-offset-2">
                ไปตั้งค่าที่หน้าคู่มือการใช้งาน
              </Link>
            </p>
          )}
          <ol className="space-y-1.5">
            {deleteCardSection.steps.map((step, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="text-pending-text">{index + 1}.</span>
                <span className="font-mono">
                  {fillManualStep(step, { masterKey: config?.masterKey, cardCode: card.code })}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
