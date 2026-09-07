"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search address, owner, parcel ID, city, or county…"
        className="w-full rounded-full border border-brand-200 bg-white px-4 py-2 text-sm text-brand-950 placeholder:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 top-1 bottom-1 px-3 rounded-full bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
      >
        Search
      </button>
    </form>
  );
}
