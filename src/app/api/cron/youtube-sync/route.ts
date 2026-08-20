import { NextResponse } from "next/server";
import { syncFoundationYoutubeVideos } from "@/lib/youtube-sync";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "1";
  const requestInfo = {
    path: "/api/cron/youtube-sync",
    at: new Date().toISOString(),
    userAgent: request.headers.get("user-agent"),
    dryRun,
    deploymentCommit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  };

  if (!isAuthorized(request)) {
    console.warn("youtube-sync unauthorized", requestInfo);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncFoundationYoutubeVideos({ dryRun });
    console.log("youtube-sync completed", { ...requestInfo, result });
    return NextResponse.json({ skipped: false, ...requestInfo, ...result });
  } catch (e) {
    console.error("youtube-sync failed", requestInfo, e);
    return NextResponse.json(
      { error: "Failed to sync YouTube videos" },
      { status: 500 }
    );
  }
}
