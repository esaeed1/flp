import type { Metadata } from "next";
import { searchListings } from "@/lib/data";
import { formatCompactNumber } from "@/lib/format";
import ListingCard from "@/components/ListingCard";
import SearchBox from "@/components/SearchBox";

export const metadata: Metadata = {
  title: "Search Property Records",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q ?? "";
  const results = q ? searchListings(q, 100) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-950 mb-4">Search property records</h1>
      <div className="max-w-xl mb-6">
        <SearchBox defaultValue={q} />
      </div>

      {!q && (
        <p className="text-sm text-brand-500">
          Search by street address, owner name, parcel/PIN, city, county, or state across every
          listing we&apos;ve ingested.
        </p>
      )}

      {q && (
        <>
          <p className="text-sm text-brand-600 mb-4">
            {results.length === 0
              ? `No matches for "${q}".`
              : `${formatCompactNumber(results.length)}${results.length === 100 ? "+" : ""} match${results.length === 1 ? "" : "es"} for "${q}"`}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {results.map(({ listing }) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {results.length === 0 && (
            <p className="text-sm text-brand-500 mt-4">
              Try a broader term, or{" "}
              <a href="/states" className="underline hover:text-brand-700">
                browse by state and county
              </a>{" "}
              instead — most US counties don&apos;t have a public data feed ingested yet.
            </p>
          )}
        </>
      )}
    </div>
  );
}
