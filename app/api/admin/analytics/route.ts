import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PERIOD_DAYS: Record<string, number | null> = {
  today: 0,
  "7d": 7,
  "30d": 30,
  "1y": 365,
  all: null,
};

function periodStart(period: string): Date | undefined {
  const days = PERIOD_DAYS[period];
  if (days === undefined || days === null) return undefined;
  const d = new Date();
  if (days === 0) {
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const period = req.nextUrl.searchParams.get("period") ?? "all";
  const since = periodStart(period);
  const where = since ? { createdAt: { gte: since } } : {};

  const [total, byCountry] = await Promise.all([
    prisma.pageView.count({ where }),
    prisma.pageView.groupBy({
      by: ["country"],
      where,
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
    }),
  ]);

  return NextResponse.json({
    total,
    byCountry: byCountry.map((r) => ({
      country: r.country,
      count: r._count.country,
    })),
  });
}
