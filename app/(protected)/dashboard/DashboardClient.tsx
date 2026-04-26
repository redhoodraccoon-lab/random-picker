"use client";

import { useState } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DrawHistoryTable } from "@/components/dashboard/DrawHistoryTable";

interface Draw {
  id: string;
  sourceType: string;
  sourceName: string | null;
  participantCount: number;
  winnerCount: number;
  winners: string;
  createdAt: string;
}

interface Stats {
  totalDraws: number;
  totalWinners: number;
  totalParticipants: number;
  lastDrawAt: string | null;
}

interface Props {
  initialDraws: Draw[];
  stats: Stats;
}

export function DashboardClient({ initialDraws, stats: initialStats }: Props) {
  const [draws, setDraws] = useState(initialDraws);
  const [stats] = useState(initialStats);

  const handleDelete = (id: string) => {
    setDraws((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Draw history and statistics</p>
        </div>
        <Link
          href="/picker"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:opacity-90 transition shadow-[0_4px_20px_-6px_rgba(255,107,26,0.5)]"
        >
          <Shuffle className="w-4 h-4" />
          New Draw
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 md:mb-8">
        <StatsCards stats={stats} />
      </div>

      {/* History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Draw History</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{draws.length} total draws</p>
          </div>
        </div>
        <DrawHistoryTable draws={draws} onDelete={handleDelete} />
      </div>
    </div>
  );
}
