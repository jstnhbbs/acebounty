const BOUNTY_PER_VIDEO = 10;

export type VideoForBounty = {
  id: string;
  publishedAt: Date;
  hadAce: boolean;
  winnerName: string | null;
};

function getYear(d: Date): number {
  return new Date(d).getFullYear();
}

function filterByYear(videos: VideoForBounty[], year: number): VideoForBounty[] {
  return videos.filter((v) => getYear(v.publishedAt) === year);
}

/**
 * Current bounty = $10 × (number of videos since last ace).
 * If year is provided, only videos from that calendar year are counted.
 * Bounty resets at the end of each calendar year.
 */
export function getCurrentBounty(
  videos: VideoForBounty[],
  year?: number
): number {
  const list = year != null ? filterByYear(videos, year) : [...videos];
  const ordered = list.sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );
  let count = 0;
  for (let i = ordered.length - 1; i >= 0; i--) {
    count++;
    if (ordered[i].hadAce) break;
  }
  return count * BOUNTY_PER_VIDEO;
}

/**
 * Returns bounty after each video (0 if ace, else previous + 10) for display.
 * Computed per calendar year: each video's "bounty after" is within its year only.
 */
export function getBountyAfterEachVideo(
  videos: VideoForBounty[]
): Map<string, number> {
  const byYear = new Map<number, VideoForBounty[]>();
  for (const v of videos) {
    const y = getYear(v.publishedAt);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(v);
  }
  const result = new Map<string, number>();
  for (const [, yearVideos] of byYear) {
    const ordered = [...yearVideos].sort(
      (a, b) =>
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );
    let running = 0;
    for (const v of ordered) {
      if (v.hadAce) {
        result.set(v.id, 0);
        running = 0;
      } else {
        running += BOUNTY_PER_VIDEO;
        result.set(v.id, running);
      }
    }
  }
  return result;
}

export { BOUNTY_PER_VIDEO };
