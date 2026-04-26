import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const [draws, totalWinners, totalParticipants] = await Promise.all([
    prisma.draw.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
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
    prisma.draw.aggregate({ where: { userId }, _sum: { winnerCount: true } }),
    prisma.draw.aggregate({ where: { userId }, _sum: { participantCount: true } }),
  ]);

  const lastDraw = draws[0] ?? null;

  const stats = {
    totalDraws: draws.length,
    totalWinners: totalWinners._sum.winnerCount ?? 0,
    totalParticipants: totalParticipants._sum.participantCount ?? 0,
    lastDrawAt: lastDraw?.createdAt?.toISOString() ?? null,
  };

  const serialized = draws.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }));

  return <DashboardClient initialDraws={serialized} stats={stats} />;
}
