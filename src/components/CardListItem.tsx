import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { CardStatus } from "@/generated/prisma/client";

export function CardListItem({
  id,
  code,
  status,
  roomNumber,
  dateLabel,
  date,
}: {
  id: number;
  code: string;
  status: CardStatus;
  roomNumber?: string;
  dateLabel: string;
  date: string;
}) {
  return (
    <Link
      href={`/cards/${id}`}
      className="hoverable-row flex items-center justify-between gap-3 rounded-lg border border-border bg-paper p-4 transition-transform active:scale-[0.98]"
    >
      <div className="min-w-0">
        <div className="font-mono text-base font-semibold text-primary">{code}</div>
        <div className="mt-0.5 truncate text-xs text-muted">
          {roomNumber && <>ห้อง {roomNumber} · </>}
          {dateLabel} {date}
        </div>
      </div>
      <StatusBadge status={status} />
    </Link>
  );
}
