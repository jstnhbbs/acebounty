import "dotenv/config";
import fs from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
});

const since = new Date("2026-05-01T00:00:00.000Z");
const csv = await fs.readFile("data-import/foundation_dg_videos_since_may_import_candidates.csv", "utf8");
const candidateUrls = [...csv.matchAll(/https:\/\/www\.youtube\.com\/watch\?v=[^,\n\r"]+/g)].map(
  (match) => match[0]
);
const importedVideos = await prisma.video.findMany({
  where: { url: { in: candidateUrls } },
  select: {
    publishedAt: true,
    url: true,
    hadAce: true,
    winnerName: true,
    includeInBounty: true,
    category: true,
  },
});
const videos = await prisma.video.findMany({
  where: { publishedAt: { gte: since } },
  orderBy: { publishedAt: "desc" },
  select: {
    publishedAt: true,
    title: true,
    url: true,
    hadAce: true,
    winnerName: true,
    includeInBounty: true,
    category: true,
  },
});

const categoryCounts = {};
for (const video of videos) {
  const key = video.category || "(blank)";
  categoryCounts[key] = (categoryCounts[key] ?? 0) + 1;
}

console.log(
  JSON.stringify(
    {
      sinceMayRowsInTurso: videos.length,
      candidateUrls: candidateUrls.length,
      matchedCandidateUrlsInTurso: importedVideos.length,
      importedHadAceTrue: importedVideos.filter((video) => video.hadAce).length,
      importedWinnerNames: importedVideos.filter((video) => video.winnerName).length,
      importedIncludedInBounty: importedVideos.filter((video) => video.includeInBounty).length,
      importedBadTimes: importedVideos.filter(
        (video) => video.publishedAt.toISOString().slice(11) !== "21:00:00.000Z"
      ).length,
      hadAceTrueSinceMay: videos.filter((video) => video.hadAce).length,
      winnerNamesSinceMay: videos.filter((video) => video.winnerName).length,
      includedSinceMay: videos.filter((video) => video.includeInBounty).length,
      categoryCounts,
      newest: videos.slice(0, 5).map((video) => ({
        publishedAt: video.publishedAt,
        title: video.title,
        hadAce: video.hadAce,
        winnerName: video.winnerName,
        category: video.category,
      })),
    },
    null,
    2
  )
);

await prisma.$disconnect();
