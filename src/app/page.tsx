import { prisma } from "@/lib/db";
import { getCurrentBounty, getBountyAfterEachVideo } from "@/lib/bounty";
import { BountyDisplay } from "@/components/BountyDisplay";
import { VideoList } from "@/components/VideoList";

const RECENT_COUNT = 10;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
  });
  const currentYear = new Date().getFullYear();
  const videosThisYear = videos.filter(
    (v: (typeof videos)[number]) =>
      new Date(v.publishedAt).getFullYear() === currentYear
  );
  const recent = videosThisYear.slice(0, RECENT_COUNT);
  const currentBounty = getCurrentBounty(videos, currentYear);
  const bountyAfter = getBountyAfterEachVideo(videos);

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-start justify-center px-8 py-8">
      <div className="w-full max-w-[1200px]">
        <h1 className="text-center text-4xl font-bold transition-colors duration-300 sm:text-5xl page-title">
          Ace Bounty
        </h1>
        <p className="mt-2 text-center text-xl text-[#666] transition-colors duration-300 dark:text-[rgba(255,255,255,0.8)]">
          This year&apos;s bounty tracker
        </p>
        <div className="flex justify-center mt-8">
          <div className="w-full max-w-xl">
            <BountyDisplay amount={currentBounty} year={currentYear} />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-[#666] transition-colors duration-300 dark:text-[#b0b0b0]">
          Bounty grows $10 per video with no ace. 
          <br />
          Hit an ace to win the pot and reset. 
          <br />
          Resets at the end of each calendar year.
        </p>
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold text-[#333] transition-colors duration-300 [text-shadow:none] dark:text-[#e0e0e0] dark:[text-shadow:2px_2px_4px_rgba(0,0,0,0.2)]">
            Recent videos ({currentYear})
          </h2>
          <VideoList videos={recent} showBountyAfter={bountyAfter} />
        </section>
      </div>
    </main>
  );
}
