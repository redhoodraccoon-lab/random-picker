import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country") ?? null;
  await prisma.pageView.create({ data: { country } });
  return NextResponse.json({ ok: true });
}
