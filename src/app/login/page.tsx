import { login } from "@/actions/auth";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SubmitButton } from "@/components/SubmitButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-muted">กรอกรหัส PIN 6 หลักของทีม</p>
        </div>

        <ErrorBanner message={error} />

        <form action={login} className="space-y-4">
          <input type="hidden" name="next" value={next ?? "/"} />
          <input
            id="pin"
            name="pin"
            required
            autoFocus
            pattern="\d{6}"
            maxLength={6}
            inputMode="numeric"
            autoComplete="off"
            placeholder="••••••"
            aria-label="รหัส PIN 6 หลัก"
            className="w-full rounded-md border border-border-strong px-3 py-3 text-center font-mono text-2xl tracking-[0.3em]"
          />
          <SubmitButton pendingText="กำลังเข้าสู่ระบบ…">เข้าสู่ระบบ</SubmitButton>
        </form>
      </div>
    </div>
  );
}
