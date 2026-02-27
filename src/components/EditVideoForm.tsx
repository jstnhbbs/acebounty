"use client";

import type { Video } from "@/lib/db";
import { toDatetimeLocal } from "@/lib/format";
import { isIncludedInBounty } from "@/lib/video";
import { VIDEO_CATEGORIES } from "@/lib/video-categories";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditVideoForm({ video }: { video: Video }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [publishedAt, setPublishedAt] = useState(() =>
    toDatetimeLocal(new Date(video.publishedAt))
  );
  const [title, setTitle] = useState(video.title ?? "");
  const [url, setUrl] = useState(video.url ?? "");
  const [hadAce, setHadAce] = useState(video.hadAce);
  const [winnerName, setWinnerName] = useState(video.winnerName ?? "");
  const [includeInBounty, setIncludeInBounty] = useState(() =>
    isIncludedInBounty(video)
  );
  const [category, setCategory] = useState(video.category ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishedAt: new Date(publishedAt).toISOString(),
          title: title || null,
          url: url || null,
          hadAce,
          winnerName: hadAce ? winnerName || null : null,
          includeInBounty,
          category: category?.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      {error && <p className="form-error">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="form-label">Date & time</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title"
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
            aria-label="Video category"
          >
            {VIDEO_CATEGORIES.map(({ value, label }) => (
              <option key={value || "none"} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">URL (optional)</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/..."
          className="form-input"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Ace?</legend>
          <label className="form-label-inline">
            <input
              type="radio"
              name="hadAce"
              checked={!hadAce}
              onChange={() => setHadAce(false)}
            />
            No ace
          </label>
          <label className="form-label-inline">
            <input
              type="radio"
              name="hadAce"
              checked={hadAce}
              onChange={() => setHadAce(true)}
            />
            Ace
          </label>
        </fieldset>
        <div>
          <label className="form-label">Winner (if ace)</label>
          <input
            type="text"
            value={winnerName}
            onChange={(e) => setWinnerName(e.target.value)}
            placeholder="Name"
            className="form-input form-input-sm mt-1"
          />
        </div>
        <label className="form-label-inline">
          <input
            type="checkbox"
            checked={includeInBounty}
            onChange={(e) => setIncludeInBounty(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent dark:border-zinc-600 dark:bg-zinc-800"
          />
          Include in bounty
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Link href="/admin" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
