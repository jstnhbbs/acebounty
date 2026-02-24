import { prisma } from "@/lib/db";
import { getBountyAfterEachVideo } from "@/lib/bounty";
import { isIncludedInBounty } from "@/lib/video";
import { VideoList } from "@/components/VideoList";
import { AddVideoForm } from "@/components/AddVideoForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
  });
  const videosForBounty = videos.filter(isIncludedInBounty);
  const bountyAfter = getBountyAfterEachVideo(videosForBounty);

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-start justify-center px-8 py-8">
      <div className="w-full max-w-[1200px]">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground transition-colors duration-300 [text-shadow:none] dark:[text-shadow:2px_2px_4px_rgba(0,0,0,0.2)]">
            Admin
          </h1>
          <Link
            href="/"
            className="font-medium text-accent hover:underline"
          >
            View site
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground dark:text-foreground">
            Add video
          </h2>
          <div className="rounded-xl border-2 border-transparent bg-white p-6 shadow-sm transition-all duration-300 dark:bg-card-bg-dark dark:shadow-card-dark">
            <AddVideoForm />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground dark:text-foreground">
            All videos
          </h2>
          <VideoList
            videos={videos}
            showBountyAfter={bountyAfter}
            spoilerCutoffMs={Date.now()}
            admin
          />
        </section>
      </div>
    </main>
  );
}
