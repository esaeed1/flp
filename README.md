# CountyLedger

A **free, public, no-paywall** directory of tax-delinquent, tax-lien, and tax-sale
properties across the United States — browsable by **State → County → Listing**,
the way this data is actually published by county governments.

Modeled on the idea behind sites like dplistings.com, but simpler and completely
free: no account, no subscription, no gated results.

## What makes the data real

This project never fabricates a property record. Everything ships from two kinds
of real, public sources:

1. **Reference data** — all 50 states + DC and all 3,143 counties, with FIPS
   codes, from the [US Census Bureau's ANSI county reference
   file](https://www.census.gov/library/reference/code-lists/ansi.html)
   (`data/raw/national_county.csv`, processed by `scripts/build-counties.ts`).
2. **Listings** — pulled live from official city/county open-data APIs by
   `scripts/ingest.ts` (`npm run ingest`):
   - NYC Department of Finance — [Tax Lien Sale
     Lists](https://data.cityofnewyork.us/City-Government/Tax-Lien-Sale-Lists/9rz4-mjek)
     (Socrata SODA API)
   - Cook County, IL Treasurer — [Annual Tax
     Sale](https://datacatalog.cookcountyil.gov/Property-Taxation/Treasurer-Annual-Tax-Sale/55ju-2fs9)
     and [Scavenger Tax
     Sale](https://datacatalog.cookcountyil.gov/Property-Taxation/Treasurer-Scavenger-Tax-Sale/ydgz-vkrp)
     (Socrata SODA API)
   - City of Philadelphia — [Real Estate Tax
     Delinquencies](https://data-phl.opendata.arcgis.com/datasets/phl::real-estate-tax-delinquencies/about)
     (Esri ArcGIS FeatureServer)

The exact record counts, license terms, and retrieval timestamp for each source
are shown on the site's `/data-sources` page and in
`data/generated/sources.json`. Most of the 3,143 counties intentionally show
**zero listings** — that's honest: no public feed has been ingested for them
yet. Coverage grows by adding more real government sources to
`scripts/ingest.ts`, never by inventing data.

## Tech stack

- **Next.js 16** (App Router, TypeScript, React 19)
- **Tailwind CSS** for styling
- Listings and county reference data are ingested to static JSON
  (`data/generated/`) and imported directly into the app — no database, no
  runtime API calls, so it deploys as a plain Next.js app with nothing extra
  to provision.

## Running locally

```bash
npm install

# (optional) re-pull the latest raw Census county file into data/raw/
# already included in this repo, so this step is optional
# curl -o data/raw/national_county.csv https://www2.census.gov/geo/docs/reference/codes/national_county.txt

npm run build-counties   # rebuild data/generated/counties.json from data/raw
npm run ingest            # pull fresh listings from the government APIs above

npm run dev                # http://localhost:3000
```

`data/generated/*.json` is committed to the repo, so `npm run dev` / `npm run
build` work immediately after `npm install` without needing network access —
`npm run ingest` is only needed when you want a fresher snapshot.

## Deploying to Vercel

This is a zero-config Next.js app.

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. Go to [vercel.com/new](https://vercel.com/new), import the repo, and click
   **Deploy** — no environment variables or extra configuration required.
3. Every push to the deployed branch redeploys automatically.

To keep listings fresh without touching Vercel at all, this repo includes a
GitHub Actions workflow (`.github/workflows/refresh-data.yml`) that runs
`npm run ingest` on a schedule and commits the refreshed JSON — Vercel then
picks up the change on its own via its normal git integration. It's disabled
by default until you push this repo to GitHub with Actions enabled.

## Adding a new county's data

1. Confirm the source is an **official government** portal (city, county,
   state, or their contracted platform — e.g. Socrata, ArcGIS/Esri, CKAN) and
   note its dataset page + API endpoint.
2. Add an `ingestXxx()` function in `scripts/ingest.ts` that fetches from the
   API and maps its raw fields into the shared `Listing` shape in
   `lib/types.ts`. Look up the county's 5-digit FIPS code in
   `data/generated/counties.json`.
3. Add the new `DataSource` metadata (name, agency, dataset URL, license) next
   to the listings it produces.
4. Run `npm run ingest` and confirm the new county's page
   (`/<state-slug>/<county-slug>`) shows real listings.

## Project structure

```
app/                Next.js App Router pages
  page.tsx           Home
  states/            /states — all states index
  [state]/            /:state — counties in a state
  [state]/[county]/   /:state/:county — listings in a county
  listing/[id]/       /listing/:id — single listing detail
  search/             /search — cross-county search
  data-sources/        /data-sources — full source transparency page
  about/               /about — project description & disclaimer
components/          Shared UI (header, footer, search box, listing card…)
lib/                 Data access, types, formatting helpers
scripts/
  build-counties.ts   Census raw file -> data/generated/counties.json
  ingest.ts           Government APIs -> data/generated/listings.json etc.
data/raw/             Committed raw Census reference file
data/generated/       Committed build output the app reads/imports
```

## Disclaimer

CountyLedger is an independent project, not affiliated with any government
agency or with dplistings.com. It reproduces public records for informational
purposes only — this is not legal, financial, or investment advice. Always
verify current status with the county treasurer, assessor, or court before
acting on anything shown here.
