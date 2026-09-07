// Pulls REAL property records from verified US government open-data APIs
// and normalizes them into the site's common Listing schema. No property
// record in this file is invented — everything here traces back to a
// live government dataset, cited in data/generated/sources.json.
//
// Run with: npm run ingest
//
// Sources (verified live before writing this script):
//  - NYC Dept. of Finance, "Tax Lien Sale Lists" (Socrata SODA API)
//    https://data.cityofnewyork.us/City-Government/Tax-Lien-Sale-Lists/9rz4-mjek
//  - Cook County, IL Treasurer, "Annual Tax Sale" (Socrata SODA API)
//    https://datacatalog.cookcountyil.gov/Property-Taxation/Treasurer-Annual-Tax-Sale/55ju-2fs9
//  - Cook County, IL Treasurer, "Scavenger Tax Sale" (Socrata SODA API)
//    https://datacatalog.cookcountyil.gov/Property-Taxation/Treasurer-Scavenger-Tax-Sale/ydgz-vkrp
//  - City of Philadelphia, "Real Estate Tax Delinquencies" (ArcGIS FeatureServer)
//    https://data-phl.opendata.arcgis.com/datasets/phl::real-estate-tax-delinquencies

import fs from "node:fs";
import path from "node:path";
import type { Listing, DataSource } from "../lib/types";

const OUT_DIR = path.join(__dirname, "..", "data", "generated");
const RETRIEVED_AT = new Date().toISOString();

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "county-tax-directory/1.0 (public data ingest)" },
  });
  if (!res.ok) {
    throw new Error(`Request failed ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

async function socrataCount(baseUrl: string, where?: string): Promise<number> {
  const qs = new URLSearchParams({ "$select": "count(*)" });
  if (where) qs.set("$where", where);
  const rows = await fetchJson(`${baseUrl}?${qs.toString()}`);
  return Number(rows[0]?.count ?? 0);
}

async function socrataPage(baseUrl: string, params: Record<string, string>, limit: number, offset: number) {
  const qs = new URLSearchParams({ ...params, "$limit": String(limit), "$offset": String(offset) });
  return fetchJson(`${baseUrl}?${qs.toString()}`);
}

async function socrataFetchAll(baseUrl: string, params: Record<string, string>, cap: number): Promise<any[]> {
  const pageSize = 1000;
  const out: any[] = [];
  let offset = 0;
  while (out.length < cap) {
    const remaining = cap - out.length;
    const rows = await socrataPage(baseUrl, params, Math.min(pageSize, remaining), offset);
    if (!rows.length) break;
    out.push(...rows);
    offset += rows.length;
    if (rows.length < pageSize) break;
  }
  return out;
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// --- NYC Tax Lien Sale Lists -------------------------------------------------
const NYC_BOROUGH_TO_COUNTY: Record<string, { fips: string; name: string }> = {
  "1": { fips: "36061", name: "New York County" }, // Manhattan
  "2": { fips: "36005", name: "Bronx County" },
  "3": { fips: "36047", name: "Kings County" }, // Brooklyn
  "4": { fips: "36081", name: "Queens County" },
  "5": { fips: "36085", name: "Richmond County" }, // Staten Island
};

async function ingestNyc(): Promise<{ listings: Listing[]; source: DataSource }> {
  const base = "https://data.cityofnewyork.us/resource/9rz4-mjek.json";
  const total = await socrataCount(base);

  const latest = await fetchJson(
    `${base}?${new URLSearchParams({
      "$select": "month",
      "$group": "month",
      "$order": "month DESC",
      "$limit": "1",
    })}`
  );
  const latestMonth: string = latest[0]?.month;

  const rows = await socrataFetchAll(
    base,
    { "$where": `month='${latestMonth}'`, "$order": "borough,block,lot" },
    6000
  );

  const listings: Listing[] = rows
    .filter((r) => NYC_BOROUGH_TO_COUNTY[r.borough])
    .map((r) => {
      const county = NYC_BOROUGH_TO_COUNTY[r.borough];
      const address = [r.house_number, r.street_name].filter(Boolean).join(" ");
      return {
        id: `nyc-lien-${r.borough}-${r.block}-${r.lot}`,
        stateAbbr: "NY",
        countyFips: county.fips,
        countyName: county.name,
        type: "tax_lien",
        address: titleCase(address || "Address withheld"),
        zip: r.zip_code,
        parcelId: `Block ${r.block}, Lot ${r.lot}`,
        status: r.water_debt_only === "YES" ? "Eligible for lien sale (water debt only)" : "Eligible for lien sale",
        saleYear: latestMonth?.slice(0, 7),
        sourceId: "nyc-tax-lien-sale-list",
        retrievedAt: RETRIEVED_AT,
      } satisfies Listing;
    });

  const source: DataSource = {
    id: "nyc-tax-lien-sale-list",
    name: "NYC Department of Finance — Tax Lien Sale List",
    agency: "New York City Department of Finance",
    datasetUrl: "https://data.cityofnewyork.us/City-Government/Tax-Lien-Sale-Lists/9rz4-mjek",
    apiUrl: base,
    license: "NYC Open Data Terms of Use",
    countyFips: Object.values(NYC_BOROUGH_TO_COUNTY).map((c) => c.fips),
    totalAvailableAtSource: total,
    ingestedCount: listings.length,
    retrievedAt: RETRIEVED_AT,
    notes: `Showing the most recent published lien-sale cycle (${latestMonth?.slice(0, 10)}). Properties with unpaid property tax and/or water charges that were eligible for the NYC tax lien sale.`,
  };

  return { listings, source };
}

// --- Cook County, IL — Annual Tax Sale --------------------------------------
async function ingestCookAnnual(): Promise<{ listings: Listing[]; source: DataSource }> {
  const base = "https://datacatalog.cookcountyil.gov/resource/55ju-2fs9.json";
  const total = await socrataCount(base);

  const latest = await fetchJson(
    `${base}?${new URLSearchParams({ "$select": "tax_sale_year", "$group": "tax_sale_year", "$order": "tax_sale_year DESC", "$limit": "1" })}`
  );
  const latestYear: string = latest[0]?.tax_sale_year;

  const rows = await socrataFetchAll(
    base,
    { "$where": `tax_sale_year='${latestYear}'`, "$order": "total_amount_forfeited DESC" },
    1500
  );

  const listings: Listing[] = rows.map((r, i) => ({
    id: `cook-annual-${latestYear}-${r.pin ?? i}`,
    stateAbbr: "IL",
    countyFips: "17031",
    countyName: "Cook County",
    type: "tax_sale",
    address: r.township_name ? `${titleCase(r.township_name)} Township, Cook County` : "Cook County, IL",
    parcelId: r.pin,
    amountDue: toNumber(r.total_tax_and_penalty_amount_offered) ?? toNumber(r.total_amount_forfeited),
    status: r.sold_at_sale === true || r.sold_at_sale === "true" ? "Sold at annual tax sale" : "Forfeited / offered at annual tax sale",
    saleYear: latestYear,
    lat: toNumber(r.location_1?.latitude),
    lon: toNumber(r.location_1?.longitude),
    sourceId: "cook-county-annual-tax-sale",
    retrievedAt: RETRIEVED_AT,
  }));

  const source: DataSource = {
    id: "cook-county-annual-tax-sale",
    name: "Cook County Treasurer — Annual Tax Sale",
    agency: "Cook County (Illinois) Treasurer's Office",
    datasetUrl: "https://datacatalog.cookcountyil.gov/Property-Taxation/Treasurer-Annual-Tax-Sale/55ju-2fs9",
    apiUrl: base,
    license: "Cook County Open Data — Public Domain",
    countyFips: ["17031"],
    totalAvailableAtSource: total,
    ingestedCount: listings.length,
    retrievedAt: RETRIEVED_AT,
    notes: `Cook County's public dataset covers tax sale years through ${latestYear}. Parcels (by PIN) with delinquent property taxes offered at the county's annual tax sale.`,
  };

  return { listings, source };
}

// --- Cook County, IL — Scavenger Tax Sale -----------------------------------
async function ingestCookScavenger(): Promise<{ listings: Listing[]; source: DataSource }> {
  const base = "https://datacatalog.cookcountyil.gov/resource/ydgz-vkrp.json";
  const total = await socrataCount(base);

  const latest = await fetchJson(
    `${base}?${new URLSearchParams({ "$select": "tax_sale_year", "$group": "tax_sale_year", "$order": "tax_sale_year DESC", "$limit": "1" })}`
  );
  const latestYear: string = latest[0]?.tax_sale_year;

  const rows = await socrataFetchAll(base, { "$where": `tax_sale_year='${latestYear}'` }, 1500);

  const listings: Listing[] = rows.map((r, i) => ({
    id: `cook-scavenger-${latestYear}-${r.pin ?? i}`,
    stateAbbr: "IL",
    countyFips: "17031",
    countyName: "Cook County",
    type: "tax_sale",
    address: r.township ? `${titleCase(r.township)} Township, Cook County` : "Cook County, IL",
    parcelId: r.pin,
    amountDue: toNumber(r.total_amount_paid),
    status: r.sold_at_sale === true || r.sold_at_sale === "true" ? `Sold at scavenger sale${r.buyer_name ? ` to ${titleCase(r.buyer_name)}` : ""}` : "Offered at scavenger sale (3+ years delinquent)",
    saleYear: latestYear,
    lat: toNumber(r.location_1?.latitude),
    lon: toNumber(r.location_1?.longitude),
    sourceId: "cook-county-scavenger-tax-sale",
    retrievedAt: RETRIEVED_AT,
  }));

  const source: DataSource = {
    id: "cook-county-scavenger-tax-sale",
    name: "Cook County Treasurer — Scavenger Tax Sale",
    agency: "Cook County (Illinois) Treasurer's Office",
    datasetUrl: "https://datacatalog.cookcountyil.gov/Property-Taxation/Treasurer-Scavenger-Tax-Sale/ydgz-vkrp",
    apiUrl: base,
    license: "Cook County Open Data — Public Domain",
    countyFips: ["17031"],
    totalAvailableAtSource: total,
    ingestedCount: listings.length,
    retrievedAt: RETRIEVED_AT,
    notes: `The biennial Scavenger Sale offers parcels delinquent 3+ years that went unsold at an Annual Tax Sale. Public dataset covers sale years through ${latestYear}.`,
  };

  return { listings, source };
}

// --- Philadelphia, PA — Real Estate Tax Delinquencies -----------------------
async function ingestPhilly(): Promise<{ listings: Listing[]; source: DataSource }> {
  const base =
    "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/real_estate_tax_delinquencies/FeatureServer/0/query";

  const countRes = await fetchJson(`${base}?${new URLSearchParams({ where: "1=1", returnCountOnly: "true", f: "json" })}`);
  const total = countRes.count as number;

  const dataRes = await fetchJson(
    `${base}?${new URLSearchParams({
      where: "1=1",
      outFields: "OPA_NUMBER,STREET_ADDRESS,ZIP_CODE,OWNER,PRINCIPAL_DUE,PENALTY_DUE,INTEREST_DUE,TOTAL_DUE,NUM_YEARS_OWED,MOST_RECENT_YEAR_OWED,PAYMENT_AGREEMENT",
      orderByFields: "TOTAL_DUE DESC",
      resultRecordCount: "2000",
      f: "json",
    })}`
  );

  const features = dataRes.features ?? [];
  const listings: Listing[] = features.map((f: any) => {
    const a = f.attributes;
    return {
      id: `phl-delinq-${a.OPA_NUMBER}`,
      stateAbbr: "PA",
      countyFips: "42101",
      countyName: "Philadelphia County",
      type: "tax_delinquent",
      address: titleCase(a.STREET_ADDRESS || "Address withheld"),
      city: "Philadelphia",
      zip: a.ZIP_CODE ? String(a.ZIP_CODE) : undefined,
      parcelId: a.OPA_NUMBER ? String(a.OPA_NUMBER) : undefined,
      owner: a.OWNER ? titleCase(a.OWNER) : undefined,
      amountDue: toNumber(a.TOTAL_DUE),
      status: a.PAYMENT_AGREEMENT === "Y" ? "Delinquent — active payment agreement" : "Delinquent",
      saleYear: a.MOST_RECENT_YEAR_OWED ? String(a.MOST_RECENT_YEAR_OWED) : undefined,
      sourceId: "philadelphia-tax-delinquencies",
      retrievedAt: RETRIEVED_AT,
    } satisfies Listing;
  });

  const source: DataSource = {
    id: "philadelphia-tax-delinquencies",
    name: "City of Philadelphia — Real Estate Tax Delinquencies",
    agency: "City of Philadelphia, Department of Revenue",
    datasetUrl: "https://data-phl.opendata.arcgis.com/datasets/phl::real-estate-tax-delinquencies/about",
    apiUrl: base,
    license: "Open Data Philly — Public Domain",
    countyFips: ["42101"],
    totalAvailableAtSource: total,
    ingestedCount: listings.length,
    retrievedAt: RETRIEVED_AT,
    notes: "Live, monthly-updated feed of real estate accounts with unpaid property tax as of January 1 following the tax year due. Showing the largest 2,000 balances of the current dataset.",
  };

  return { listings, source };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const results = await Promise.allSettled([ingestNyc(), ingestCookAnnual(), ingestCookScavenger(), ingestPhilly()]);

  const allListings: Listing[] = [];
  const sources: DataSource[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      allListings.push(...r.value.listings);
      sources.push(r.value.source);
      console.log(`OK  ${r.value.source.id}: ${r.value.listings.length} listings`);
    } else {
      console.error("FAILED a source:", r.reason);
    }
  }

  if (allListings.length === 0) {
    throw new Error("Ingestion produced zero listings from all sources — aborting so stale/committed data is preserved.");
  }

  const countyCounts = new Map<string, number>();
  for (const l of allListings) {
    countyCounts.set(l.countyFips, (countyCounts.get(l.countyFips) ?? 0) + 1);
  }

  // Single combined file, imported directly by the app (bundled by Next.js —
  // no runtime filesystem reads needed, which keeps this reliable on Vercel).
  fs.writeFileSync(path.join(OUT_DIR, "listings.json"), JSON.stringify(allListings));
  fs.writeFileSync(path.join(OUT_DIR, "sources.json"), JSON.stringify(sources, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "county-counts.json"), JSON.stringify(Object.fromEntries(countyCounts), null, 2));
  fs.writeFileSync(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify(
      { retrievedAt: RETRIEVED_AT, totalListings: allListings.length, countiesWithData: countyCounts.size, sourceCount: sources.length },
      null,
      2
    )
  );

  console.log(`\nDone. ${allListings.length} real listings across ${countyCounts.size} counties from ${sources.length} sources.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
