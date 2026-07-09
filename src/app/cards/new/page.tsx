import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddCardForm } from "@/components/AddCardForm";
import { ErrorBanner } from "@/components/ErrorBanner";
import { EmptyState } from "@/components/EmptyState";

export default async function NewCardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; roomId?: string }>;
}) {
  const { error, roomId } = await searchParams;
  const rooms = await prisma.room.findMany({ orderBy: { number: "asc" } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">เพิ่มบัตรคีย์การ์ด</h1>
      <ErrorBanner message={error} />
      {rooms.length === 0 ? (
        <EmptyState
          message="ยังไม่มีห้องในระบบ กรุณาเพิ่มห้องก่อน"
          action={
            <Link
              href="/rooms/new"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-ink hover:bg-primary-hover"
            >
              + เพิ่มห้อง
            </Link>
          }
        />
      ) : (
        <AddCardForm rooms={rooms} defaultRoomId={roomId} />
      )}
    </div>
  );
}
