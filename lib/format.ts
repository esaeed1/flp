import type { ListingType } from "./types";

export const TYPE_LABELS: Record<ListingType, string> = {
  tax_lien: "Tax Lien",
  tax_sale: "Tax Sale",
  tax_delinquent: "Tax Delinquent",
};

export const TYPE_COLORS: Record<ListingType, string> = {
  tax_lien: "bg-amber-100 text-amber-800 border-amber-200",
  tax_sale: "bg-rose-100 text-rose-800 border-rose-200",
  tax_delinquent: "bg-brand-100 text-brand-800 border-brand-200",
};

export function formatMoney(n?: number): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

export function formatCompactNumber(n: number): string {
  return n.toLocaleString("en-US");
}
