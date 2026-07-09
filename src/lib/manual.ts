export type ManualSection = {
  id: string;
  title: string;
  steps: string[];
};

// Steps use {masterKey} / {cardCode} tokens, filled in by fillManualStep.
export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: "add-card",
    title: "วิธีเพิ่มบัตร",
    steps: ["กด *{masterKey}#", "กด 22*1# ทาบบัตรทีละใบจนครบ", "กด *#"],
  },
  {
    id: "delete-card",
    title: "วิธีลบบัตร",
    steps: ["กด *{masterKey}#", "กด 10*{cardCode}*{cardCode}#", "กด *#"],
  },
  {
    id: "set-pin",
    title: "วิธีตั้งรหัส",
    steps: ["กด *{masterKey}#", "กด 15* ใส่รหัส 4 ตัว #", "กด *#"],
  },
  {
    id: "delete-pin",
    title: "วิธีลบรหัส",
    steps: ["กด *{masterKey}#", "กด 15* กด 0000 #", "กด *#"],
  },
  {
    id: "set-master-key",
    title: "วิธีตั้ง Master Key",
    steps: ["กด *{masterKey}#", "กด 09* ใส่รหัสใหม่ 6 ตัว 2 รอบ #", "กด *#"],
  },
];

export function fillManualStep(
  step: string,
  values: { masterKey?: string | null; cardCode?: string }
): string {
  return step
    .replace(/\{masterKey\}/g, values.masterKey?.trim() || "[Master Key]")
    .replace(/\{cardCode\}/g, values.cardCode || "[รหัสบัตร]");
}
