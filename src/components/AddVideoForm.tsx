"use client";

import { toDatetimeLocal } from "@/lib/format";
import { VIDEO_CATEGORIES } from "@/lib/video-categories";
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
    const publishedAt = (formData.get("publishedAt") as string)?.trim();
    const title = (formData.get("title") as string) || undefined;
    const url = (formData.get("url") as string) || undefined;
    const hadAce = formData.get("hadAce") === "yes";
    const winnerName = (formData.get("winnerName") as string) || undefined;
    const includeInBounty = formData.get("includeInBounty") === "yes";
    const category = (formData.get("category") as string)?.trim() || null;

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishedAt: (
            publishedAt
              ? new Date(publishedAt)
              : new Date()
          ).toISOString(),
          title: title || null,
          url: url || null,
          hadAce,
          winnerName: hadAce ? winnerName || null : null,
          includeInBounty,
          category,
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
      {error && <p className="form-error">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="form-label">Date & time</label>
          <input
            type="datetime-local"
            name="publishedAt"
            required
            defaultValue={toDatetimeLocal(new Date())}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Title (optional)</label>
          <input
            type="text"
            name="title"
            placeholder="Video title"
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Category</label>
          <select name="category" className="form-input" aria-label="Video category">
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
          name="url"
          placeholder="https://youtube.com/..."
          className="form-input"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Ace?</legend>
          <label className="form-label-inline">
            <input type="radio" name="hadAce" value="no" defaultChecked />
            No ace
          </label>
          <label className="form-label-inline">
            <input type="radio" name="hadAce" value="yes" />
            Ace
          </label>
        </fieldset>
        <div>
          <label className="form-label">Winner (if ace)</label>
          <input
            type="text"
            name="winnerName"
            placeholder="Name"
            className="form-input form-input-sm mt-1"
          />
        </div>
        <label className="form-label-inline">
          <input
            type="checkbox"
            name="includeInBounty"
            value="yes"
            defaultChecked
            className="rounded border-border text-accent focus:ring-accent dark:border-zinc-600 dark:bg-zinc-800"
          />
          Include in bounty
        </label>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Adding…" : "Add video"}
        </button>
      </div>
    </form>
  );
}
