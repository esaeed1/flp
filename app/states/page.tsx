import Link from "next/link";
import type { Metadata } from "next";
import { STATES, stateListingCount, stateCountyWithDataCount, getCountiesForState } from "@/lib/data";
import { formatCompactNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Browse All 50 States",
  description: "Browse tax-delinquent and foreclosure property listings by US state, down to the county.",
};

export default function StatesPage() {
  const rows = STATES.map((s) => ({
    ...s,
    countyCount: getCountiesForState(s.abbr).length,
    listingCount: stateListingCount(s.abbr),
    countiesWithData: stateCountyWithDataCount(s.abbr),
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-950 mb-1">Browse by State</h1>
      <p className="text-brand-600 mb-6 text-sm">
        All 50 states and DC, with every county mapped from official US Census Bureau reference
        data.
      </p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {rows.map((s) => (
          <Link
            key={s.abbr}
            href={`/${s.slug}`}
            className="rounded-xl border border-brand-100 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-950">{s.name}</span>
              <span className="text-xs text-brand-400">{s.countyCount} counties</span>
            </div>
            <div className="text-xs mt-1">
              {s.listingCount > 0 ? (
                <span className="text-brand-600 font-medium">
                  {formatCompactNumber(s.listingCount)} listings in {s.countiesWithData}{" "}
                  {s.countiesWithData === 1 ? "county" : "counties"}
                </span>
              ) : (
                <span className="text-brand-400">No listings ingested yet</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
