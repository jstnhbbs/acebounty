import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json(videos);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { publishedAt, title, url, hadAce, winnerName } = body;
    if (publishedAt == null || hadAce == null) {
      return NextResponse.json(
        { error: "publishedAt and hadAce are required" },
        { status: 400 }
      );
    }
    const video = await prisma.video.create({
      data: {
        publishedAt: new Date(publishedAt),
        title: title ?? null,
        url: url ?? null,
        hadAce: Boolean(hadAce),
        winnerName: hadAce && winnerName ? String(winnerName) : null,
      },
    });
    return NextResponse.json(video);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
