import { CardStatus } from "@/generated/prisma/client";
import { STATUS_LABELS } from "@/lib/validation";

const STYLES: Record<CardStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PROCESS_INACTIVE: "bg-yellow-100 text-yellow-800",
  INACTIVE: "bg-red-100 text-red-800",
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
