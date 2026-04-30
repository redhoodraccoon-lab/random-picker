import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Drawlot.com — Free Online Random Draw Tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#09090E",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top orange glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(255,107,26,0.30) 0%, transparent 70%)",
          }}
        />
        {/* Bottom-right glow */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 500,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at bottom right, rgba(255,107,26,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "rgba(255,107,26,0.18)",
            border: "2px solid rgba(255,107,26,0.35)",
            marginBottom: 28,
            boxShadow: "0 8px 40px rgba(255,107,26,0.35)",
          }}
        >
          {/* Trophy SVG */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        </div>

        {/* Site name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          Drawlot.com
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: "#a1a1aa",
            fontWeight: 400,
            letterSpacing: "0.02em",
            marginBottom: 40,
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Free Online Random Draw & Winner Picker Tool
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {["CSV · XLSX · TXT", "Up to 100 winners", "Cryptographically secure"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid rgba(255,107,26,0.35)",
                background: "rgba(255,107,26,0.10)",
                color: "#FF8F3F",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            color: "#3f3f46",
            fontSize: 15,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          drawlot.com · by ketso.co
        </div>
      </div>
    ),
    { ...size }
  );
}
