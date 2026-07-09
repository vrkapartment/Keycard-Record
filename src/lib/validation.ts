import { CardStatus } from "@/generated/prisma/client";

export const CARD_CODE_REGEX = /^\d{5}$/;

export function isValidCardCode(code: string): boolean {
  return CARD_CODE_REGEX.test(code.trim());
}

export const STATUS_LABELS: Record<CardStatus, string> = {
  ACTIVE: "Active",
  PROCESS_INACTIVE: "Process Inactive",
  INACTIVE: "Inactive",
};

export const STATUS_ORDER: CardStatus[] = [
  CardStatus.ACTIVE,
  CardStatus.PROCESS_INACTIVE,
  CardStatus.INACTIVE,
];

export function isCardStatus(value: string): value is CardStatus {
  return (STATUS_ORDER as string[]).includes(value);
}

// Guards against open redirects when a path comes from user-controlled
// input (a query param or hidden form field), e.g. "//evil.com" starts
// with "/" but browsers treat it as protocol-relative.
export function isSafeLocalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

export function formatImportSummary({
  roomsCreated,
  cardsCreated,
  skipped,
}: {
  roomsCreated: number;
  cardsCreated: number;
  skipped: number;
}): string {
  const base = `นำเข้าเสร็จแล้ว: เพิ่มห้อง ${roomsCreated} ห้อง, เพิ่มบัตร ${cardsCreated} ใบ`;
  return skipped > 0 ? `${base} (ข้าม ${skipped} แถวที่ไม่ถูกต้อง)` : base;
}
