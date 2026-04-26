"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { pickWinners, pickWeightedWinners } from "@/lib/randomize";
import { renderPoster } from "./PosterRenderer";
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakSlider,
  TweakToggle,
  TweakColor,
} from "./TweaksPanel";

// -------- Tweak defaults --------
const TWEAK_DEFAULTS = {
  accent: "#FF6B1A",
  background: "#0A0A0F",
  ink: "#FFFFFF",
  animationSpeed: 60,
  animationDuration: 2.8,
  showConfetti: true,
};

// -------- File parsing --------
function parseCSV(text: string): string[] {
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (cur !== "" || row.length) { row.push(cur); rows.push(row); row = []; cur = ""; }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else cur += c;
    }
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  const flat: string[] = [];
  for (const r of rows) {
    for (const cell of r) {
      const v = (cell || "").trim();
      if (v) flat.push(v);
    }
  }
  return flat;
}

function parseTXT(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

async function parseXLSX(file: File): Promise<string[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const flat: string[] = [];
  for (const r of rows) {
    for (const cell of r) {
      const v = String(cell ?? "").trim();
      if (v) flat.push(v);
    }
  }
  return flat;
}

async function parseFile(file: File): Promise<string[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return parseXLSX(file);
  const text = await file.text();
  if (name.endsWith(".csv")) return parseCSV(text);
  return parseTXT(text);
}

// -------- Icons --------
const Icon = {
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v13M6 9l6-6 6 6M4 21h16"/>
    </svg>
  ),
  File: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <path d="M14 3v6h6"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6l-12 12"/>
    </svg>
  ),
  Shuffle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
    </svg>
  ),
  Sparkle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 13.8 9.2 21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8z"/>
    </svg>
  ),
  Reset: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v13M6 11l6 6 6-6M4 21h16"/>
    </svg>
  ),
  Trophy: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v4a5 5 0 0 1-10 0z"/>
      <path d="M17 4h3v2a3 3 0 0 1-3 3M7 4H4v2a3 3 0 0 0 3 3"/>
      <path d="M10 14h4M12 14v4M8 20h8"/>
    </svg>
  ),
};

// -------- Confetti --------
interface ConfettiPiece {
  x: number; y: number; vx: number; vy: number; g: number;
  rot: number; vr: number; w: number; h: number; c: string; life: number;
}

function Confetti({ active, accent }: { active: boolean; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const colors = [accent, "#1A1613", "#F5F0E6", "#D4A574", "#2E5B3F"];
    const pieces: ConfettiPiece[] = Array.from({ length: 140 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 200,
      y: H / 2 - 20,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 16 - 6,
      g: 0.35 + Math.random() * 0.2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      c: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
    }));
    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of pieces) {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
        if (p.y < H + 40) alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive > 0) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [active, accent]);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}
    />
  );
}

// -------- Slot Reel --------
interface SlotReelProps {
  names: string[];
  finalName: string;
  duration: number;
  speed: number;
  running: boolean;
  onDone?: () => void;
  delay?: number;
  itemHeight?: number;
  windowHeight?: number;
}

function SlotReel({
  names, finalName, duration, speed, running, onDone,
  delay = 0, itemHeight = 72, windowHeight = 216,
}: SlotReelProps) {
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);
  const ITEM_H = itemHeight;
  const WIN_H = windowHeight;

  const strip = useMemo(() => {
    if (!running) return [];
    const n = Math.max(80, Math.floor(duration * speed / 6) + 50);
    const s: string[] = [];
    for (let i = 0; i < n; i++) {
      s.push(names[Math.floor(Math.random() * names.length)]);
    }
    s.push(finalName);
    s.push(names[Math.floor(Math.random() * names.length)]);
    s.push(names[Math.floor(Math.random() * names.length)]);
    return s;
  }, [running, names, finalName, duration, speed]);

  const winnerIdx = strip.length ? strip.length - 3 : 0;

  useEffect(() => {
    if (!running) { setOffset(0); setDone(false); return; }
    setDone(false);
    const startAt = performance.now() + delay;
    const totalDist = winnerIdx * ITEM_H + ITEM_H / 2 - WIN_H / 2;
    let raf: number;
    const tick = (t: number) => {
      const elapsed = t - startAt;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const prog = Math.min(1, elapsed / (duration * 1000));
      const eased = 1 - Math.pow(1 - prog, 4);
      setOffset(eased * totalDist);
      if (prog < 1) raf = requestAnimationFrame(tick);
      else { setDone(true); onDone?.(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, strip, duration, delay, winnerIdx, ITEM_H, WIN_H, onDone]);

  return (
    <div className={`reel-window ${done ? "is-done" : ""}`} style={{ height: WIN_H }}>
      <div className="reel-strip" style={{ transform: `translateY(${-offset}px)` }}>
        {strip.map((n, i) => (
          <div key={i} className={`reel-item ${done && i === winnerIdx ? "is-winner" : ""}`} style={{ height: ITEM_H }}>
            {n}
          </div>
        ))}
      </div>
      <div className="reel-mask reel-mask--top" />
      <div className="reel-mask reel-mask--bottom" />
      <div className="reel-indicator" style={{ height: ITEM_H }} />
    </div>
  );
}

// -------- Main App --------
export function PickerApp() {
  const [tweaks, setTweaks] = useTweaks(TWEAK_DEFAULTS);
  const [names, setNames] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [phase, setPhase] = useState<"input" | "picking" | "revealed">("input");
  const [winners, setWinners] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [parseError, setParseError] = useState("");
  const [finishedCount, setFinishedCount] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle("picker-expanded", isFullscreen);
    return () => { document.documentElement.classList.remove("picker-expanded"); };
  }, [isFullscreen]);

  const uniqueNames = useMemo(() => Array.from(new Set(names)), [names]);
  const hasDuplicates = uniqueNames.length < names.length;
  const dupCount = names.length - uniqueNames.length;

  const canPick = names.length > 0 && winnerCount >= 1 && winnerCount <= uniqueNames.length;

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", tweaks.accent);
    document.documentElement.style.setProperty("--bg", tweaks.background);
    document.documentElement.style.setProperty("--ink", tweaks.ink);
  }, [tweaks.accent, tweaks.background, tweaks.ink]);

  useEffect(() => {
    if (fileName) return;
    const list = textInput.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
    setNames(list);
  }, [textInput, fileName]);

  const handleFile = async (file: File) => {
    setParseError("");
    try {
      const list = await parseFile(file);
      if (!list.length) { setParseError("No entries found in file."); return; }
      setNames(list);
      setFileName(file.name);
      setTextInput(list.join("\n"));
    } catch (e) {
      setParseError((e as Error).message || "Could not parse file.");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = () => {
    setFileName(""); setTextInput(""); setNames([]); setParseError("");
  };

  const saveDrawToDB = useCallback(async (
    winnersList: string[],
    allNames: string[],
    fname: string,
  ) => {
    try {
      await fetch("/api/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: fname ? "file" : "manual",
          sourceName: fname || null,
          participants: allNames,
          winners: winnersList,
          winnerCount: winnersList.length,
          participantCount: allNames.length,
        }),
      });
    } catch {
      // DB save is best-effort; draw already happened
    }
  }, []);

  const pick = () => {
    if (!canPick) return;
    savedRef.current = false;
    const picks = allowDuplicates
      ? pickWeightedWinners(names, winnerCount)
      : pickWinners(uniqueNames, winnerCount);
    setWinners(picks);
    setFinishedCount(0);
    setPhase("picking");
  };

  const onReelDone = useCallback(() => {
    setFinishedCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (phase !== "picking" || finishedCount === 0 || finishedCount < winners.length) return;
    if (!savedRef.current) {
      savedRef.current = true;
      saveDrawToDB(winners, names, fileName);
    }
    const tid = setTimeout(() => {
      setPhase("revealed");
      if (tweaks.showConfetti) setConfettiKey((k) => k + 1);
    }, 1800);
    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedCount]);

  const reset = () => { setPhase("input"); setWinners([]); setFinishedCount(0); };
  const repick = () => pick();

  const setCountSafe = (v: string | number) => {
    const n = Math.max(1, Math.min(100, Math.floor(Number(v) || 1)));
    setWinnerCount(n);
  };

  const downloadPoster = async (winnersList: string[]) => {
    setExporting(true);
    try {
      const blob = await renderPoster(winnersList, { accent: tweaks.accent });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `drawlot-winners-${new Date().toISOString().slice(0, 10)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
      alert("Could not generate poster.");
    }
    setExporting(false);
  };

  return (
    <div className="app" data-phase={phase}>
      {/* Header */}
      <header className="topbar">
        <div className="brand">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,107,26,0.18)", border: "1px solid rgba(255,107,26,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(255,107,26,0.25)", flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Drawlot.Com</div>
              <div style={{ fontSize: 9, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>By Ketso.Co</div>
            </div>
          </div>
        </div>
        <div className="topbar-right">
          {names.length > 0 && (
            <div className="pill">
              <Icon.Sparkle /> <span>{names.length.toLocaleString()} entries</span>
            </div>
          )}
          <button
            className="topbar-fs-btn"
            onClick={() => setIsFullscreen((v) => !v)}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* Input phase */}
      {phase === "input" && (
        <main className="stage stage--input">
          <div className="hero">
            <div className="hero-kicker">Official Random Picker</div>
            <h1 className="hero-title">
              Draw <em>winners</em>.<br />Make it official.
            </h1>
            <p className="hero-sub">
              Upload your list, set the prize count, and let the reels decide. Export a shareable poster when the draw is done.
            </p>
          </div>

          <div className="form-grid">
            {/* Upload card */}
            <section className="card card--upload">
              <div className="card-label"><span className="num">01</span> Source</div>
              <div
                className={`dropzone ${dragging ? "is-dragging" : ""} ${fileName ? "has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                {!fileName && (
                  <>
                    <div className="dz-icon"><Icon.Upload /></div>
                    <div className="dz-title">
                      Drop a file or{" "}
                      <label className="dz-browse">
                        browse
                        <input
                          type="file"
                          accept=".csv,.txt,.xlsx,.xls"
                          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <div className="dz-hint">.csv · .txt · .xlsx — one name per line or cell</div>
                  </>
                )}
                {fileName && (
                  <div className="file-chip">
                    <Icon.File />
                    <span className="file-name">{fileName}</span>
                    <span className="file-count">{names.length} entries</span>
                    <button className="icon-btn" onClick={clearFile} aria-label="Remove file">
                      <Icon.X />
                    </button>
                  </div>
                )}
              </div>
              {parseError && <div className="err">{parseError}</div>}

              {hasDuplicates && (
                <div className="dup-warning">
                  <span>⚠ {dupCount} duplicate{dupCount !== 1 ? "s" : ""} detected</span>
                  <button
                    className={`dup-btn ${!allowDuplicates ? "is-active" : ""}`}
                    onClick={() => setAllowDuplicates(false)}
                  >
                    Deduplicate
                  </button>
                  <button
                    className={`dup-btn ${allowDuplicates ? "is-active" : ""}`}
                    onClick={() => setAllowDuplicates(true)}
                  >
                    Weighted odds
                  </button>
                </div>
              )}

              <div className="divider"><span>or paste directly</span></div>

              <textarea
                className="textarea"
                placeholder={"Ada Lovelace\nAlan Turing\nGrace Hopper\nKatherine Johnson\n..."}
                value={textInput}
                onChange={(e) => { setFileName(""); setTextInput(e.target.value); }}
                spellCheck={false}
              />
            </section>

            {/* Config card */}
            <section className="card card--config">
              <div className="card-label"><span className="num">02</span> Draw</div>

              <div className="field">
                <label>How many winners?</label>
                <div className="count-row">
                  <button className="count-btn" onClick={() => setCountSafe(winnerCount - 1)} disabled={winnerCount <= 1}>–</button>
                  <input
                    className="count-input"
                    type="number"
                    min={1}
                    max={100}
                    value={winnerCount}
                    onChange={(e) => setCountSafe(e.target.value)}
                  />
                  <button className="count-btn" onClick={() => setCountSafe(winnerCount + 1)} disabled={winnerCount >= 100}>+</button>
                </div>
                <div className="count-chips">
                  {[1, 3, 5, 10, 25].map((n) => (
                    <button key={n} className={`chip ${winnerCount === n ? "is-active" : ""}`} onClick={() => setCountSafe(n)}>{n}</button>
                  ))}
                </div>
                <div className="range-label">
                  <span>1</span>
                  <input
                    type="range"
                    min={1}
                    max={Math.min(100, Math.max(1, uniqueNames.length || 100))}
                    value={Math.min(winnerCount, Math.min(100, Math.max(1, uniqueNames.length || 100)))}
                    onChange={(e) => setCountSafe(e.target.value)}
                    className="slider"
                  />
                  <span>{Math.min(100, Math.max(1, uniqueNames.length || 100))}</span>
                </div>
              </div>

              <div className="summary">
                <div className="summary-row">
                  <span>Entries</span>
                  <b>{(allowDuplicates ? names.length : uniqueNames.length).toLocaleString() || "—"}</b>
                </div>
                <div className="summary-row">
                  <span>Winners</span>
                  <b>{winnerCount}</b>
                </div>
                <div className="summary-row">
                  <span>Odds per entry</span>
                  <b>
                    {names.length
                      ? `${((winnerCount / (allowDuplicates ? names.length : uniqueNames.length)) * 100).toFixed(2)}%`
                      : "—"}
                  </b>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={pick}
                disabled={!canPick}
                title={!canPick ? "Add entries and set a valid count" : "Draw"}
              >
                <Icon.Shuffle />
                <span>Random pick</span>
              </button>
              {names.length > 0 && winnerCount > uniqueNames.length && (
                <div className="err">Only {uniqueNames.length} unique entries — lower the winner count.</div>
              )}
            </section>
          </div>

          {/* Preview */}
          {names.length > 0 && (
            <section className="preview">
              <div className="preview-head">
                <span>Preview</span>
                <span className="preview-count">Showing {Math.min(24, names.length)} of {names.length}</span>
              </div>
              <div className="preview-grid">
                {names.slice(0, 24).map((n, i) => (
                  <div key={i} className="preview-item">
                    <span className="preview-idx">{String(i + 1).padStart(2, "0")}</span>
                    <span className="preview-name">{n}</span>
                  </div>
                ))}
                {names.length > 24 && <div className="preview-more">+{names.length - 24} more</div>}
              </div>
            </section>
          )}
        </main>
      )}

      {/* Picking phase */}
      {phase === "picking" && (
        <main className="stage stage--picking">
          <div className="picking-head">
            <div className="eyebrow">
              Drawing {winners.length} {winners.length === 1 ? "winner" : "winners"} from {names.length}…
            </div>
          </div>

          <div className="mega-row">
            <div className="mega-counter-card">
              <div className="mega-counter-nums">
                <span key={finishedCount} className="mega-counter-current">
                  {String(Math.min(finishedCount + 1, winners.length)).padStart(2, "0")}
                </span>
                <span className="mega-counter-slash">/</span>
                <span className="mega-counter-total">{String(winners.length).padStart(2, "0")}</span>
              </div>
              <div className="mega-counter-label">Picking</div>
            </div>
            <div className="mega-reel">
              {finishedCount < winners.length && (
                <SlotReel
                  key={finishedCount}
                  names={names}
                  finalName={winners[finishedCount]}
                  duration={tweaks.animationDuration}
                  speed={tweaks.animationSpeed}
                  running={true}
                  onDone={onReelDone}
                  delay={finishedCount === 0 ? 200 : 400}
                  itemHeight={120}
                  windowHeight={120}
                />
              )}
              {finishedCount >= winners.length && (
                <div className="single-reel-locked">{winners[winners.length - 1]}</div>
              )}
            </div>
          </div>

          {finishedCount > 0 && (
            <div className="live-chosen">
              <ol className="live-grid">
                {winners.slice(0, finishedCount).map((w, i) => (
                  <li key={i} className="live-card" style={{ animationDelay: `${i * 50}ms` }}>
                    <span className="live-card-rank">{String(i + 1).padStart(2, "0")}</span>
                    <span className="live-card-name">{w}</span>
                    <span className="live-card-mark">+</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </main>
      )}

      {/* Revealed phase */}
      {phase === "revealed" && (
        <main className="stage stage--revealed">
          <div className="revealed-head">
            <div className="eyebrow eyebrow--accent">
              <Icon.Trophy />
              <span>Official Results</span>
            </div>
            <h2 className="revealed-title">
              {winners.length === 1 ? "The Winner" : `${winners.length} Winners`}
            </h2>
            <div className="revealed-sub">
              Drawn from <b>{names.length.toLocaleString()}</b> entries ·{" "}
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </div>
          </div>

          <ol className={`winners winners--${winners.length <= 1 ? "one" : winners.length <= 3 ? "few" : "many"}`}>
            {winners.map((w, i) => (
              <li key={i} className="winner" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="winner-rank">{String(i + 1).padStart(2, "0")}</span>
                <span className="winner-name">{w}</span>
                <span className="winner-mark"><Icon.Sparkle /></span>
              </li>
            ))}
          </ol>

          <div className="revealed-actions">
            <button className="btn-secondary" onClick={reset}><Icon.Reset /><span>New draw</span></button>
            <button className="btn-secondary" onClick={repick}><Icon.Shuffle /><span>Pick again</span></button>
            <button className="btn-primary" onClick={() => downloadPoster(winners)} disabled={exporting}>
              <Icon.Download /><span>{exporting ? "Generating…" : "Download as JPG"}</span>
            </button>
          </div>
        </main>
      )}

      {tweaks.showConfetti && phase === "revealed" && (
        <Confetti key={confettiKey} active={true} accent={tweaks.accent} />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Color">
          <TweakColor label="Accent" value={tweaks.accent} onChange={(v) => setTweaks({ accent: v })} />
          <TweakColor label="Background" value={tweaks.background} onChange={(v) => setTweaks({ background: v })} />
          <TweakColor label="Ink" value={tweaks.ink} onChange={(v) => setTweaks({ ink: v })} />
        </TweakSection>
        <TweakSection label="Animation">
          <TweakSlider label="Spin duration (s)" value={tweaks.animationDuration} min={1} max={8} step={0.2} onChange={(v) => setTweaks({ animationDuration: v })} />
          <TweakSlider label="Scroll speed" value={tweaks.animationSpeed} min={20} max={200} step={5} onChange={(v) => setTweaks({ animationSpeed: v })} />
          <TweakToggle label="Confetti on reveal" value={tweaks.showConfetti} onChange={(v) => setTweaks({ showConfetti: v })} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}
