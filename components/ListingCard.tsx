import Link from "next/link";
import type { Listing } from "@/lib/types";
import { TYPE_LABELS, TYPE_COLORS, formatMoney } from "@/lib/format";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="block rounded-xl border border-brand-100 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-brand-950">{listing.address}</div>
          <div className="text-sm text-brand-600">
            {[listing.city, listing.countyName, listing.stateAbbr].filter(Boolean).join(", ")}
            {listing.zip ? ` ${listing.zip}` : ""}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[listing.type]}`}
        >
          {TYPE_LABELS[listing.type]}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-brand-700">
        {listing.parcelId && (
          <div>
            <span className="text-brand-400">Parcel</span> {listing.parcelId}
          </div>
        )}
        {listing.amountDue !== undefined && (
          <div>
            <span className="text-brand-400">Amount due</span>{" "}
            <span className="font-medium text-brand-900">{formatMoney(listing.amountDue)}</span>
          </div>
        )}
        {listing.status && (
          <div className="text-brand-500">{listing.status}</div>
        )}
      </div>
    </Link>
  );
}
