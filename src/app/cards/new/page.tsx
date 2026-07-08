import { prisma } from "@/lib/prisma";
import { createCard } from "@/actions/cards";
import { ErrorBanner } from "@/components/ErrorBanner";

export default async function NewCardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; roomId?: string }>;
}) {
  const { error, roomId } = await searchParams;
  const rooms = await prisma.room.findMany({ orderBy: { number: "asc" } });

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-xl font-semibold">เพิ่มบัตรคีย์การ์ด</h1>
      <ErrorBanner message={error} />
      {rooms.length === 0 ? (
        <p className="text-sm text-zinc-500">
          ยังไม่มีห้องในระบบ กรุณาเพิ่มห้องก่อน
        </p>
      ) : (
        <form action={createCard} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="roomId">
              ห้อง
            </label>
            <select
              id="roomId"
              name="roomId"
              required
              defaultValue={roomId ?? ""}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="" disabled>
                เลือกห้อง
              </option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="code">
              รหัสบัตร (5 หลัก)
            </label>
            <input
              id="code"
              name="code"
              required
              pattern="\d{5}"
              maxLength={5}
              inputMode="numeric"
              placeholder="เช่น 00042"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            บันทึก
          </button>
        </form>
      )}
    </div>
  );
}
