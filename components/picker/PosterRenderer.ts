async function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function ensureFont(family: string, weight = 400) {
  if (document.fonts?.load) {
    try { await document.fonts.load(`${weight} 48px "${family}"`); } catch {}
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, base: number, min: number, family: string) {
  let size = base;
  while (size > min) {
    ctx.font = `400 ${size}px "${family}", sans-serif`;
    if (ctx.measureText(text).width <= maxW) break;
    size -= 2;
  }
  return size;
}

function drawSpaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  ctx.save();
  const chs = Array.from(text);
  const widths = chs.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chs.length - 1);
  let cx = x - total / 2;
  for (let i = 0; i < chs.length; i++) {
    ctx.textAlign = "left";
    ctx.fillText(chs[i], cx, y);
    cx += widths[i] + spacing;
  }
  ctx.restore();
}

export async function renderPoster(winners: string[], opts: { accent?: string } = {}): Promise<Blob> {
  const accent = opts.accent ?? "#FF6B1A";
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  await Promise.all([ensureFont("Anton"), ensureFont("Inter", 600), ensureFont("Inter"), ensureFont("JetBrains Mono", 500)]);

  let logo: HTMLImageElement | null = null;
  try { logo = await loadImg("/arena-logo.png"); } catch {}

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0A0A0F"); bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const glow1 = ctx.createRadialGradient(W / 2, -100, 50, W / 2, -100, 900);
  glow1.addColorStop(0, "rgba(255,107,26,0.45)"); glow1.addColorStop(0.5, "rgba(255,107,26,0.15)"); glow1.addColorStop(1, "rgba(255,107,26,0)");
  ctx.fillStyle = glow1; ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W / 2, H + 100, 50, W / 2, H + 100, 700);
  glow2.addColorStop(0, "rgba(255,107,26,0.3)"); glow2.addColorStop(1, "rgba(255,107,26,0)");
  ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, H);

  ctx.save(); ctx.globalAlpha = 0.04; ctx.strokeStyle = "#FFF"; ctx.lineWidth = 1;
  for (let i = -H; i < W + H; i += 22) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); }
  ctx.restore();

  // Frame
  const m = 28;
  ctx.save();
  ctx.strokeStyle = "rgba(255,107,26,0.4)"; ctx.lineWidth = 2;
  roundRect(ctx, m, m, W - m * 2, H - m * 2, 22); ctx.stroke();
  const cL = 60; ctx.strokeStyle = accent; ctx.lineWidth = 4;
  for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]] as [number, number, number, number][]) {
    ctx.beginPath(); ctx.moveTo(x + cL * dx, y); ctx.lineTo(x, y); ctx.lineTo(x, y + cL * dy); ctx.stroke();
  }
  ctx.restore();

  // Logo
  const logoY = 80;
  if (logo) {
    const lH = 150, lW = logo.width * (lH / logo.height);
    ctx.drawImage(logo, (W - lW) / 2, logoY, lW, lH);
  }

  // Divider
  const divY = logoY + 180;
  ctx.save();
  const dg = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
  dg.addColorStop(0, "rgba(255,107,26,0)"); dg.addColorStop(0.5, accent); dg.addColorStop(1, "rgba(255,107,26,0)");
  ctx.strokeStyle = dg; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W * 0.2, divY); ctx.lineTo(W * 0.8, divY); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `700 18px "Inter", sans-serif`; ctx.fillStyle = "#FF8F3F";
  drawSpaced(ctx, "◆ OFFICIAL DRAW RESULTS ◆", W / 2, divY + 36, 2.5);
  ctx.restore();

  // Headline
  const count = winners.length;
  const headline = count === 1 ? "WINNER" : `${count} WINNERS`;
  const headY = divY + 130;
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const hSize = fitText(ctx, headline, W - 160, 160, 60, "Anton");
  ctx.font = `400 ${hSize}px "Anton", sans-serif`;
  const hg = ctx.createLinearGradient(0, headY - hSize / 2, 0, headY + hSize / 2);
  hg.addColorStop(0, "#FFF"); hg.addColorStop(0.6, "#FFB366"); hg.addColorStop(1, accent);
  ctx.fillStyle = hg; ctx.shadowColor = "rgba(255,107,26,0.6)"; ctx.shadowBlur = 30;
  ctx.fillText(headline, W / 2, headY);
  ctx.restore();

  // Winners list
  const listTop = headY + 100, listBottom = H - 180;
  const available = listBottom - listTop;
  const maxRows = count <= 3 ? count : Math.min(count, Math.floor(available / 70) || 1);
  const displayed = winners.slice(0, maxRows);
  let rowH: number, cardPad: number;
  if (count === 1) { rowH = 200; cardPad = 40; }
  else if (count <= 5) { rowH = Math.min(110, available / count); cardPad = 16; }
  else { rowH = Math.min(74, available / maxRows); cardPad = 10; }

  const cardX = 90, cardW = W - 180;
  let y = listTop;

  if (count === 1) {
    const h = 240, cy = listTop + 10;
    ctx.save();
    const halo = ctx.createRadialGradient(W / 2, cy + h / 2, 50, W / 2, cy + h / 2, 400);
    halo.addColorStop(0, "rgba(255,107,26,0.35)"); halo.addColorStop(1, "rgba(255,107,26,0)");
    ctx.fillStyle = halo; ctx.fillRect(0, cy - 60, W, h + 120);
    const cg = ctx.createLinearGradient(0, cy, 0, cy + h);
    cg.addColorStop(0, "#1A1A24"); cg.addColorStop(1, "#0F0F16");
    ctx.fillStyle = cg; roundRect(ctx, cardX, cy, cardW, h, 16); ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke();
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = accent;
    ctx.font = `700 16px "Inter", sans-serif`;
    drawSpaced(ctx, "★  FIRST PLACE  ★", W / 2, cy + 42, 4);
    const nSize = fitText(ctx, displayed[0].toUpperCase(), cardW - 80, 84, 36, "Anton");
    ctx.font = `400 ${nSize}px "Anton", sans-serif`; ctx.fillStyle = "#FFF";
    ctx.fillText(displayed[0].toUpperCase(), W / 2, cy + h / 2 + 20);
    ctx.restore();
  } else {
    for (let i = 0; i < displayed.length; i++) {
      const name = displayed[i], cy = y;
      ctx.save();
      ctx.fillStyle = "#14141C"; roundRect(ctx, cardX, cy, cardW, rowH - cardPad, 10); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = accent; roundRect(ctx, cardX, cy, 4, rowH - cardPad, 2); ctx.fill();
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = accent;
      const rS = Math.min(42, (rowH - cardPad) * 0.55);
      ctx.font = `400 ${rS}px "Anton", sans-serif`;
      ctx.fillText(String(i + 1).padStart(2, "0"), cardX + 30, cy + (rowH - cardPad) / 2);
      const nS = fitText(ctx, name.toUpperCase(), cardW - 130, Math.min(36, (rowH - cardPad) * 0.5), 18, "Anton");
      ctx.font = `400 ${nS}px "Anton", sans-serif`; ctx.fillStyle = "#FFF";
      ctx.fillText(name.toUpperCase(), cardX + 100, cy + (rowH - cardPad) / 2);
      ctx.restore();
      y += rowH;
    }
    if (winners.length > displayed.length) {
      ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#FF8F3F"; ctx.font = `600 18px "Inter", sans-serif`;
      ctx.fillText(`+ ${winners.length - displayed.length} MORE WINNERS`, W / 2, y + 14);
      ctx.restore();
    }
  }

  // Footer
  const footY = H - 90;
  ctx.save();
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#6B6B78"; ctx.font = `500 14px "JetBrains Mono", monospace`;
  ctx.fillText(`DRAWN ${date.toUpperCase()}  //  DRAWLOT.COM`, W / 2, footY);
  ctx.fillStyle = "#4B4B55"; ctx.font = `400 11px "Inter", sans-serif`;
  ctx.fillText("Results are final. Winners will be contacted via official channels.", W / 2, footY + 24);
  ctx.restore();

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92));
}
