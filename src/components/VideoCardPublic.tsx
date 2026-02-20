"use client";

import type { Video } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

export function VideoCardPublic({
  video,
  formattedDate,
  bountyAfter,
  isNewest = false,
}: {
  video: Video;
  formattedDate: string;
  bountyAfter?: number;
  isNewest?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        {/* Title and Date */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold leading-tight text-[#333] transition-colors duration-300 group-hover:text-[#B79953] dark:text-[#e0e0e0] dark:group-hover:text-[#B79953]">
            {video.title || "Untitled"}
          </h3>
          <p className="text-base text-[#666] transition-colors duration-300 dark:text-[#b0b0b0]">
            {formattedDate}
          </p>
        </div>

        {/* Result Section */}
        <div className="flex flex-col gap-3">
          {isNewest ? (
            <>
              <button
                type="button"
                onClick={() => setRevealed(!revealed)}
                className="w-full rounded-lg border-2 border-dashed border-[#B79953]/50 bg-[#B79953]/10 px-4 py-2.5 text-sm font-medium text-[#B79953] transition-all duration-200 hover:border-[#B79953] hover:bg-[#B79953]/20 dark:border-[#B79953]/50 dark:bg-[#B79953]/10 dark:hover:border-[#B79953] dark:hover:bg-[#B79953]/20"
              >
                {revealed ? "Hide spoiler" : "Spoiler"}
              </button>
              {revealed && (
                <div className="flex flex-col gap-2.5">
                  {video.hadAce ? (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#B79953]/20 px-3 py-1.5 text-sm font-medium text-[#B79953]">
                        🎯 Ace
                        {video.winnerName ? ` — ${video.winnerName}` : ""}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#666]/15 px-3 py-1.5 text-sm font-medium text-[#666] transition-colors dark:bg-white/10 dark:text-[#b0b0b0]">
                        No ace
                      </span>
                    </div>
                  )}
                  {bountyAfter !== undefined && (
                    <p className="text-sm font-semibold text-[#B79953]">
                      Bounty after: <span className="text-base">${bountyAfter}</span>
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              {video.hadAce ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#B79953]/20 px-3 py-1.5 text-sm font-medium text-[#B79953]">
                    🎯 Ace
                    {video.winnerName ? ` — ${video.winnerName}` : ""}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#666]/15 px-3 py-1.5 text-sm font-medium text-[#666] transition-colors dark:bg-white/10 dark:text-[#b0b0b0]">
                    No ace
                  </span>
                </div>
              )}
              {bountyAfter !== undefined && (
                <p className="text-sm font-semibold text-[#B79953]">
                  Bounty after: <span className="text-base">${bountyAfter}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Watch Link */}
      {video.url && (
        <div className="mt-auto pt-2 border-t border-[#e5e5e5] dark:border-white/10">
          <Link
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B79953] transition-colors hover:text-[#a08648] hover:underline dark:hover:text-[#c9b068]"
          >
            <span>Watch video</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </>
  );
}
