import { prisma } from "@/lib/db";
import { getSpoilerCutoffMs } from "@/lib/spoiler";
import { HistoryWithYearFilter } from "@/components/HistoryWithYearFilter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Video history | Ace Bounty",
  description: "Full list of videos and ace results for the disc golf channel.",
};

export default async function HistoryPage() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
  });
  const spoilerCutoffMs = getSpoilerCutoffMs();

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-start justify-center px-8 py-8">
      <div className="w-full max-w-[1200px]">
        <h1 className="mb-6 text-3xl font-bold text-foreground transition-colors duration-300 [text-shadow:none] dark:[text-shadow:2px_2px_4px_rgba(0,0,0,0.2)]">
          Video history
        </h1>
        <HistoryWithYearFilter videos={videos} spoilerCutoffMs={spoilerCutoffMs} />
      </div>
    </main>
  );
}
