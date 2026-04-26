import { Trophy } from "lucide-react";

type Size = "sm" | "md" | "lg";

const cfg: Record<Size, { box: string; icon: string; title: string; sub: string }> = {
  sm: { box: "w-8 h-8 rounded-lg",  icon: "w-4 h-4", title: "text-sm",  sub: "text-[10px]" },
  md: { box: "w-10 h-10 rounded-xl", icon: "w-5 h-5", title: "text-base", sub: "text-[11px]" },
  lg: { box: "w-14 h-14 rounded-2xl", icon: "w-7 h-7", title: "text-xl",  sub: "text-xs" },
};

export function DrawlotMark({ size = "md" }: { size?: Size }) {
  const s = cfg[size];
  return (
    <div className="flex items-center gap-3">
      <div className={`${s.box} bg-[#FF6B1A]/20 border border-[#FF6B1A]/30 flex items-center justify-center shrink-0`}
           style={{ boxShadow: "0 4px 20px rgba(255,107,26,0.25)" }}>
        <Trophy className={`${s.icon} text-[#FF6B1A]`} />
      </div>
      <div>
        <div className={`${s.title} font-bold text-white leading-none`}>Drawlot.Com</div>
        <div className={`${s.sub} text-zinc-500 uppercase tracking-widest mt-0.5`}>By Ketso.Co</div>
      </div>
    </div>
  );
}
