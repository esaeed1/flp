import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getListingById, getSourceById, STATES, getCountyByFips } from "@/lib/data";
import { TYPE_LABELS, TYPE_COLORS, formatMoney, formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = getListingById(id);
  if (!listing) return {};
  return {
    title: `${listing.address} — ${listing.countyName}, ${listing.stateAbbr}`,
    description: `${TYPE_LABELS[listing.type]} property record: ${listing.address}, ${listing.countyName}, ${listing.stateAbbr}. Sourced from official government open data.`,
  };
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const listing = getListingById(id);
  if (!listing) notFound();

  const state = STATES.find((s) => s.abbr === listing.stateAbbr);
  const county = getCountyByFips(listing.countyFips);
  const source = getSourceById(listing.sourceId);

  const fields: [string, string | undefined][] = [
    ["Parcel / PIN", listing.parcelId],
    ["Owner of record", listing.owner],
    ["Amount due", listing.amountDue !== undefined ? formatMoney(listing.amountDue) : undefined],
    ["Status", listing.status],
    ["Sale / cycle year", listing.saleYear],
    ["ZIP", listing.zip],
  ];

  return (
    <div className="max-w-2xl">
      <div className="text-sm text-brand-500 mb-2">
        <Link href="/states" className="hover:text-brand-600">
          All states
        </Link>{" "}
        /{" "}
        {state && (
          <>
            <Link href={`/${state.slug}`} className="hover:text-brand-600">
              {state.name}
            </Link>{" "}
            /{" "}
          </>
        )}
        {county && (
          <Link href={`/${state?.slug}/${county.slug}`} className="hover:text-brand-600">
            {county.name}
          </Link>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-950">{listing.address}</h1>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${TYPE_COLORS[listing.type]}`}>
          {TYPE_LABELS[listing.type]}
        </span>
      </div>
      <p className="text-brand-600 mt-1">
        {[listing.city, listing.countyName, listing.stateAbbr].filter(Boolean).join(", ")}
        {listing.zip ? ` ${listing.zip}` : ""}
      </p>

      <dl className="mt-6 divide-y divide-brand-100 rounded-xl border border-brand-100 bg-white">
        {fields
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-3 text-sm">
              <dt className="text-brand-500">{k}</dt>
              <dd className="font-medium text-brand-950 text-right">{v}</dd>
            </div>
          ))}
      </dl>

      {source && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
          <div className="font-semibold mb-1">Official source</div>
          <p className="mb-2">
            This record was retrieved from <strong>{source.name}</strong> ({source.agency}), a
            public open-data feed, on {formatDate(listing.retrievedAt)}. CountyLedger does not
            modify underlying facts — always confirm current status directly with the county
            before acting.
          </p>
          <a
            href={source.datasetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-brand-700 underline underline-offset-2 hover:text-brand-900"
          >
            View the official dataset →
          </a>
        </div>
      )}

      <p className="mt-6 text-xs text-brand-400">
        CountyLedger is an independent, free directory and is not affiliated with{" "}
        {source?.agency ?? "the listed agency"} or any government office.
      </p>
    </div>
  );
}
