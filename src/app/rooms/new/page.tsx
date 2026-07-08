import { createRoom } from "@/actions/rooms";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SubmitButton } from "@/components/SubmitButton";

export default async function NewRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-xl font-semibold">เพิ่มห้อง</h1>
      <ErrorBanner message={error} />
      <form action={createRoom} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="number">
            หมายเลขห้อง
          </label>
          <input
            id="number"
            name="number"
            required
            className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
            placeholder="เช่น 204"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="note">
            หมายเหตุ (ไม่บังคับ)
          </label>
          <input
            id="note"
            name="note"
            className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
            placeholder="เช่น ตึก A ชั้น 2"
          />
        </div>
        <SubmitButton pendingText="กำลังบันทึก…">บันทึก</SubmitButton>
      </form>
    </div>
  );
}
