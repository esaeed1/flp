// Converts the raw US Census Bureau county reference file into clean JSON
// used by the site's State -> County browsing structure.
//
// Source (real, official): US Census Bureau, "American National Standards
// Institute (ANSI) Codes for Counties" national file.
// https://www2.census.gov/geo/docs/reference/codes/national_county.txt
// Fetched into data/raw/national_county.csv
//
// Format: State,State ANSI,County ANSI,County Name,ANSI Cl
import fs from "node:fs";
import path from "node:path";
import { STATES } from "../lib/states";

const RAW_PATH = path.join(__dirname, "..", "data", "raw", "national_county.csv");
const OUT_PATH = path.join(__dirname, "..", "data", "generated", "counties.json");

const STATE_ABBRS = new Set(STATES.map((s) => s.abbr));

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface CountyRef {
  stateAbbr: string;
  stateFips: string;
  countyFips: string; // 5-digit combined state+county FIPS
  name: string;
  slug: string;
}

function main() {
  const raw = fs.readFileSync(RAW_PATH, "utf-8");
  const lines = raw.trim().split("\n");
  const header = lines[0];
  if (!header.toLowerCase().startsWith("state,")) {
    throw new Error("Unexpected header in national_county.csv: " + header);
  }

  const counties: CountyRef[] = [];
  for (const line of lines.slice(1)) {
    const [stateAbbr, stateAnsi, countyAnsi, countyName] = line.split(",");
    if (!stateAbbr || !STATE_ABBRS.has(stateAbbr)) continue; // 50 states + DC only
    const countyFips = `${stateAnsi}${countyAnsi}`;
    counties.push({
      stateAbbr,
      stateFips: stateAnsi,
      countyFips,
      name: countyName.trim(),
      slug: slugify(countyName.trim()),
    });
  }

  // Sanity check: verify slug uniqueness within each state (routing depends on it)
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const c of counties) {
    const key = `${c.stateAbbr}/${c.slug}`;
    if (seen.has(key)) dupes.push(key);
    seen.add(key);
  }
  if (dupes.length) {
    throw new Error("Duplicate state/county slugs found: " + dupes.join(", "));
  }

  counties.sort((a, b) => a.stateAbbr.localeCompare(b.stateAbbr) || a.name.localeCompare(b.name));

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(counties, null, 2));

  console.log(`Wrote ${counties.length} counties across ${STATE_ABBRS.size} states/DC to ${OUT_PATH}`);
}

main();
