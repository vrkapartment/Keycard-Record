import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteRoom } from "@/actions/rooms";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SubmitButton } from "@/components/SubmitButton";
import { EmptyState } from "@/components/EmptyState";
import { CardListItem } from "@/components/CardListItem";

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
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">ห้อง {room.number}</h1>
          {room.note && (
            <p className="mt-1 text-sm text-muted">{room.note}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/rooms/${room.id}/edit`}
            className="rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium hover:bg-surface-sunken"
          >
            แก้ไข
          </Link>
          <form action={deleteRoomWithId}>
            <SubmitButton
              variant="destructive"
              size="sm"
              pendingText="กำลังลบ…"
            >
              ลบห้อง
            </SubmitButton>
          </form>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">
          บัตรคีย์การ์ดในห้องนี้ ({room.cards.length})
        </h2>
        <Link
          href={`/cards/new?roomId=${room.id}`}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-ink hover:bg-primary-hover"
        >
          + เพิ่มบัตร
        </Link>
      </div>

      {room.cards.length === 0 ? (
        <EmptyState
          message="ยังไม่มีบัตรในห้องนี้"
          action={
            <Link
              href={`/cards/new?roomId=${room.id}`}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-ink hover:bg-primary-hover"
            >
              + เพิ่มบัตรแรก
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {room.cards.map((card) => (
            <CardListItem
              key={card.id}
              id={card.id}
              code={card.code}
              status={card.status}
              dateLabel="สร้างเมื่อ"
              date={card.createdAt.toLocaleDateString("th-TH")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
