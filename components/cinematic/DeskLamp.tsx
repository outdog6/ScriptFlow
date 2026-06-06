// components/cinematic/DeskLamp.tsx
"use client";
import { useRef, useState, useCallback } from "react";

interface Props {
  lampOn: boolean;
  converting: boolean;
  onPullChain: () => void;
}

const PALETTES = [
  { bulb: "#ffb74d", beam: "rgba(255,183,77,0.10)", name: "golden-hour" },
  { bulb: "#ff8a65", beam: "rgba(255,138,101,0.10)", name: "teal-orange" },
  { bulb: "#90caf9", beam: "rgba(144,202,249,0.10)", name: "noir-blue" },
  { bulb: "#ce93d8", beam: "rgba(206,147,216,0.10)", name: "neon-purple" },
  { bulb: "#ffcc02", beam: "rgba(255,204,2,0.10)", name: "amber-warm" },
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
  const chainRef = useRef<SVGGElement>(null);

  const handlePull = useCallback(() => {
    if (pulling) return;
    setPulling(true);
    onPullChain();
    setTimeout(() => setPulling(false), 600);
  }, [pulling, onPullChain]);

  return (
    <div className="absolute top-0 left-0 z-50" style={{ width: 280, height: 320 }}>
      <svg
        viewBox="0 0 280 320"
        width="280"
        height="320"
        className="overflow-visible"
      >
        <defs>
          <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={lampOn ? "var(--cine-bulb)" : "#3a3a3a"} stopOpacity={lampOn ? 1 : 0.3} />
            <stop offset="60%" stopColor={lampOn ? "var(--cine-bulb)" : "#3a3a3a"} stopOpacity={lampOn ? 0.4 : 0.1} />
            <stop offset="100%" stopColor="var(--cine-bulb)" stopOpacity={0} />
          </radialGradient>
          <filter id="lampShadow">
            <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000" floodOpacity="0.6" />
          </filter>
          <filter id="bulbBlur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Lamp base */}
        <ellipse cx="70" cy="290" rx="50" ry="10" fill="#1c1814" filter="url(#lampShadow)" />
        <ellipse cx="70" cy="286" rx="48" ry="8" fill="#2a2420" />

        {/* Arm joint at base */}
        <circle cx="70" cy="280" r="6" fill="#3a3430" />

        {/* Lower arm */}
        <line x1="70" y1="280" x2="160" y2="100" stroke="#3a3430" strokeWidth="5" strokeLinecap="round" />

        {/* Upper arm */}
        <line x1="160" y1="100" x2="190" y2="60" stroke="#3a3430" strokeWidth="4" strokeLinecap="round" />

        {/* Joint */}
        <circle cx="160" cy="100" r="5" fill="#4a4440" />

        {/* Lamp shade */}
        <path
          d="M 140 65 L 230 30 L 240 55 L 145 95 Z"
          fill="#2a2420"
          stroke="#3a3430"
          strokeWidth="1"
        />

        {/* Inner shade */}
        <path
          d="M 148 70 L 226 38 L 233 55 L 151 90 Z"
          fill={lampOn ? "rgba(255,183,77,0.15)" : "#1a1612"}
          className="transition-colors duration-500"
        />

        {/* Bulb */}
        <circle
          cx="200"
          cy="52"
          r={lampOn ? 10 : 7}
          fill={lampOn ? "var(--cine-bulb)" : "#3a3a3a"}
          filter={lampOn ? "url(#bulbBlur)" : undefined}
          className="transition-all duration-500"
        />

        {/* Bulb glow aura */}
        {lampOn && (
          <circle cx="200" cy="52" r="30" fill="url(#bulbGlow)" />
        )}

        {/* Chain hanging point */}
        <circle cx="225" cy="38" r="3" fill="#5a5450" />

        {/* Chain */}
        <g
          ref={chainRef}
          style={{
            transform: pulling ? "translateY(12px)" : "translateY(0)",
            transition: "transform 0.15s ease-in, transform 0.4s ease-out 0.15s",
            cursor: "pointer",
          }}
          onClick={handlePull}
        >
          {/* Chain links */}
          <line x1="225" y1="41" x2="225" y2="68" stroke="#8a8070" strokeWidth="1.5" />
          <ellipse cx="225" cy="56" rx="3" ry="5" fill="none" stroke="#8a8070" strokeWidth="1" />

          {/* Pull ring */}
          <circle
            cx="225"
            cy="78"
            r="10"
            fill="none"
            stroke="#b0a890"
            strokeWidth="2"
            className="transition-colors duration-300"
            style={{
              filter: lampOn
                ? "drop-shadow(0 0 4px rgba(255,183,77,0.4))"
                : "drop-shadow(0 0 2px rgba(180,160,130,0.2))",
            }}
          />

          {/* Ring highlight */}
          <circle cx="225" cy="78" r="9" fill="none" stroke="#d4c8a0" strokeWidth="0.5" opacity={0.5} />

          {/* Converting spinner ring */}
          {converting && (
            <circle
              cx="225"
              cy="78"
              r="14"
              fill="none"
              stroke="var(--cine-bulb)"
              strokeWidth="1.5"
              strokeDasharray="20 60"
              className="animate-spin"
              style={{ transformOrigin: "225px 78px" }}
            />
          )}
        </g>

        {/* Chain hover hint */}
        {!lampOn && (
          <text x="225" y="105" textAnchor="middle" fill="#6b5e4e" fontSize="9" fontFamily="sans-serif" opacity={0.7}>
            拉我
          </text>
        )}
      </svg>
    </div>
  );
}
