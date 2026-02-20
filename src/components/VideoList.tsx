import type { Video } from "@prisma/client";
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
}: {
  videos: Video[];
  showBountyAfter?: Map<string, number>;
  admin?: boolean;
}) {
  if (videos.length === 0) {
    return (
      <p className="text-[#666] transition-colors duration-300 dark:text-[#b0b0b0]">
        No videos yet. Check back after the next upload.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v, index) => {
        const isNewest = index === 0;
        return (
          <li key={v.id}>
            <div className={`group flex h-full flex-col rounded-xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(183,153,83,0.3)] ${
              isNewest 
                ? "border-2 border-[#B79953]" 
                : "border-2 border-transparent"
            } ${!isNewest ? "hover:border-[#B79953]" : ""} video-card`}>
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
                  isNewest={isNewest}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
