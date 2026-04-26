"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy, Users, ListChecks, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Stats {
  totalDraws: number;
  totalWinners: number;
  totalParticipants: number;
  lastDrawAt: string | null;
}

function AnimatedCount({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * value));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
}

const cards = [
  { key: "totalDraws", label: "Total Draws", icon: Trophy, color: "text-brand", glow: "bg-brand/10 border-brand/20" },
  { key: "totalWinners", label: "Winners Picked", icon: Trophy, color: "text-emerald-400", glow: "bg-emerald-900/20 border-emerald-800/20" },
  { key: "totalParticipants", label: "Participants Processed", icon: Users, color: "text-blue-400", glow: "bg-blue-900/20 border-blue-800/20" },
  { key: "lastDrawAt", label: "Last Draw", icon: Clock, color: "text-zinc-400", glow: "bg-zinc-800/40 border-zinc-700/40" },
] as const;

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color, glow }) => (
        <div
          key={key}
          className={`relative rounded-xl border p-5 bg-zinc-900 ${glow} overflow-hidden`}
        >
          <div className={`absolute inset-0 ${glow.split(" ")[0]} opacity-40 blur-3xl pointer-events-none`} />
          <div className="relative">
            <div className={`w-9 h-9 rounded-lg ${glow} border flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-2xl font-bold ${color} font-mono leading-none mb-1`}>
              {key === "lastDrawAt" ? (
                stats.lastDrawAt
                  ? formatDistanceToNow(new Date(stats.lastDrawAt), { addSuffix: true })
                  : "—"
              ) : (
                <AnimatedCount value={stats[key] as number} />
              )}
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
