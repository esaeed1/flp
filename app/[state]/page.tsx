import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STATE_BY_SLUG, STATES, getCountiesForState, countyListingCount } from "@/lib/data";
import { formatCompactNumber } from "@/lib/format";

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }));
}

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = STATE_BY_SLUG[stateSlug];
  if (!state) return {};
  return {
    title: `${state.name} Tax-Delinquent & Foreclosure Properties by County`,
    description: `Browse tax-delinquent, tax-lien, and tax-sale properties in ${state.name}, organized by all ${getCountiesForState(state.abbr).length} counties.`,
  };
}

export default async function StatePage({ params }: Props) {
  const { state: stateSlug } = await params;
  const state = STATE_BY_SLUG[stateSlug];
  if (!state) notFound();

  const counties = getCountiesForState(state.abbr)
    .map((c) => ({ ...c, listingCount: countyListingCount(c.countyFips) }))
    .sort((a, b) => b.listingCount - a.listingCount || a.name.localeCompare(b.name));

  const totalListings = counties.reduce((sum, c) => sum + c.listingCount, 0);

  return (
    <div>
      <div className="text-sm text-brand-500 mb-2">
        <Link href="/states" className="hover:text-brand-600">
          All states
        </Link>{" "}
        / {state.name}
      </div>
      <h1 className="text-2xl font-bold text-brand-950 mb-1">{state.name}</h1>
      <p className="text-brand-600 mb-6 text-sm">
        {counties.length} counties mapped ·{" "}
        {totalListings > 0 ? `${formatCompactNumber(totalListings)} real listings ingested` : "no listings ingested yet"}
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {counties.map((c) => (
          <Link
            key={c.countyFips}
            href={`/${state.slug}/${c.slug}`}
            className="rounded-xl border border-brand-100 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition"
          >
            <div className="font-medium text-brand-950">{c.name}</div>
            <div className="text-xs mt-1">
              {c.listingCount > 0 ? (
                <span className="text-brand-600 font-medium">{formatCompactNumber(c.listingCount)} listings</span>
              ) : (
                <span className="text-brand-400">No public data source yet</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
