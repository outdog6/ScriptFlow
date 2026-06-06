// components/cinematic/DeskLamp.tsx
"use client";
import { useRef, useState, useCallback } from "react";

interface Props {
  lampOn: boolean;
  converting: boolean;
  onPullChain: () => void;
}

const PALETTES = [
  { bulb: "#ffb347", beam: "rgba(255,179,71,0.18)", name: "golden-hour" },
  { bulb: "#ff8a65", beam: "rgba(255,138,101,0.16)", name: "teal-orange" },
  { bulb: "#90caf9", beam: "rgba(144,202,249,0.14)", name: "noir-blue" },
  { bulb: "#ce93d8", beam: "rgba(206,147,216,0.14)", name: "neon-purple" },
  { bulb: "#ffcc02", beam: "rgba(255,204,2,0.18)", name: "amber-warm" },
];

let paletteIndex = Math.floor(Math.random() * PALETTES.length);

export function cyclePalette() {
  paletteIndex = (paletteIndex + 1) % PALETTES.length;
  const p = PALETTES[paletteIndex];
  const root = document.documentElement;
  root.style.setProperty("--cine-bulb", p.bulb);
  root.style.setProperty("--cine-beam", p.beam);
  return p;
}

export default function DeskLamp({ lampOn, converting, onPullChain }: Props) {
  const [pulling, setPulling] = useState(false);

  const handlePull = useCallback(() => {
    if (pulling) return;
    setPulling(true);
    onPullChain();
    setTimeout(() => setPulling(false), 600);
  }, [pulling, onPullChain]);

  return (
    <div className="absolute top-0 left-0 z-50" style={{ width: 240, height: 280 }}>
      <svg viewBox="0 0 240 280" width="240" height="280" className="overflow-visible">
        <defs>
          {/* Bulb glow gradient */}
          <radialGradient id="cartoonBulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={lampOn ? "var(--cine-bulb)" : "#5a5040"} stopOpacity={lampOn ? 1 : 0.4} />
            <stop offset="40%" stopColor={lampOn ? "var(--cine-bulb)" : "#5a5040"} stopOpacity={lampOn ? 0.5 : 0.1} />
            <stop offset="100%" stopColor="var(--cine-bulb)" stopOpacity={0} />
          </radialGradient>

          {/* Warm glow behind shade */}
          <radialGradient id="cartoonInnerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={lampOn ? "rgba(255,179,71,0.4)" : "rgba(80,70,50,0.1)"} />
            <stop offset="100%" stopColor="rgba(255,179,71,0)" />
          </radialGradient>

          {/* Soft shadow for shade */}
          <filter id="cartoonShadeShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.4" />
          </filter>

          {/* Soft shadow for base */}
          <filter id="cartoonBaseShadow">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* === LAMP BASE === */}
        {/* Base shadow */}
        <ellipse cx="55" cy="265" rx="55" ry="12" fill="#000" opacity="0.3" filter="url(#cartoonBaseShadow)" />
        {/* Base — cartoon rounded pill shape */}
        <rect x="10" y="248" width="90" height="22" rx="11" ry="11" fill="#4a3a2a" stroke="#3a2a1a" strokeWidth="1.5" />
        {/* Base highlight */}
        <rect x="14" y="250" width="82" height="8" rx="4" ry="4" fill="rgba(255,255,255,0.06)" />

        {/* Joint circle */}
        <circle cx="55" cy="248" r="8" fill="#5a4a3a" stroke="#3a2a1a" strokeWidth="1.5" />

        {/* === LAMP ARM === */}
        {/* Lower arm — cartoon thick line */}
        <line x1="55" y1="245" x2="140" y2="80" stroke="#5a4a3a" strokeWidth="7" strokeLinecap="round" />
        <line x1="55" y1="245" x2="140" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeLinecap="round" />

        {/* Upper arm */}
        <line x1="140" y1="80" x2="175" y2="52" stroke="#5a4a3a" strokeWidth="5" strokeLinecap="round" />
        <line x1="140" y1="80" x2="175" y2="52" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Elbow joint */}
        <circle cx="140" cy="80" r="6" fill="#6a5a4a" stroke="#4a3a2a" strokeWidth="1.5" />

        {/* === LAMP SHADE === */}
        <g filter="url(#cartoonShadeShadow)">
          {/* Shade body — cartoon trapezoid with rounded corners */}
          <path
            d="M 125 48 L 215 20 Q 220 18 218 24 L 228 52 Q 230 58 225 56 L 130 82 Q 124 84 125 78 Z"
            fill="#5c4a38"
            stroke="#3a2a1a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Shade highlight stripe */}
          <path
            d="M 133 52 L 212 26"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Inner shade glow */}
        <path
          d="M 130 55 L 210 30 L 218 52 L 133 76 Z"
          fill={lampOn ? "rgba(255,179,71,0.2)" : "#3a2a1a"}
          className="transition-colors duration-500"
        />

        {/* === BULB === */}
        <circle
          cx="188"
          cy="44"
          r={lampOn ? 11 : 8}
          fill={lampOn ? "var(--cine-bulb)" : "#4a4030"}
          className="transition-all duration-500"
        />

        {/* Bulb glow aura (when on) */}
        {lampOn && (
          <circle cx="188" cy="44" r="35" fill="url(#cartoonBulbGlow)" />
        )}

        {/* === CHAIN === */}
        <g
          style={{
            transform: pulling ? "translateY(14px)" : "translateY(0)",
            transition: "transform 0.12s ease-in, transform 0.35s ease-out 0.12s",
            cursor: "pointer",
          }}
          onClick={handlePull}
        >
          {/* Chain hanger circle */}
          <circle cx="215" cy="24" r="3" fill="#6a5a4a" stroke="#4a3a2a" strokeWidth="1" />

          {/* Chain vertical line */}
          <line x1="215" y1="27" x2="215" y2="58" stroke="#8a7a6a" strokeWidth="2" strokeDasharray="3 2" />

          {/* Chain link */}
          <ellipse cx="215" cy="45" rx="4" ry="7" fill="none" stroke="#8a7a6a" strokeWidth="1.5" />

          {/* PULL RING — cartoon style */}
          {/* Invisible hit area */}
          <circle cx="215" cy="72" r="18" fill="transparent" />

          {/* Ring outer */}
          <circle
            cx="215"
            cy="72"
            r="12"
            fill="none"
            stroke={lampOn ? "#d4b870" : "#9b8b6e"}
            strokeWidth="2.5"
            className="transition-colors duration-300"
            style={{
              filter: lampOn
                ? "drop-shadow(0 0 5px rgba(255,179,71,0.5))"
                : "drop-shadow(0 0 2px rgba(150,130,100,0.3))",
            }}
          />

          {/* Ring inner highlight */}
          <circle cx="215" cy="72" r="10.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

          {/* Converting spinner */}
          {converting && (
            <circle
              cx="215"
              cy="72"
              r="16"
              fill="none"
              stroke="var(--cine-bulb)"
              strokeWidth="2"
              strokeDasharray="18 50"
              className="animate-spin"
              style={{ transformOrigin: "215px 72px" }}
            />
          )}
        </g>

        {/* Hint text */}
        {!lampOn && (
          <text x="215" y="100" textAnchor="middle" fill="#8b7355" fontSize="9" fontFamily="sans-serif" opacity={0.8}>
            拉我
          </text>
        )}
      </svg>
    </div>
  );
}
