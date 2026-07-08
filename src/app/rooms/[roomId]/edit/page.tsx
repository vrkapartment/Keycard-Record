import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateRoom } from "@/actions/rooms";
import { ErrorBanner } from "@/components/ErrorBanner";

export default async function EditRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { roomId: roomIdParam } = await params;
  const { error } = await searchParams;
  const roomId = Number(roomIdParam);

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) notFound();

  const updateRoomWithId = updateRoom.bind(null, room.id);

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-xl font-semibold">แก้ไขห้อง {room.number}</h1>
      <ErrorBanner message={error} />
      <form action={updateRoomWithId} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="number">
            หมายเลขห้อง
          </label>
          <input
            id="number"
            name="number"
            required
            defaultValue={room.number}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="note">
            หมายเหตุ (ไม่บังคับ)
          </label>
          <input
            id="note"
            name="note"
            defaultValue={room.note ?? ""}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          บันทึก
        </button>
      </form>
    </div>
  );
}
