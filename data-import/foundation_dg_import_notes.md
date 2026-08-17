# Foundation DG Import Prep

Source: /Users/justinhobbs/Documents/Codex/2026-08-17/ca/work/foundation_dg_since_may_availability.tsv

Generated candidate CSV: /Users/justinhobbs/Documents/Development/acebounty/data-import/foundation_dg_videos_since_may_import_candidates.csv

## Assumptions

- Rows with `access = Members-only` were excluded because you said you deleted members videos.
- Rows with `dayName = Friday` were excluded because you said you deleted Friday releases.
- Remaining rows are set to `includeInBounty = true`.
- `publishedAt` uses the YouTube release date at 5:00 PM Eastern Time. For May-August 2026 this is EDT, exported as 21:00 UTC.

## Counts

- Source rows since 2026-05-01: 62
- Excluded members-only or Friday rows: 17
- Candidate import rows: 45

## Category Counts

- Disc Golf Challenge: 14
- (blank): 28
- Monthly Match: 3

## Missing Before A Successful Import

- `hadAce` is set to `false` for every row per import default.
- `winnerName` is blank for every row and only needs to be filled later if `hadAce` is changed to `true`.
- Confirm whether 5:00 PM Eastern Time is acceptable for all rows.
- Confirm whether blank `category` values are acceptable. The app allows null, but category filtering/display may be less useful.
- Confirm the target database: local SQLite `dev.db` or production Turso. Production import needs `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
- Confirm duplicate policy, especially whether URL should be treated as unique even though the current schema does not enforce it.
