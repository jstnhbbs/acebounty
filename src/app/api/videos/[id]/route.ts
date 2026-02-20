import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    return NextResponse.json(video);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { publishedAt, title, url, hadAce, winnerName } = body;
    const data: {
      publishedAt?: Date;
      title?: string | null;
      url?: string | null;
      hadAce?: boolean;
      winnerName?: string | null;
    } = {};
    if (publishedAt != null) data.publishedAt = new Date(publishedAt);
    if (title !== undefined) data.title = title ?? null;
    if (url !== undefined) data.url = url ?? null;
    if (hadAce !== undefined) data.hadAce = Boolean(hadAce);
    if (winnerName !== undefined)
      data.winnerName = body.hadAce && winnerName ? String(winnerName) : null;
    const video = await prisma.video.update({
      where: { id },
      data,
    });
    return NextResponse.json(video);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.video.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
