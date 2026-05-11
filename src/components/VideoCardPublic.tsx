"use client";

import type { Video } from "@/lib/db";
import { isIncludedInBounty } from "@/lib/video";
import Link from "next/link";
import { useState } from "react";

const SPOILER_WINDOW_MS = 24 * 60 * 60 * 1000; // 1 day

export function VideoCardPublic({
  video,
  formattedDate,
  bountyAfter,
  spoilerCutoffMs,
}: {
  video: Video;
  formattedDate: string;
  bountyAfter?: number;
  spoilerCutoffMs: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const publishedAtMs = new Date(video.publishedAt).getTime();
  const showSpoilerButton =
    spoilerCutoffMs - publishedAtMs <= SPOILER_WINDOW_MS;
  const includeInBounty = isIncludedInBounty(video);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        {/* Title, Date, Category */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold leading-tight text-foreground transition-colors duration-300 group-hover:text-accent">
            {video.title || "Untitled"}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base text-foreground-muted transition-colors duration-300">
              {formattedDate}
            </p>
            {video.category && (
              <span className="rounded-full bg-foreground-muted/15 px-2.5 py-0.5 text-sm font-medium text-foreground-muted">
                {video.category}
              </span>
            )}
          </div>
        </div>

        {/* Result Section */}
        <div className="flex flex-col gap-3">
          {showSpoilerButton ? (
            <>
              <button
                type="button"
                onClick={() => setRevealed(!revealed)}
                className="spoiler-btn"
              >
                {revealed ? "Hide spoiler" : "Spoiler"}
              </button>
              {revealed && (
                <div className="flex flex-col gap-2.5">
                  {video.hadAce ? (
                    <div className="flex items-center gap-2">
                      <span className="badge badge-ace">
                        🎯 Ace
                        {video.winnerName ? ` — ${video.winnerName}` : ""}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="badge badge-no-ace">No ace</span>
                    </div>
                  )}
                  {includeInBounty && bountyAfter !== undefined ? (
                    <p className="bounty-after">
                      Bounty after: <span>${bountyAfter}</span>
                    </p>
                  ) : !includeInBounty ? (
                    <p className="bounty-excluded">Not counted in bounty</p>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              {video.hadAce ? (
                <div className="flex items-center gap-2">
                  <span className="badge badge-ace">
                    🎯 Ace
                    {video.winnerName ? ` — ${video.winnerName}` : ""}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="badge badge-no-ace">No ace</span>
                </div>
              )}
              {includeInBounty && bountyAfter !== undefined ? (
                <p className="bounty-after">
                  Bounty after: <span>${bountyAfter}</span>
                </p>
              ) : !includeInBounty ? (
                <p className="bounty-excluded">Not counted in bounty</p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Watch Link */}
      {video.url && (
        <div className="mt-auto pt-2 border-t border-border-light dark:border-white/10">
          <Link
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-link"
          >
            <span>Watch video</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </>
  );
}
