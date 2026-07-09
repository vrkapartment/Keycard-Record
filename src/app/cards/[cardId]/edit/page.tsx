import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCard } from "@/actions/cards";
import { CardCodeField } from "@/components/CardCodeField";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SubmitButton } from "@/components/SubmitButton";

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
    <div>
      <h1 className="mb-4 text-xl font-semibold">แก้ไขบัตร {card.code}</h1>
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
            className="w-full rounded-md border border-border-strong px-3 py-2.5 text-sm"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.number}
              </option>
            ))}
          </select>
        </div>
        <CardCodeField defaultValue={card.code} />
        <SubmitButton pendingText="กำลังบันทึก…">บันทึก</SubmitButton>
      </form>
    </div>
  );
}
