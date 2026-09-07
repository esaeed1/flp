import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center justify-between mt-6 text-sm">
      <Link
        href={makeHref(prev)}
        aria-disabled={page === 1}
        className={`rounded-full border px-4 py-1.5 ${
          page === 1
            ? "pointer-events-none border-brand-100 text-brand-300"
            : "border-brand-200 text-brand-700 hover:bg-brand-50"
        }`}
      >
        ← Previous
      </Link>
      <span className="text-brand-600">
        Page {page} of {totalPages}
      </span>
      <Link
        href={makeHref(next)}
        aria-disabled={page === totalPages}
        className={`rounded-full border px-4 py-1.5 ${
          page === totalPages
            ? "pointer-events-none border-brand-100 text-brand-300"
            : "border-brand-200 text-brand-700 hover:bg-brand-50"
        }`}
      >
        Next →
      </Link>
    </div>
  );
}
