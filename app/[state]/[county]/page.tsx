import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STATE_BY_SLUG, getCountyBySlug, getListingsForCounty, getSourceById } from "@/lib/data";
import { formatCompactNumber } from "@/lib/format";
import ListingCard from "@/components/ListingCard";
import Pagination from "@/components/Pagination";
import type { ListingType } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/format";

const PAGE_SIZE = 24;

type Props = {
  params: Promise<{ state: string; county: string }>;
  searchParams: Promise<{ page?: string; type?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, county: countySlug } = await params;
  const state = STATE_BY_SLUG[stateSlug];
  if (!state) return {};
  const county = getCountyBySlug(state.abbr, countySlug);
  if (!county) return {};
  const count = getListingsForCounty(county.countyFips).length;
  return {
    title: `${county.name}, ${state.abbr} — Tax-Delinquent & Foreclosure Properties`,
    description: `${count > 0 ? formatCompactNumber(count) : "Browse"} real tax-delinquent, tax-lien, and tax-sale property listings in ${county.name}, ${state.name}, sourced from official government data.`,
  };
}

export default async function CountyPage({ params, searchParams }: Props) {
  const { state: stateSlug, county: countySlug } = await params;
  const sp = await searchParams;
  const state = STATE_BY_SLUG[stateSlug];
  if (!state) notFound();
  const county = getCountyBySlug(state.abbr, countySlug);
  if (!county) notFound();

  const all = getListingsForCounty(county.countyFips).sort(
    (a, b) => (b.amountDue ?? 0) - (a.amountDue ?? 0)
  );

  const typeFilter = sp.type as ListingType | undefined;
  const filtered = typeFilter ? all.filter((l) => l.type === typeFilter) : all;

  const page = Math.max(1, Number(sp.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const typesPresent = Array.from(new Set(all.map((l) => l.type)));
  const sourceIds = Array.from(new Set(all.map((l) => l.sourceId)));

  function hrefFor(p: number, type?: string) {
    const qs = new URLSearchParams();
    if (type) qs.set("type", type);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `/${state!.slug}/${county!.slug}${s ? `?${s}` : ""}`;
  }

  return (
    <div>
      <div className="text-sm text-brand-500 mb-2">
        <Link href="/states" className="hover:text-brand-600">
          All states
        </Link>{" "}
        /{" "}
        <Link href={`/${state.slug}`} className="hover:text-brand-600">
          {state.name}
        </Link>{" "}
        / {county.name}
      </div>
      <h1 className="text-2xl font-bold text-brand-950 mb-1">
        {county.name}, {state.abbr}
      </h1>

      {all.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-white p-8 text-center">
          <p className="text-brand-700 font-medium">No public tax data source ingested for this county yet.</p>
          <p className="text-sm text-brand-500 mt-2 max-w-md mx-auto">
            We only publish real records pulled from official government portals — we never invent
            listings. Know a county treasurer, assessor, or sheriff&apos;s sale feed with an open
            data API?{" "}
            <a href="mailto:hello@countyledger.example?subject=Data%20source%20suggestion" className="underline hover:text-brand-600">
              Suggest a source
            </a>
            .
          </p>
        </div>
      ) : (
        <>
          <p className="text-brand-600 mb-4 text-sm">{formatCompactNumber(filtered.length)} listings</p>

          {typesPresent.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Link
                href={hrefFor(1)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  !typeFilter ? "bg-brand-600 text-white border-brand-600" : "border-brand-200 text-brand-700"
                }`}
              >
                All
              </Link>
              {typesPresent.map((t) => (
                <Link
                  key={t}
                  href={hrefFor(1, t)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    typeFilter === t ? "bg-brand-600 text-white border-brand-600" : "border-brand-200 text-brand-700"
                  }`}
                >
                  {TYPE_LABELS[t]}
                </Link>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {pageItems.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} makeHref={(p) => hrefFor(p, typeFilter)} />
        </>
      )}

      {sourceIds.length > 0 && (
        <div className="mt-10 rounded-xl border border-brand-100 bg-white p-4 text-xs text-brand-500">
          <span className="font-medium text-brand-700">Sourced from: </span>
          {sourceIds.map((id, i) => {
            const src = getSourceById(id);
            if (!src) return null;
            return (
              <span key={id}>
                <a href={src.datasetUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-700">
                  {src.name}
                </a>
                {i < sourceIds.length - 1 ? ", " : ""}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
