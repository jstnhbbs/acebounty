import type { Video } from "@/lib/db";
import { VideoCardPublic } from "./VideoCardPublic";
import { VideoRow } from "./VideoRow";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function VideoList({
  videos,
  showBountyAfter,
  admin,
  spoilerCutoffMs,
}: {
  videos: Video[];
  showBountyAfter?: Map<string, number>;
  admin?: boolean;
  spoilerCutoffMs: number;
}) {
  if (videos.length === 0) {
    return (
      <p className="text-foreground-muted transition-colors duration-300">
        No videos yet. Check back after the next upload.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v) => (
          <li key={v.id}>
            <div className="group flex h-full flex-col rounded-xl border-2 border-transparent p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-accent hover:shadow-accent video-card">
              {admin ? (
                <VideoRow
                  video={v}
                  bountyAfter={showBountyAfter?.get(v.id)}
                  formattedDate={formatDate(v.publishedAt)}
                />
              ) : (
                <VideoCardPublic
                  video={v}
                  formattedDate={formatDate(v.publishedAt)}
                  bountyAfter={showBountyAfter?.get(v.id)}
                  spoilerCutoffMs={spoilerCutoffMs}
                />
              )}
            </div>
          </li>
        ))}
    </ul>
  );
}
