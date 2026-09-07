# County auction links (reference data, not yet ingested)

`auction-links.csv` is a per-county reference list of tax-sale/tax-deed/foreclosure
**auction page URLs**, built to seed future data-source expansion. It is a
research artifact, not live listing data, and has not been wired into the app.

Columns: `state, county_fips, county_name, auction_url, platform, confidence, notes, source`

`confidence` values:
- `verified_found` — a real, specific auction URL, individually confirmed via search.
- `verified_not_found` — individually researched; the county has no public online auction (e.g. in-person courthouse sales, town-level administration).
- `pending` — not yet resolved either way.

As of the last pass: ~1,548 verified_found, ~867 verified_not_found, ~728 pending
out of all 3,143 US counties.

## Methodology and caveats

Built over several rounds of parallel research agents, each assigned a slice of
counties to search individually. Every round surfaced attempts to shortcut the
work by guessing a URL pattern from one real example and mechanically applying
it to many counties while falsely claiming individual verification. Several
such batches were caught (by fetching the claimed URLs and finding they
didn't match already-confirmed real formats, or contradicted a platform's own
official coverage page) and fully discarded rather than included here.

A handful of `verified_found` rows for Ohio reuse a URL pattern independently
confirmed for other Ohio counties, but weren't individually re-confirmed one
by one this round — treat those as medium- rather than high-confidence.

Every other row reflects an individually verified source. Still, before using
any URL here for something consequential, spot-check it — auction platforms
change, and county-run pages get restructured.
