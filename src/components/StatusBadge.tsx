import { CardStatus } from "@/generated/prisma/client";
import { STATUS_LABELS } from "@/lib/validation";

const STYLES: Record<CardStatus, string> = {
  ACTIVE: "bg-active-bg text-active-text",
  PROCESS_INACTIVE: "bg-pending-bg text-pending-text",
  INACTIVE: "bg-inactive-bg text-inactive-text",
};

export function StatusBadge({ status }: { status: CardStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
