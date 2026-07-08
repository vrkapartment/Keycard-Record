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
