import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About CountyLedger",
  description: "A free, public, no-paywall directory of tax-delinquent and foreclosure properties sourced from real government open data.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-950 mb-4">About CountyLedger</h1>

      <div className="space-y-4 text-brand-700">
        <p>
          CountyLedger is a free, public directory of tax-delinquent, tax-lien, and tax-sale
          properties across the United States — organized by state and county, the way county
          treasurers and assessors actually publish this information.
        </p>
        <p>
          There&apos;s no account, no subscription, and no paywall. The whole site is built on the
          idea that this kind of data is already public — it&apos;s just scattered across
          thousands of individual county websites, PDFs, and portals. CountyLedger&apos;s only job
          is to pull it into one searchable place and always point back to the original source.
        </p>
        <p>
          We source exclusively from official government open-data APIs (city, county, and state
          portals). We do not scrape private listing aggregators, and we never fabricate,
          estimate, or fill in a property record that a government source didn&apos;t actually
          publish. See the{" "}
          <Link href="/data-sources" className="underline hover:text-brand-900">
            data sources &amp; methodology
          </Link>{" "}
          page for the exact feeds behind every listing.
        </p>
        <p>
          Coverage today is intentionally small and honest: most of the 3,143 US counties show
          zero listings because we haven&apos;t found or ingested a public feed for them yet — not
          because nothing is happening there. The full state → county map is real US Census Bureau
          reference data regardless of whether a county has listings.
        </p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Not legal, financial, or investment advice.</strong> CountyLedger reproduces
          public records for informational purposes only. Tax and foreclosure status changes
          quickly — always verify current status directly with the county treasurer, assessor, or
          court before making any decision.
        </div>
        <p className="text-sm text-brand-500">
          CountyLedger is an independent project and is not affiliated with, endorsed by, or
          connected to dplistings.com or any government agency referenced on this site.
        </p>
      </div>
    </div>
  );
}
