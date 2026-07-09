import { importRoomsCsv } from "@/actions/rooms";
import { SubmitButton } from "@/components/SubmitButton";
import { UploadIcon, DownloadIcon } from "@/components/icons";

export function CsvImportPanel({
  redirectTo,
  templateHref = "/templates/rooms-template.csv",
  description = "คอลัมน์: number (หมายเลขห้อง, จำเป็น) · note (หมายเหตุ, ไม่บังคับ) · cardCode (รหัสบัตร 5 หลัก, ไม่บังคับ) — ใส่หลายแถวหมายเลขห้องเดียวกันเพื่อเพิ่มหลายการ์ดในห้องเดียว",
}: {
  redirectTo?: string;
  templateHref?: string;
  description?: string;
}) {
  return (
    <details className="group rounded-lg border border-border bg-paper">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium">
        <UploadIcon className="h-4 w-4 text-muted" />
        นำเข้าห้อง/บัตรจาก CSV
      </summary>
      <div className="space-y-3 border-t border-border px-4 py-4">
        <a
          href={templateHref}
          download
          className="inline-flex items-center gap-1.5 text-sm text-primary underline underline-offset-2"
        >
          <DownloadIcon className="h-4 w-4" />
          ดาวน์โหลด Template CSV
        </a>
        <p className="text-xs text-muted">{description}</p>
        <form
          action={importRoomsCsv}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            aria-label="ไฟล์ CSV"
            className="flex-1 rounded-md border border-border-strong bg-paper px-3 py-2 text-sm"
          />
          <SubmitButton pendingText="กำลังนำเข้า…" size="sm">
            นำเข้า
          </SubmitButton>
        </form>
      </div>
    </details>
  );
}
