import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const skip = (page - 1) * limit;

  const [draws, total] = await Promise.all([
    prisma.draw.findMany({
      where: { userId: (session.user as { id: string }).id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        sourceType: true,
        sourceName: true,
        participantCount: true,
        winnerCount: true,
        winners: true,
        createdAt: true,
      },
    }),
    prisma.draw.count({ where: { userId: (session.user as { id: string }).id } }),
  ]);

  return NextResponse.json({ draws, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { sourceType, sourceName, participantCount, winnerCount, participants, winners } = body;

  if (!sourceType || !participantCount || !winnerCount || !participants || !winners) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const winnersArr: string[] = Array.isArray(winners) ? winners : [];
  if (new Set(winnersArr).size !== winnersArr.length) {
    return NextResponse.json({ error: "Duplicate winners detected" }, { status: 400 });
  }

  const draw = await prisma.draw.create({
    data: {
      userId: (session.user as { id: string }).id,
      sourceType,
      sourceName: sourceName ?? null,
      participantCount,
      winnerCount,
      participants: JSON.stringify(participants),
      winners: JSON.stringify(winners),
    },
  });

  return NextResponse.json(draw, { status: 201 });
}
