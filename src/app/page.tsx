import { prisma } from "@/lib/db";
import {
  getCurrentBounty,
  getBountyAfterEachVideo,
  getMostRecentAceWinner,
} from "@/lib/bounty";
import { isIncludedInBounty } from "@/lib/video";
import { BountyDisplay } from "@/components/BountyDisplay";
import { VideoList } from "@/components/VideoList";

const RECENT_COUNT = 6;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const spoilerCutoffMs = Date.now();
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
  });
  const currentYear = new Date().getFullYear();
  const recent = videos.slice(0, RECENT_COUNT);
  const videosForBounty = videos.filter(isIncludedInBounty);
  const currentBounty = getCurrentBounty(videosForBounty, currentYear);
  const bountyAfter = getBountyAfterEachVideo(videosForBounty);
  const lastWinner = getMostRecentAceWinner(videosForBounty, currentYear);

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-start justify-center px-8 py-8">
      <div className="w-full max-w-[1200px]">
        <h1 className="text-center text-4xl font-bold transition-colors duration-300 sm:text-5xl page-title">
          Ace Bounty
        </h1>
        <p className="mt-2 text-center text-xl text-foreground-muted transition-colors duration-300 dark:text-foreground-muted">
          This year&apos;s bounty tracker
        </p>
        <div className="flex justify-center mt-8">
          <div className="w-full max-w-xl">
            <BountyDisplay amount={currentBounty} year={currentYear} />
          </div>
        </div>
        {lastWinner && (
          <p className="mt-3 text-center text-sm text-foreground-muted transition-colors duration-300 dark:text-foreground-muted">
            Last winner: {lastWinner.winnerName || "Anonymous"} — ${lastWinner.amount}
          </p>
        )}
        <p className="mt-4 text-center text-sm text-foreground-muted transition-colors duration-300 dark:text-foreground-muted">
          Bounty grows $10 per video with no ace. 
          <br />
          Hit an ace to win the pot and reset. 
          <br />
          Resets at the end of each calendar year.
        </p>
        <section className="mt-12">
          <h2 className="section-heading mb-6 text-2xl">
            Recent Videos
          </h2>
          <VideoList
            videos={recent}
            showBountyAfter={bountyAfter}
            spoilerCutoffMs={spoilerCutoffMs}
          />
        </section>
      </div>
    </main>
  );
}
