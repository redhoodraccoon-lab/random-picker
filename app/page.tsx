import Link from "next/link";
import {
  Shuffle,
  Trophy,
  FileSpreadsheet,
  ShieldCheck,
  History,
  ImageDown,
} from "lucide-react";

export const metadata = { title: "Drawlot — Official Random Draw Tool by ArenaPlus" };

const features = [
  {
    icon: FileSpreadsheet,
    title: "Any format",
    desc: "Drop a CSV, XLSX, or TXT file — or just paste names. Every row and cell is parsed automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Cryptographically random",
    desc: "Every pick uses crypto.getRandomValues(). No Math.random(), no predictable sequences.",
  },
  {
    icon: History,
    title: "Full draw history",
    desc: "Every draw is saved with a timestamp, participant count, and winner list you can search and export.",
  },
  {
    icon: ImageDown,
    title: "Winner poster",
    desc: "Export a branded 1080 × 1350 JPEG poster ready to post on social — one click after the draw.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#09090E] text-white overflow-hidden">

      {/* Background glows — absolute so they scroll with content */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-100"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,107,26,0.14) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(ellipse at bottom right, rgba(255,107,26,0.08) 0%, transparent 70%)" }}
      />

      {/* ── Nav ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B1A]/20 border border-[#FF6B1A]/30 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-[#FF6B1A]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-white">Drawlot</span>
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">by ArenaPlus</span>
          </div>
        </div>

        <Link
          href="/login"
          className="px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-sm font-semibold text-zinc-300 hover:text-white transition-colors duration-150"
        >
          Sign in
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20 md:pt-36 md:pb-28">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FF6B1A]/30 bg-[#FF6B1A]/10 text-[#FF8F3F] text-[11px] font-bold tracking-[0.16em] uppercase mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A]" style={{ boxShadow: "0 0 6px #FF6B1A" }} />
          Official Draw Tool
        </div>

        {/* Headline */}
        <h1
          className="uppercase leading-[0.9] tracking-tight mb-6"
          style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: "clamp(54px, 9vw, 110px)",
          }}
        >
          <span className="text-white">Draw </span>
          <span style={{ WebkitTextStroke: "2px #FF6B1A", color: "transparent" }}>
            Winners.
          </span>
          <br />
          <span className="text-white">Make it </span>
          <span
            style={{
              background: "linear-gradient(130deg, #FFB366 0%, #FF6B1A 50%, #FF3D00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Official.
          </span>
        </h1>

        {/* Sub */}
        <p className="text-lg text-zinc-400 max-w-md leading-relaxed mb-10">
          Upload your participant list, set the prize count, and run a tamper-proof random draw. Every result is logged and exportable.
        </p>

        {/* Primary CTA */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#FF6B1A] hover:bg-[#FF8F3F] text-white text-sm font-bold tracking-wide transition-colors duration-150"
          style={{ boxShadow: "0 8px 32px -8px rgba(255,107,26,0.55)" }}
        >
          <Shuffle className="w-4 h-4" />
          Start Drawing
        </Link>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-12 text-[11px] text-zinc-600 font-medium uppercase tracking-wider">
          {["Up to 100 winners", "CSV · XLSX · TXT", "Cryptographically secure", "Instant poster export"].map((label, i, arr) => (
            <span key={label} className="flex items-center gap-2">
              {i > 0 && <span className="hidden sm:inline w-px h-3 bg-zinc-800" />}
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[#FF6B1A]/40 transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF6B1A]/10 border border-[#FF6B1A]/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#FF6B1A]" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA banner ── */}
      <section className="relative z-10 border-t border-zinc-800/60">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center px-6 py-20">
          <h2
            className="uppercase leading-tight mb-4 text-white"
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: "clamp(30px, 5vw, 52px)",
            }}
          >
            Ready to run your{" "}
            <span
              style={{
                background: "linear-gradient(130deg, #FFB366 0%, #FF6B1A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              first draw?
            </span>
          </h2>
          <p className="text-zinc-500 text-base mb-8">
            Sign in and start picking winners in under a minute.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#FF6B1A] hover:bg-[#FF8F3F] text-white text-sm font-bold tracking-wide transition-colors duration-150"
            style={{ boxShadow: "0 8px 32px -8px rgba(255,107,26,0.5)" }}
          >
            <Trophy className="w-4 h-4" />
            Go to Drawlot
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-zinc-800/40 px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-700">
        <span className="font-semibold tracking-wide uppercase">Drawlot · By Ketso.Co</span>
        <span>Results are final. Winners will be contacted via official channels.</span>
      </footer>

    </div>
  );
}
