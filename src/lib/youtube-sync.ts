import { prisma } from "@/lib/db";
import { VIDEO_CATEGORIES } from "@/lib/video-categories";

const CHANNEL_ID = "UC_p7Tr6a_LWrIFIdhkYFm3A";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const RELEASE_TIME_ZONE = "America/New_York";
const RELEASE_HOUR = 17;

type FeedVideo = {
  title: string;
  url: string;
  videoId: string;
  published: Date;
};

export type YoutubeSyncResult = {
  scanned: number;
  publicCandidates: number;
  skippedFriday: number;
  skippedExisting: number;
  created: number;
  createdUrls: string[];
};

function decodeXml(text: string): string {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function getTag(entry: string, tagName: string): string {
  const match = entry.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`));
  return match ? decodeXml(match[1].trim()) : "";
}

function getLink(entry: string): string {
  const match = entry.match(/<link\b[^>]*href="([^"]+)"/);
  return match ? decodeXml(match[1]) : "";
}

function parseFeed(xml: string): FeedVideo[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return entries
    .map((entry) => {
      const title = getTag(entry, "title");
      const videoId = getTag(entry, "yt:videoId");
      const url = getLink(entry) || `https://www.youtube.com/watch?v=${videoId}`;
      const published = new Date(getTag(entry, "published"));
      return { title, url, videoId, published };
    })
    .filter(
      (video) =>
        video.title &&
        video.videoId &&
        video.url &&
        !Number.isNaN(video.published.getTime())
    );
}

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone);
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return localAsUtc - date.getTime();
}

function zonedTimeToUtc(
  dateParts: { year: number; month: number; day: number; hour: number },
  timeZone: string
): Date {
  const utcGuess = new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day, dateParts.hour)
  );
  const offset = getTimeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offset);
}

function getReleaseDateAtFiveEastern(published: Date): Date {
  const parts = getZonedParts(published, RELEASE_TIME_ZONE);
  return zonedTimeToUtc(
    {
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: RELEASE_HOUR,
    },
    RELEASE_TIME_ZONE
  );
}

function isFridayInEastern(published: Date): boolean {
  const releaseDate = getReleaseDateAtFiveEastern(published);
  const parts = getZonedParts(releaseDate, RELEASE_TIME_ZONE);
  const utcMidday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12));
  const dayName = new Intl.DateTimeFormat("en-US", {
    timeZone: RELEASE_TIME_ZONE,
    weekday: "long",
  }).format(utcMidday);
  return dayName === "Friday";
}

function inferCategory(title: string): string | null {
  const normalized = title.toLowerCase();
  for (const { value } of VIDEO_CATEGORIES) {
    if (value && normalized.includes(value.toLowerCase())) return value;
  }
  return null;
}

export async function syncFoundationYoutubeVideos(): Promise<YoutubeSyncResult> {
  const response = await fetch(FEED_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch YouTube feed: ${response.status}`);
  }

  const videos = parseFeed(await response.text());
  const publicCandidates = videos.filter((video) => !isFridayInEastern(video.published));
  const existing = await prisma.video.findMany({
    where: { url: { in: publicCandidates.map((video) => video.url) } },
    select: { url: true },
  });
  const existingUrls = new Set(existing.map((video) => video.url).filter(Boolean));
  const toCreate = publicCandidates.filter((video) => !existingUrls.has(video.url));

  const createdUrls: string[] = [];
  for (const video of toCreate) {
    await prisma.video.create({
      data: {
        publishedAt: getReleaseDateAtFiveEastern(video.published),
        title: video.title,
        url: video.url,
        hadAce: false,
        winnerName: null,
        includeInBounty: true,
        category: inferCategory(video.title),
      },
    });
    createdUrls.push(video.url);
  }

  return {
    scanned: videos.length,
    publicCandidates: publicCandidates.length,
    skippedFriday: videos.length - publicCandidates.length,
    skippedExisting: existingUrls.size,
    created: createdUrls.length,
    createdUrls,
  };
}

export function isSixPmCentral(date = new Date()): boolean {
  const parts = getZonedParts(date, "America/Chicago");
  return parts.hour === 18;
}
