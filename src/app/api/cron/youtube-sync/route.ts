import { NextResponse } from "next/server";
import {
  isFiveThirtyPmEasternWindow,
  syncFoundationYoutubeVideos,
} from "@/lib/youtube-sync";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";
  if (!force && !isFiveThirtyPmEasternWindow()) {
    return NextResponse.json({
      skipped: true,
      reason: "Not within the 5:30-5:44 PM America/New_York sync window",
    });
  }

  try {
    const result = await syncFoundationYoutubeVideos();
    return NextResponse.json({ skipped: false, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to sync YouTube videos" },
      { status: 500 }
    );
  }
}
