import { NextResponse } from "next/server";
import { syncFoundationYoutubeVideos } from "@/lib/youtube-sync";

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
  const dryRun = searchParams.get("dryRun") === "1";

  try {
    const result = await syncFoundationYoutubeVideos({ dryRun });
    return NextResponse.json({ skipped: false, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to sync YouTube videos" },
      { status: 500 }
    );
  }
}
