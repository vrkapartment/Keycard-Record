import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCard } from "@/actions/cards";
import { ErrorBanner } from "@/components/ErrorBanner";

export default async function EditCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ cardId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { cardId: cardIdParam } = await params;
  const { error } = await searchParams;
  const cardId = Number(cardIdParam);

  const [card, rooms] = await Promise.all([
    prisma.keycard.findUnique({ where: { id: cardId } }),
    prisma.room.findMany({ orderBy: { number: "asc" } }),
  ]);

  if (!card) notFound();

  const updateCardWithId = updateCard.bind(null, card.id);

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-xl font-semibold">แก้ไขบัตร {card.code}</h1>
      <ErrorBanner message={error} />
      <form action={updateCardWithId} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="roomId">
            ห้อง
          </label>
          <select
            id="roomId"
            name="roomId"
            required
            defaultValue={card.roomId}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
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
            defaultValue={card.code}
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
    </div>
  );
}
