import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="rounded-md border border-border-strong px-3 py-1.5 font-medium hover:bg-surface-sunken"
        >
          ก่อนหน้า
        </Link>
      ) : (
        <span className="rounded-md border border-transparent px-3 py-1.5 text-muted opacity-50">
          ก่อนหน้า
        </span>
      )}

      <span className="text-muted">
        หน้า {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className="rounded-md border border-border-strong px-3 py-1.5 font-medium hover:bg-surface-sunken"
        >
          ถัดไป
        </Link>
      ) : (
        <span className="rounded-md border border-transparent px-3 py-1.5 text-muted opacity-50">
          ถัดไป
        </span>
      )}
    </div>
  );
}
