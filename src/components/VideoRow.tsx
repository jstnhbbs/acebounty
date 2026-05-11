"use client";

import type { Video } from "@/lib/db";
import { isIncludedInBounty } from "@/lib/video";
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
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    if (!confirm("Delete this video?")) return;
    setDeleteError("");
    setDeleting(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setDeleteError(
        typeof data.error === "string" ? data.error : "Failed to delete video"
      );
    } catch {
      setDeleteError("Failed to delete video");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        {/* Title, Date, Category */}
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-lg leading-tight text-foreground">
            {video.title || "Untitled"}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-foreground-muted">
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
          {isIncludedInBounty(video) && bountyAfter !== undefined ? (
            <p className="bounty-after">
              Bounty after: <span>${bountyAfter}</span>
            </p>
          ) : !isIncludedInBounty(video) ? (
            <p className="bounty-excluded">Not counted in bounty</p>
          ) : null}
        </div>

        {/* Actions */}
        {deleteError ? (
          <p className="form-error mb-2 text-sm">{deleteError}</p>
        ) : null}
        <div className="card-actions">
          <Link href={`/admin/videos/${video.id}/edit`} className="card-link">
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
              className="card-link"
            >
              Watch
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
