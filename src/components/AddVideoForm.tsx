"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddVideoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const publishedAt = formData.get("publishedAt") as string;
    const title = (formData.get("title") as string) || undefined;
    const url = (formData.get("url") as string) || undefined;
    const hadAce = formData.get("hadAce") === "yes";
    const winnerName = (formData.get("winnerName") as string) || undefined;

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishedAt: publishedAt || new Date().toISOString().slice(0, 10),
          title: title || null,
          url: url || null,
          hadAce,
          winnerName: hadAce ? winnerName || null : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add video");
      }
      form.reset();
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
            Date
          </label>
          <input
            type="date"
            name="publishedAt"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full rounded border border-[#999] bg-white px-3 py-2 text-[#333] focus:border-[#B79953] focus:outline-none focus:ring-1 focus:ring-[#B79953] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-[#B79953] dark:focus:ring-[#B79953]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#333] transition-colors dark:text-zinc-300">
            Title (optional)
          </label>
          <input
            type="text"
            name="title"
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
          name="url"
          placeholder="https://youtube.com/..."
          className="w-full rounded border border-[#999] bg-white px-3 py-2 text-[#333] placeholder:text-[#666] focus:border-[#B79953] focus:outline-none focus:ring-1 focus:ring-[#B79953] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#B79953] dark:focus:ring-[#B79953]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Ace?</legend>
          <label className="flex items-center gap-1.5 text-sm text-[#333] transition-colors dark:text-zinc-300">
            <input type="radio" name="hadAce" value="no" defaultChecked />
            No ace
          </label>
          <label className="flex items-center gap-1.5 text-sm text-[#333] transition-colors dark:text-zinc-300">
            <input type="radio" name="hadAce" value="yes" />
            Ace
          </label>
        </fieldset>
        <div>
          <label className="mr-2 text-sm font-medium text-[#333] transition-colors dark:text-zinc-300">
            Winner name (if ace)
          </label>
          <input
            type="text"
            name="winnerName"
            placeholder="Name"
            className="rounded border border-[#999] bg-white px-3 py-2 text-[#333] placeholder:text-[#666] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#B79953] px-4 py-2 font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add video"}
        </button>
      </div>
    </form>
  );
}
