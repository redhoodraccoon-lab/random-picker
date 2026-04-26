import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const draw = await prisma.draw.findFirst({
    where: { id, userId: (session.user as { id: string }).id },
  });
  if (!draw) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const winners: string[] = JSON.parse(draw.winners);
  const date = draw.createdAt.toISOString().slice(0, 10);

  const rows = ["Rank,Winner", ...winners.map((w, i) => `${i + 1},"${w.replace(/"/g, '""')}"`)];
  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="drawlot-winners-${date}.csv"`,
    },
  });
}
