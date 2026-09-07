import Link from "next/link";
import { STATES, meta, stateListingCount, stateCountyWithDataCount, sources } from "@/lib/data";
import { formatCompactNumber, formatDate } from "@/lib/format";

export default function HomePage() {
  const statesWithListings = STATES.map((s) => ({
    ...s,
    listingCount: stateListingCount(s.abbr),
    countiesWithData: stateCountyWithDataCount(s.abbr),
  })).sort((a, b) => b.listingCount - a.listingCount || a.name.localeCompare(b.name));

  return (
    <div>
      <section className="text-center py-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-950">
          Every state. Every county.
          <br />
          <span className="text-brand-500">Real government tax data.</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-brand-700">
          CountyLedger is a free, public directory of tax-delinquent, tax-lien, and tax-sale
          properties — sourced directly from official county and city open-data portals. No
          account. No paywall. No invented listings, ever.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
          <Stat label="Real listings" value={formatCompactNumber(meta.totalListings)} />
          <Stat label="Counties with live data" value={String(meta.countiesWithData)} />
          <Stat label="Government sources" value={String(meta.sourceCount)} />
          <Stat label="US counties mapped" value="3,143" />
        </div>
        <p className="mt-3 text-xs text-brand-400">Data last refreshed {formatDate(meta.retrievedAt)}</p>
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-950">Browse by state</h2>
          <Link href="/states" className="text-sm text-brand-600 hover:text-brand-500">
            View all states →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {statesWithListings.slice(0, 12).map((s) => (
            <Link
              key={s.abbr}
              href={`/${s.slug}`}
              className="rounded-xl border border-brand-100 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition"
            >
              <div className="font-semibold text-brand-950">{s.name}</div>
              <div className="text-xs text-brand-500 mt-1">
                {s.listingCount > 0 ? (
                  <span className="text-brand-600 font-medium">
                    {formatCompactNumber(s.listingCount)} listings
                  </span>
                ) : (
                  "Counties mapped, no listings yet"
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 sm:grid-cols-3">
        <InfoCard
          title="1. Pick a state"
          body="All 50 states plus DC are mapped down to the county — real Census Bureau reference data, not a guess."
        />
        <InfoCard
          title="2. Pick a county"
          body="Every county page shows exactly how many public tax-delinquent, lien, or sale records we've ingested — zero if none yet."
        />
        <InfoCard
          title="3. Verify with the source"
          body="Every listing links back to the official government dataset it came from. We aggregate; the county remains the source of truth."
        />
      </section>

      <section className="mt-14 rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="text-lg font-bold text-brand-950 mb-2">Where the data comes from right now</h2>
        <p className="text-sm text-brand-600 mb-4">
          This directory is brand new and grows one verified government feed at a time. Today it
          includes:
        </p>
        <ul className="space-y-2">
          {sources.map((s) => (
            <li key={s.id} className="text-sm">
              <a href={s.datasetUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 hover:text-brand-500 underline underline-offset-2">
                {s.name}
              </a>{" "}
              <span className="text-brand-400">— {s.agency}, {formatCompactNumber(s.ingestedCount)} records</span>
            </li>
          ))}
        </ul>
        <Link href="/data-sources" className="inline-block mt-4 text-sm font-medium text-brand-600 hover:text-brand-500">
          Full methodology & sources →
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white border border-brand-100 px-5 py-3">
      <div className="text-2xl font-extrabold text-brand-900">{value}</div>
      <div className="text-xs text-brand-500">{label}</div>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-white p-5">
      <div className="font-semibold text-brand-900 mb-1">{title}</div>
      <p className="text-sm text-brand-600">{body}</p>
    </div>
  );
}
