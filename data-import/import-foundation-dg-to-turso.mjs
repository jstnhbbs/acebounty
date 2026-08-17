import "dotenv/config";
import fs from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const csvPath = "data-import/foundation_dg_videos_since_may_import_candidates.csv";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...body] = rows.filter((r) => r.some((cell) => cell !== ""));
  return body.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required for this import.");
}

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: tursoUrl, authToken: tursoToken }),
});

const csv = await fs.readFile(csvPath, "utf8");
const rows = parseCsv(csv);

const invalid = rows.filter((row) => row.importStatus !== "ready_for_import");
if (invalid.length) {
  throw new Error(`Refusing import: ${invalid.length} rows are not marked ready_for_import.`);
}

const existing = await prisma.video.findMany({
  where: { url: { in: rows.map((row) => row.url) } },
  select: { url: true },
});
const existingUrls = new Set(existing.map((row) => row.url).filter(Boolean));
const toCreate = rows.filter((row) => !existingUrls.has(row.url));

let created = 0;
for (const row of toCreate) {
  await prisma.video.create({
    data: {
      publishedAt: new Date(row.publishedAt),
      title: row.title || null,
      url: row.url || null,
      hadAce: row.hadAce === "true",
      winnerName: row.winnerName || null,
      includeInBounty: row.includeInBounty !== "false",
      category: row.category || null,
    },
  });
  created += 1;
}

await prisma.$disconnect();

console.log(
  JSON.stringify(
    {
      csvRows: rows.length,
      skippedExistingUrls: existingUrls.size,
      created,
    },
    null,
    2
  )
);
