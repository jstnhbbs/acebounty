import { prisma } from "@/lib/db";
import { getBountyAfterEachVideo } from "@/lib/bounty";
import { VideoList } from "@/components/VideoList";
import { AddVideoForm } from "@/components/AddVideoForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
  });
  const bountyAfter = getBountyAfterEachVideo(videos);

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-start justify-center px-8 py-8">
      <div className="w-full max-w-[1200px]">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#333] transition-colors duration-300 [text-shadow:none] dark:text-[#e0e0e0] dark:[text-shadow:2px_2px_4px_rgba(0,0,0,0.2)]">
            Admin
          </h1>
          <Link
            href="/"
            className="font-medium text-[#B79953] hover:underline"
          >
            View site
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-[#333] transition-colors duration-300 dark:text-[#e0e0e0]">
            Add video
          </h2>
          <div className="rounded-xl border-2 border-transparent bg-white p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 dark:bg-[#2d2d44] dark:shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
            <AddVideoForm />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-[#333] transition-colors duration-300 dark:text-[#e0e0e0]">
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
