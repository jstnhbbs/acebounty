"use client";

import type { Video } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function VideoRow({
  video,
  bountyAfter,
  formattedDate,
}: {
  video: Video;
  bountyAfter?: number;
  formattedDate: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this video?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        {/* Title and Date */}
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-lg leading-tight text-[#333] transition-colors duration-300 dark:text-[#e0e0e0]">
            {video.title || "Untitled"}
          </h3>
          <p className="text-sm text-[#666] transition-colors duration-300 dark:text-[#b0b0b0]">
            {formattedDate}
          </p>
        </div>

        {/* Result Section */}
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

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#e5e5e5] dark:border-white/10">
          <Link
            href={`/admin/videos/${video.id}/edit`}
            className="text-sm font-medium text-[#B79953] transition-colors hover:text-[#a08648] hover:underline dark:hover:text-[#c9b068]"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-medium text-red-500 transition-colors hover:text-red-600 hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          {video.url && (
            <Link
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#B79953] transition-colors hover:text-[#a08648] hover:underline dark:hover:text-[#c9b068]"
            >
              Watch
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
