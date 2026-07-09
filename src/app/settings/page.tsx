import { changePin, logout } from "@/actions/auth";
import { verifySession } from "@/lib/session";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SuccessBanner } from "@/components/SuccessBanner";
import { SubmitButton } from "@/components/SubmitButton";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await verifySession();
  const { error, success } = await searchParams;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">ตั้งค่า</h1>

      <ErrorBanner message={error} />
      <SuccessBanner message={success === "1" ? "เปลี่ยนรหัส PIN เรียบร้อยแล้ว" : undefined} />

      <div className="rounded-lg border border-border bg-paper p-4">
        <h2 className="mb-3 text-sm font-semibold">เปลี่ยนรหัส PIN</h2>
        <form action={changePin} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted" htmlFor="currentPin">
              รหัส PIN ปัจจุบัน
            </label>
            <input
              id="currentPin"
              name="currentPin"
              required
              pattern="\d{6}"
              maxLength={6}
              inputMode="numeric"
              autoComplete="off"
              className="w-full rounded-md border border-border-strong px-3 py-2.5 text-sm font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted" htmlFor="newPin">
              รหัส PIN ใหม่ (6 หลัก)
            </label>
            <input
              id="newPin"
              name="newPin"
              required
              pattern="\d{6}"
              maxLength={6}
              inputMode="numeric"
              autoComplete="off"
              className="w-full rounded-md border border-border-strong px-3 py-2.5 text-sm font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted" htmlFor="confirmPin">
              ยืนยันรหัส PIN ใหม่
            </label>
            <input
              id="confirmPin"
              name="confirmPin"
              required
              pattern="\d{6}"
              maxLength={6}
              inputMode="numeric"
              autoComplete="off"
              className="w-full rounded-md border border-border-strong px-3 py-2.5 text-sm font-mono"
            />
          </div>
          <p className="text-xs text-muted">
            เปลี่ยนรหัส PIN แล้ว ทุกคนที่ล็อกอินอยู่เครื่องอื่นจะต้องล็อกอินใหม่ (ยกเว้นเครื่องนี้)
          </p>
          <SubmitButton pendingText="กำลังบันทึก…">บันทึกรหัสใหม่</SubmitButton>
        </form>
      </div>

      <form action={logout}>
        <SubmitButton variant="destructive" pendingText="กำลังออกจากระบบ…">
          ออกจากระบบ
        </SubmitButton>
      </form>
    </div>
  );
}
