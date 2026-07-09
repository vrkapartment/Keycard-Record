import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { updateMasterKey } from "@/actions/auth";
import { MANUAL_SECTIONS, fillManualStep } from "@/lib/manual";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SuccessBanner } from "@/components/SuccessBanner";
import { SubmitButton } from "@/components/SubmitButton";

export default async function ManualPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await verifySession();
  const { error, success } = await searchParams;

  const config = await prisma.appConfig.findFirst();
  const masterKey = config?.masterKey ?? "";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">คู่มือการใช้งาน</h1>

      <ErrorBanner message={error} />
      <SuccessBanner message={success === "1" ? "บันทึก Master Key เรียบร้อยแล้ว" : undefined} />

      <div className="rounded-lg border border-border bg-paper p-4">
        <h2 className="mb-3 text-sm font-semibold">Master Key</h2>
        <form action={updateMasterKey} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted" htmlFor="masterKey">
              รหัส Master Key ของระบบประตู
            </label>
            <input
              id="masterKey"
              name="masterKey"
              required
              defaultValue={masterKey}
              inputMode="numeric"
              autoComplete="off"
              placeholder="เช่น 123456"
              className="w-full rounded-md border border-border-strong px-3 py-2.5 text-sm font-mono"
            />
          </div>
          <SubmitButton pendingText="กำลังบันทึก…">บันทึก</SubmitButton>
        </form>
        <p className="mt-2 text-xs text-muted">
          ค่านี้จะถูกแทนที่ลงในขั้นตอนด้านล่างทุกจุดที่มีคำว่า [Master Key]
        </p>
      </div>

      <div className="space-y-3">
        {MANUAL_SECTIONS.map((section) => (
          <div key={section.id} className="rounded-lg border border-border bg-paper p-4">
            <h2 className="mb-2 text-sm font-semibold">{section.title}</h2>
            <ol className="space-y-1.5">
              {section.steps.map((step, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-muted">{index + 1}.</span>
                  <span className="font-mono">{fillManualStep(step, { masterKey })}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
