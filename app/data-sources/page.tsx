import type { Metadata } from "next";
import { sources, meta } from "@/lib/data";
import { formatCompactNumber, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Data Sources & Methodology",
  description: "Exactly which official government open-data feeds power CountyLedger, and how the data is ingested.",
};

export default function DataSourcesPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-950 mb-2">Data sources &amp; methodology</h1>
      <p className="text-brand-700 mb-8">
        CountyLedger never invents property records. Every listing on this site is pulled
        programmatically from a real, public, official government open-data API and normalized
        into a common format. This page lists exactly what those sources are, how much of each we
        ingested, and when.
      </p>

      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800 mb-8">
        Last full ingest: <strong>{formatDate(meta.retrievedAt)}</strong> — {formatCompactNumber(meta.totalListings)}{" "}
        listings across {meta.countiesWithData} counties from {meta.sourceCount} government sources.
      </div>

      <div className="space-y-6">
        {sources.map((s) => (
          <div key={s.id} className="rounded-xl border border-brand-100 bg-white p-5">
            <h2 className="font-semibold text-brand-950">{s.name}</h2>
            <p className="text-sm text-brand-500 mb-3">{s.agency}</p>
            <dl className="text-sm space-y-1">
              <Row label="Dataset page">
                <a href={s.datasetUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-700 break-all">
                  {s.datasetUrl}
                </a>
              </Row>
              <Row label="API endpoint">
                <span className="break-all">{s.apiUrl}</span>
              </Row>
              <Row label="License / terms">{s.license}</Row>
              <Row label="Total records at source">{formatCompactNumber(s.totalAvailableAtSource)}</Row>
              <Row label="Records ingested">{formatCompactNumber(s.ingestedCount)}</Row>
              <Row label="Retrieved">{formatDate(s.retrievedAt)}</Row>
              {s.notes && <Row label="Notes">{s.notes}</Row>}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-brand-200 p-5 text-sm text-brand-600">
        <p className="font-medium text-brand-800 mb-1">How ingestion works</p>
        <p>
          A scheduled script queries each government API directly (Socrata SODA APIs and Esri
          ArcGIS FeatureServer REST APIs), takes the most recent published cycle where the source
          publishes on a rolling basis, and maps raw fields (parcel/PIN, address, amounts owed,
          sale status) into CountyLedger&apos;s common schema. No field is guessed or filled in —
          if a source doesn&apos;t publish a value, we leave it blank rather than fabricate one.
          The reference list of all 50 states and 3,143 counties comes separately from the{" "}
          <a
            href="https://www.census.gov/library/reference/code-lists/ansi.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brand-700"
          >
            US Census Bureau&apos;s ANSI county reference file
          </a>
          , independent of whether a county has any listings yet.
        </p>
        <p className="mt-3">
          Know a county, city, or state with a public tax-delinquent, tax-lien, or foreclosure
          open-data feed that isn&apos;t listed here?{" "}
          <a href="mailto:hello@countyledger.example?subject=Data%20source%20suggestion" className="underline hover:text-brand-700">
            Send it our way
          </a>{" "}
          and we&apos;ll add it.
        </p>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3">
      <dt className="text-brand-400 sm:w-40 shrink-0">{label}</dt>
      <dd className="text-brand-900">{children}</dd>
    </div>
  );
}
