import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function isRecordNotFound(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
}

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
    const { publishedAt, title, url, hadAce, winnerName, includeInBounty, category } = body;
    const data: {
      publishedAt?: Date;
      title?: string | null;
      url?: string | null;
      hadAce?: boolean;
      winnerName?: string | null;
      includeInBounty?: boolean;
      category?: string | null;
    } = {};
    if (publishedAt != null) data.publishedAt = new Date(publishedAt);
    if (title !== undefined) data.title = title ?? null;
    if (url !== undefined) data.url = url ?? null;
    if (hadAce !== undefined) data.hadAce = Boolean(hadAce);
    if (winnerName !== undefined) {
      let aceForWinner = hadAce !== undefined ? Boolean(hadAce) : undefined;
      if (aceForWinner === undefined) {
        const existing = await prisma.video.findUnique({
          where: { id },
          select: { hadAce: true },
        });
        if (!existing) {
          return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }
        aceForWinner = existing.hadAce;
      }
      data.winnerName = aceForWinner && winnerName ? String(winnerName) : null;
    }
    if (includeInBounty !== undefined) data.includeInBounty = Boolean(includeInBounty);
    if (category !== undefined)
      data.category = category && String(category).trim() ? String(category).trim() : null;
    const video = await prisma.video.update({
      where: { id },
      data,
    });
    return NextResponse.json(video);
  } catch (e) {
    if (isRecordNotFound(e)) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
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
    if (isRecordNotFound(e)) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
