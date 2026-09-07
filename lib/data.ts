import countiesData from "@/data/generated/counties.json";
import listingsData from "@/data/generated/listings.json";
import sourcesData from "@/data/generated/sources.json";
import metaData from "@/data/generated/meta.json";
import countyCountsData from "@/data/generated/county-counts.json";
import { STATES, STATE_BY_ABBR, STATE_BY_SLUG, type StateRef } from "./states";
import type { Listing, DataSource } from "./types";

export interface CountyRef {
  stateAbbr: string;
  stateFips: string;
  countyFips: string;
  name: string;
  slug: string;
}

const counties = countiesData as CountyRef[];
const listings = listingsData as Listing[];
export const sources = sourcesData as DataSource[];

const countyByFipsMap = new Map(counties.map((c) => [c.countyFips, c]));
const countyBySlugMap = new Map(counties.map((c) => [`${c.stateAbbr}/${c.slug}`, c]));
const listingByIdMap = new Map(listings.map((l) => [l.id, l]));
const listingsByCountyMap = new Map<string, Listing[]>();
for (const l of listings) {
  const arr = listingsByCountyMap.get(l.countyFips);
  if (arr) arr.push(l);
  else listingsByCountyMap.set(l.countyFips, [l]);
}
export const meta = metaData as {
  retrievedAt: string;
  totalListings: number;
  countiesWithData: number;
  sourceCount: number;
};
export const countyCounts = countyCountsData as Record<string, number>;

export { STATES, STATE_BY_ABBR, STATE_BY_SLUG };
export type { StateRef };

export function getAllCounties(): CountyRef[] {
  return counties;
}

export function getCountiesForState(stateAbbr: string): CountyRef[] {
  return counties.filter((c) => c.stateAbbr === stateAbbr);
}

export function getCountyBySlug(stateAbbr: string, slug: string): CountyRef | undefined {
  return countyBySlugMap.get(`${stateAbbr}/${slug}`);
}

export function getCountyByFips(fips: string): CountyRef | undefined {
  return countyByFipsMap.get(fips);
}

export function countyListingCount(fips: string): number {
  return countyCounts[fips] ?? 0;
}

export function stateListingCount(stateAbbr: string): number {
  return getCountiesForState(stateAbbr).reduce((sum, c) => sum + countyListingCount(c.countyFips), 0);
}

export function stateCountyWithDataCount(stateAbbr: string): number {
  return getCountiesForState(stateAbbr).filter((c) => countyListingCount(c.countyFips) > 0).length;
}

export function getListingsForCounty(fips: string): Listing[] {
  return listingsByCountyMap.get(fips) ?? [];
}

export function getListingById(id: string): Listing | undefined {
  return listingByIdMap.get(id);
}

export function getAllListings(): Listing[] {
  return listings;
}

export function getSourceById(id: string): DataSource | undefined {
  return sources.find((s) => s.id === id);
}

export function statesWithDataAbbrs(): string[] {
  const set = new Set<string>();
  for (const l of listings) set.add(l.stateAbbr);
  return Array.from(set);
}

export interface SearchResult {
  listing: Listing;
  county: CountyRef | undefined;
}

export function searchListings(query: string, limit = 100): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];
  for (const l of listings) {
    const haystack = [l.address, l.city, l.zip, l.parcelId, l.owner, l.countyName, l.stateAbbr]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (haystack.includes(q)) {
      results.push({ listing: l, county: getCountyByFips(l.countyFips) });
      if (results.length >= limit) break;
    }
  }
  return results;
}
