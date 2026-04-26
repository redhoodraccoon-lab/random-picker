import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [total, byCountry] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.groupBy({
      by: ["country"],
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
