import Link from "next/link";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header className="border-b border-brand-100 bg-white/90 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold tracking-tight text-brand-900">
            County<span className="text-brand-500">Ledger</span>
          </span>
          <span className="hidden sm:inline text-xs text-brand-600 border border-brand-200 rounded-full px-2 py-0.5">
            free &amp; public
          </span>
        </Link>
        <div className="flex-1 sm:max-w-md">
          <SearchBox />
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-brand-800 shrink-0">
          <Link href="/states" className="hover:text-brand-500">
            Browse States
          </Link>
          <Link href="/data-sources" className="hover:text-brand-500">
            Data Sources
          </Link>
          <Link href="/about" className="hover:text-brand-500">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
