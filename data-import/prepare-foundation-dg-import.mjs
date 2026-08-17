import fs from "node:fs/promises";
import path from "node:path";

const sourcePath =
  "/Users/justinhobbs/Documents/Codex/2026-08-17/ca/work/foundation_dg_since_may_availability.tsv";
const outputDir = path.resolve("data-import");
const csvPath = path.join(outputDir, "foundation_dg_videos_since_may_import_candidates.csv");
const notesPath = path.join(outputDir, "foundation_dg_import_notes.md");

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const validCategories = new Set([
  "",
  "Monthly Match",
  "Course Conquest",
  "Disc Golf Challenge",
  "Disc Golf Punishment",
  "Break 69 Challenge",
  "All-Star Event",
  "Creators Cup",
]);

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function inferCategory(title) {
  const normalized = title.toLowerCase();
  for (const category of validCategories) {
    if (category && normalized.includes(category.toLowerCase())) {
      return category;
    }
  }
  return "";
}

function parseDate(dateRaw) {
  const year = Number(dateRaw.slice(0, 4));
  const month = Number(dateRaw.slice(4, 6));
  const day = Number(dateRaw.slice(6, 8));
  // Source dates are May-August 2026, when Eastern Time is EDT (UTC-4).
  // 5:00 PM ET is therefore 21:00 UTC.
  return new Date(Date.UTC(year, month - 1, day, 21, 0, 0));
}

const raw = await fs.readFile(sourcePath, "utf8");
const sourceRows = raw
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const [dateRaw, title, url, availability] = line.split("\t");
    const publishedDate = parseDate(dateRaw);
    const dayName = dayNames[publishedDate.getUTCDay()];
    const isFriday = dayName === "Friday";
    const isMembersOnly = availability === "subscriber_only";
    const category = inferCategory(title);
    if (!validCategories.has(category)) {
      throw new Error(`Invalid category inferred for "${title}": ${category}`);
    }
    return {
      publishedAt: publishedDate.toISOString(),
      title,
      url,
      hadAce: "false",
      winnerName: "",
      includeInBounty: "true",
      category,
      dayName,
      access: isMembersOnly ? "Members-only" : "Public",
      importStatus: "ready_for_import",
      importNotes: "hadAce defaulted to false; update manually later if this video includes an ace.",
      excludedBySpreadsheetCleanup: isFriday || isMembersOnly,
    };
  });

const importRows = sourceRows.filter((row) => !row.excludedBySpreadsheetCleanup);

const headers = [
  "publishedAt",
  "title",
  "url",
  "hadAce",
  "winnerName",
  "includeInBounty",
  "category",
  "dayName",
  "access",
  "importStatus",
  "importNotes",
];

const csv = [
  headers.join(","),
  ...importRows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
].join("\n");

const categoryCounts = new Map();
for (const row of importRows) {
  const label = row.category || "(blank)";
  categoryCounts.set(label, (categoryCounts.get(label) ?? 0) + 1);
}

const notes = `# Foundation DG Import Prep

Source: ${sourcePath}

Generated candidate CSV: ${csvPath}

## Assumptions

- Rows with \`access = Members-only\` were excluded because you said you deleted members videos.
- Rows with \`dayName = Friday\` were excluded because you said you deleted Friday releases.
- Remaining rows are set to \`includeInBounty = true\`.
- \`publishedAt\` uses the YouTube release date at 5:00 PM Eastern Time. For May-August 2026 this is EDT, exported as 21:00 UTC.

## Counts

- Source rows since 2026-05-01: ${sourceRows.length}
- Excluded members-only or Friday rows: ${sourceRows.length - importRows.length}
- Candidate import rows: ${importRows.length}

## Category Counts

${[...categoryCounts.entries()].map(([category, count]) => `- ${category}: ${count}`).join("\n")}

## Missing Before A Successful Import

- \`hadAce\` is set to \`false\` for every row per import default.
- \`winnerName\` is blank for every row and only needs to be filled later if \`hadAce\` is changed to \`true\`.
- Confirm whether 5:00 PM Eastern Time is acceptable for all rows.
- Confirm whether blank \`category\` values are acceptable. The app allows null, but category filtering/display may be less useful.
- Confirm the target database: local SQLite \`dev.db\` or production Turso. Production import needs \`TURSO_DATABASE_URL\` and \`TURSO_AUTH_TOKEN\`.
- Confirm duplicate policy, especially whether URL should be treated as unique even though the current schema does not enforce it.
`;

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(csvPath, `${csv}\n`, "utf8");
await fs.writeFile(notesPath, notes, "utf8");
console.log(JSON.stringify({ csvPath, notesPath, sourceRows: sourceRows.length, importRows: importRows.length }));
