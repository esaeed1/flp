import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-brand-950 mb-2">Page not found</h1>
      <p className="text-brand-600 mb-6">That state, county, or listing doesn&apos;t exist.</p>
      <Link href="/" className="text-brand-600 underline hover:text-brand-800">
        Back to home
      </Link>
    </div>
  );
}
