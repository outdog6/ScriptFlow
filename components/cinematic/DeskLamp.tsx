// components/cinematic/DeskLamp.tsx
"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";

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
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const chainGroupRef = useRef<SVGGElement>(null);
  const startY = useRef(0);

  const CHAIN_REST_Y = 60;    // chain ring center Y at rest
  const CHAIN_ORIGIN_Y = 28;  // top of chain line
  const DRAG_THRESHOLD = 50;

  const resetChain = useCallback(() => {
    gsap.to(chainGroupRef.current, {
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
      onComplete: () => {
        setDragging(false);
        setTriggered(false);
      },
    });
    // Animate the dragY state for the rope stretch
    gsap.to({ v: dragY }, {
      v: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
      onUpdate: function() {
        setDragY(this.targets()[0].v);
      },
    });
  }, [dragY]);

  // Pointer event handlers for drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (triggered) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    startY.current = e.clientY;
    setDragging(true);
    setDragY(0);
  }, [triggered]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || triggered) return;
    const dy = e.clientY - startY.current;
    const clamped = Math.max(0, Math.min(dy, 80));
    setDragY(clamped);

    // Trigger when pulled past threshold
    if (clamped >= DRAG_THRESHOLD && !triggered) {
      setTriggered(true);
      onPullChain();
    }
  }, [dragging, triggered, onPullChain]);

  const handlePointerUp = useCallback(() => {
    if (dragging) {
      resetChain();
    }
  }, [dragging, resetChain]);

  // Auto-reset when not converting anymore
  useEffect(() => {
    if (!converting && triggered) {
      const t = setTimeout(() => resetChain(), 600);
      return () => clearTimeout(t);
    }
  }, [converting, triggered, resetChain]);

  // Rope stretch: control point bows outward when pulled
  const ropeControlX = 12 + dragY * 0.25;
  const ringY = CHAIN_REST_Y + dragY;
  const ropeD = `M 0 0 Q ${ropeControlX} ${dragY * 0.4} 0 ${ringY}`;

  return (
    <div className="absolute top-0 left-0 z-50" style={{ width: 220, height: 300 }}>
      <svg viewBox="0 0 220 300" width="220" height="300" className="overflow-visible">
        <defs>
          <radialGradient id="bulbGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={lampOn ? "var(--cine-bulb)" : "#6a5a40"} stopOpacity={lampOn ? 1 : 0.3} />
            <stop offset="50%" stopColor={lampOn ? "var(--cine-bulb)" : "#5a4a30"} stopOpacity={lampOn ? 0.4 : 0.08} />
            <stop offset="100%" stopColor="var(--cine-bulb)" stopOpacity={0} />
          </radialGradient>

          <filter id="softShadow">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
          </filter>

          <filter id="bulbSoftGlow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* === BASE — rounded cartoon === */}
        <g filter="url(#softShadow)">
          <rect x="8" y="262" width="84" height="18" rx="9" ry="9"
            fill="#5c4430" stroke="#3d2a18" strokeWidth="2" />
          <rect x="12" y="264" width="76" height="7" rx="3.5" ry="3.5"
            fill="rgba(255,255,255,0.06)" />
        </g>

        {/* Color palette switch — small dot on base */}
        <circle
          cx="80" cy="268" r="6"
          fill={lampOn ? "var(--cine-bulb)" : "#4a3a2a"}
          stroke="#3d2a18" strokeWidth="1.5"
          style={{
            cursor: "pointer",
            filter: lampOn ? "drop-shadow(0 0 4px var(--cine-bulb))" : undefined,
          }}
          onClick={(e) => {
            e.stopPropagation();
            cyclePalette();
          }}
        />

        {/* Base joint */}
        <circle cx="50" cy="262" r="7" fill="#6a5240" stroke="#3d2a18" strokeWidth="2" />

        {/* === CURVED ARM — organic, Pixar-style === */}
        <path d="M 50 258 Q 80 200 130 110 Q 150 70 170 55"
          fill="none" stroke="#5c4430" strokeWidth="8" strokeLinecap="round" />
        <path d="M 50 258 Q 80 200 130 110 Q 150 70 170 55"
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" strokeLinecap="round" />
        {/* Arm highlight */}
        <path d="M 48 256 Q 77 198 127 110 Q 147 72 168 56"
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Elbow joint */}
        <circle cx="130" cy="110" r="6" fill="#6a5240" stroke="#3d2a18" strokeWidth="2" />

        {/* === SHADE — cute wide cone === */}
        <g filter="url(#softShadow)">
          <path d="M 130 52 L 215 10 Q 222 6 220 16 L 226 55 Q 228 65 222 62 L 135 90 Q 125 94 128 84 Z"
            fill="#6b5240" stroke="#3d2a18" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Shade highlight stroke */}
          <path d="M 138 58 L 212 20" stroke="rgba(255,255,255,0.08)" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Inner shade — warm glow when on */}
        <path d="M 136 60 L 210 24 L 218 55 L 140 84 Z"
          fill={lampOn ? "rgba(255,179,71,0.25)" : "#2a1a10"}
          className="transition-colors duration-500" />

        {/* === BULB === */}
        <circle cx="188" cy="48" r={lampOn ? 13 : 9}
          fill={lampOn ? "var(--cine-bulb)" : "#5a4530"}
          filter={lampOn ? "url(#bulbSoftGlow)" : undefined}
          className="transition-all duration-500" />
        {/* Bulb center bright spot */}
        {lampOn && <circle cx="186" cy="46" r="4" fill="rgba(255,255,255,0.6)" filter="url(#bulbSoftGlow)" />}

        {/* Bulb glow aura */}
        {lampOn && <circle cx="188" cy="48" r="40" fill="url(#bulbGlowGrad)" />}

        {/* === CHAIN + ROPE === */}
        {/* Chain hanger ring */}
        <circle cx="220" cy="25" r="4" fill="#6a5240" stroke="#3d2a18" strokeWidth="1.5" />

        {/* Rope/chain — stretches with drag */}
        <g ref={chainGroupRef}>
          {/* Chain rope */}
          <g transform={`translate(220, ${CHAIN_ORIGIN_Y})`}>
            {/* Rope shadow */}
            <path d={ropeD}
              fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="3" strokeLinecap="round"
              transform="translate(1, 1)" />
            {/* Rope main */}
            <path d={ropeD}
              fill="none" stroke="#b8a080" strokeWidth="2.5" strokeLinecap="round" />
            {/* Rope highlight */}
            <path d={ropeD}
              fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />

            {/* Pull ring */}
            <g transform={`translate(0, ${ringY})`}>
              {/* Invisible large hit area for drag */}
              <circle cx="0" cy="0" r="20" fill="transparent"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
              />

              {/* Ring outer */}
              <circle cx="0" cy="0" r="11"
                fill="none" stroke={lampOn ? "#e8c878" : "#9b8b6e"} strokeWidth="2.5"
                style={{
                  filter: lampOn
                    ? "drop-shadow(0 0 6px rgba(255,179,71,0.6))"
                    : "drop-shadow(0 0 3px rgba(160,140,110,0.3))",
                }}
              />
              {/* Ring highlight arc */}
              <path d="M -7 -7 A 10 10 0 0 1 7 -7"
                fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

              {/* Converting spinner */}
              {converting && (
                <circle cx="0" cy="0" r="15"
                  fill="none" stroke="var(--cine-bulb)" strokeWidth="2"
                  strokeDasharray="20 60" className="animate-spin"
                  style={{ transformOrigin: "0 0" }} />
              )}
            </g>
          </g>
        </g>

        {/* Hint text — only when lamp is off and not dragging */}
        {!lampOn && !dragging && (
          <g transform="translate(220, 120)">
            <text x="0" y="0" textAnchor="middle" fill="#8b7355" fontSize="8"
              fontFamily="sans-serif" opacity={0.7}>
              拉绳
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
