import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteRoom } from "@/actions/rooms";
import { ErrorBanner } from "@/components/ErrorBanner";
import { StatusBadge } from "@/components/StatusBadge";

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { roomId: roomIdParam } = await params;
  const { error } = await searchParams;
  const roomId = Number(roomIdParam);

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { cards: { orderBy: { createdAt: "desc" } } },
  });

  if (!room) notFound();

  const deleteRoomWithId = deleteRoom.bind(null, room.id);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">ห้อง {room.number}</h1>
          {room.note && (
            <p className="mt-1 text-sm text-zinc-500">{room.note}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/rooms/${room.id}/edit`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100"
          >
            แก้ไขห้อง
          </Link>
          <form action={deleteRoomWithId}>
            <button
              type="submit"
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              ลบห้อง
            </button>
          </form>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500">
          บัตรคีย์การ์ดในห้องนี้ ({room.cards.length})
        </h2>
        <Link
          href={`/cards/new?roomId=${room.id}`}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + เพิ่มบัตร
        </Link>
      </div>

      {room.cards.length === 0 ? (
        <p className="text-sm text-zinc-500">ยังไม่มีบัตรในห้องนี้</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">รหัสบัตร</th>
                <th className="px-4 py-2 font-medium">สถานะ</th>
                <th className="px-4 py-2 font-medium">สร้างเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {room.cards.map((card) => (
                <tr key={card.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    <Link
                      href={`/cards/${card.id}`}
                      className="font-mono font-medium text-zinc-900 hover:underline"
                    >
                      {card.code}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={card.status} />
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    {card.createdAt.toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
