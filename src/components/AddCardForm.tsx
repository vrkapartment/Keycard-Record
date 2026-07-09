import { createCard } from "@/actions/cards";
import { CardCodeField } from "@/components/CardCodeField";
import { SubmitButton } from "@/components/SubmitButton";

export function AddCardForm({
  rooms,
  defaultRoomId,
  title,
}: {
  rooms: { id: number; number: string }[];
  defaultRoomId?: string;
  title?: string;
}) {
  return (
    <form
      action={createCard}
      className="space-y-3 rounded-xl border border-border bg-paper p-4"
    >
      {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor="roomId">
            ห้อง
          </label>
          <select
            id="roomId"
            name="roomId"
            required
            defaultValue={defaultRoomId ?? ""}
            className="w-full rounded-md border border-border-strong px-3 py-2.5 text-sm"
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
        <div className="flex-1">
          <CardCodeField placeholder="เช่น 00042" />
        </div>
      </div>
      <SubmitButton pendingText="กำลังบันทึก…">+ เพิ่มบัตร</SubmitButton>
    </form>
  );
}
