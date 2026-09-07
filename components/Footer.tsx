import Link from "next/link";
import { meta } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-brand-700">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="font-bold text-brand-900 mb-2">CountyLedger</div>
            <p className="text-brand-600">
              A free, public directory of tax-delinquent, tax-lien, and tax-sale properties, built
              directly from official government open-data portals. No account, no paywall.
            </p>
          </div>
          <div>
            <div className="font-semibold text-brand-900 mb-2">Explore</div>
            <ul className="space-y-1">
              <li>
                <Link href="/states" className="hover:text-brand-500">
                  Browse all 50 states
                </Link>
              </li>
              <li>
                <Link href="/data-sources" className="hover:text-brand-500">
                  Data sources &amp; methodology
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-500">
                  About this project
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-brand-900 mb-2">Disclaimer</div>
            <p className="text-brand-600">
              Not affiliated with any government agency or dplistings.com. Listings are public
              records reproduced from official sources — always verify with the county before
              taking action. Data last refreshed {formatDate(meta.retrievedAt)}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
