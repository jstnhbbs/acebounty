"use client";

import type { Video } from "@/lib/db";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

function toDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishedAt,
          title: title || null,
          url: url || null,
          hadAce,
          winnerName: hadAce ? winnerName || null : null,
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
      {error && (
        <p className="rounded bg-red-100 p-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#333] transition-colors dark:text-zinc-300">
            Date & time
          </label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            required
            className="w-full rounded border border-[#999] bg-white px-3 py-2 text-[#333] focus:border-[#B79953] focus:outline-none focus:ring-1 focus:ring-[#B79953] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-[#B79953] dark:focus:ring-[#B79953]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#333] transition-colors dark:text-zinc-300">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title"
            className="w-full rounded border border-[#999] bg-white px-3 py-2 text-[#333] placeholder:text-[#666] focus:border-[#B79953] focus:outline-none focus:ring-1 focus:ring-[#B79953] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#B79953] dark:focus:ring-[#B79953]"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[#333] transition-colors dark:text-zinc-300">
          URL (optional)
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/..."
          className="w-full rounded border border-[#999] bg-white px-3 py-2 text-[#333] placeholder:text-[#666] focus:border-[#B79953] focus:outline-none focus:ring-1 focus:ring-[#B79953] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#B79953] dark:focus:ring-[#B79953]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Ace?</legend>
          <label className="flex items-center gap-1.5 text-sm text-[#333] transition-colors dark:text-zinc-300">
            <input
              type="radio"
              name="hadAce"
              checked={!hadAce}
              onChange={() => setHadAce(false)}
            />
            No ace
          </label>
          <label className="flex items-center gap-1.5 text-sm text-[#333] transition-colors dark:text-zinc-300">
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
          <label className="mr-2 text-sm font-medium text-[#333] transition-colors dark:text-zinc-300">
            Winner name (if ace)
          </label>
          <input
            type="text"
            value={winnerName}
            onChange={(e) => setWinnerName(e.target.value)}
            placeholder="Name"
            className="rounded border border-[#999] bg-white px-3 py-2 text-[#333] placeholder:text-[#666] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Link
          href="/admin"
          className="rounded border-2 border-[#B79953]/50 px-4 py-2 text-sm font-medium text-[#B79953] transition-colors hover:bg-[#B79953]/10 dark:hover:bg-[#B79953]/20"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#B79953] px-4 py-2 font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
