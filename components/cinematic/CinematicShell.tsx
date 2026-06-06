// components/cinematic/CinematicShell.tsx
"use client";
import { useEffect, useState, useCallback, useRef, ReactNode } from "react";
import gsap from "gsap";
import DeskLamp, { cyclePalette } from "./DeskLamp";
import LightBeam from "./LightBeam";
import DustParticles from "./DustParticles";
import OpenBook from "./OpenBook";
import SilkBookmarks from "./SilkBookmarks";
import { useFirstVisit } from "@/lib/useFirstVisit";
import { ScriptData } from "@/lib/types";
import { exportFountain } from "@/lib/fountain-exporter";

interface Props {
  converting: boolean;
  activeNav: string;
  yaml: string;
  scriptTitle: string;
  script: ScriptData | null;
  onNavigate: (id: string) => void;
  onConvert: () => void;
  children: ReactNode;
}

export default function CinematicShell({
  converting,
  activeNav,
  yaml,
  scriptTitle,
  script,
  onNavigate,
  onConvert,
  children,
}: Props) {
  const isFirstVisit = useFirstVisit();
  const [lampOn, setLampOn] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [beamVisible, setBeamVisible] = useState(false);
  const [bookmarksVisible, setBookmarksVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Sync state once useFirstVisit resolves (client-side only)
  useEffect(() => {
    if (!isFirstVisit) {
      setLampOn(true);
      setBookOpen(true);
      setBeamVisible(true);
      setBookmarksVisible(true);
    }
  }, [isFirstVisit]);

  // Force cinematic dark mode — set localStorage so AppContext picks it up
  useEffect(() => {
    try { localStorage.setItem("scriptflow-theme", "dark"); } catch {}
    document.documentElement.setAttribute("data-cinematic", "true");
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.removeAttribute("data-cinematic");
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const handlePullChain = useCallback(() => {
    if (animating) return;

    // If lamp is off, turn it on (full ritual for first-timers, quick for repeats)
    if (!lampOn) {
      setAnimating(true);
      const tl = gsap.timeline();

      if (isFirstVisit) {
        // Full ritual
        tl.to({}, { duration: 0.3 })
          .call(() => setLampOn(true))
          .to({}, { duration: 0.5 })
          .call(() => setBeamVisible(true))
          .to({}, { duration: 0.8 })
          .call(() => setBookOpen(true))
          .to({}, { duration: 0.4 })
          .call(() => setBookmarksVisible(true));
      } else {
        // Quick micro-animation for repeat visits
        tl.to({}, { duration: 0.15 })
          .call(() => setLampOn(true))
          .to({}, { duration: 0.3 })
          .call(() => {
            setBeamVisible(true);
            setBookOpen(true);
            setBookmarksVisible(true);
          });
      }
      tl.eventCallback("onComplete", () => setAnimating(false));
      return;
    }

    // Lamp already on — this is a conversion trigger
    cyclePalette();
    onConvert();
  }, [lampOn, animating, isFirstVisit, onConvert]);

  return (
    <div className="h-screen flex flex-col cine-desk overflow-hidden relative">
      {/* Desk lamp */}
      <DeskLamp lampOn={lampOn} converting={converting} onPullChain={handlePullChain} />

      {/* Light beam */}
      <LightBeam visible={beamVisible} />

      {/* Dust particles */}
      <DustParticles visible={beamVisible && bookOpen} />

      {/* Open book with bookmarks */}
      <OpenBook open={bookOpen}>
        {/* Silk ribbons on spine */}
        <SilkBookmarks activeNav={activeNav} onNavigate={onNavigate} visible={bookmarksVisible} />

        {/* Page content */}
        {children}
      </OpenBook>

      {/* Vignette overlay — subtle desk edge shadow */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: `
            radial-gradient(
              ellipse at 50% 50%,
              transparent 45%,
              rgba(0, 0, 0, 0.08) 65%,
              rgba(0, 0, 0, 0.2) 85%,
              rgba(0, 0, 0, 0.35) 100%
            )
          `,
        }}
      />

      {/* Quill & Inkwell — right side of desk, vertically centered */}
      {bookOpen && (
        <div className="absolute top-1/2 -translate-y-1/2 right-12 z-50">
          <QuillExport yaml={yaml} scriptTitle={scriptTitle} script={script} />
        </div>
      )}
    </div>
  );
}

/* ============================================
   Quill & Inkwell Export Component
   Click feather → dip ink → write → download
   ============================================ */
function QuillExport({ yaml, scriptTitle, script }: { yaml: string; scriptTitle: string; script: ScriptData | null }) {
  const [open, setOpen] = useState(false);
  const [writing, setWriting] = useState(false);
  const quillRef = useRef<SVGGElement>(null);
  const inkLineRef = useRef<SVGPathElement>(null);

  const hasContent = !!(yaml || script);

  const download = useCallback((content: string, ext: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scriptTitle || "script"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scriptTitle]);

  const triggerExport = useCallback((format: "yaml" | "fountain") => {
    if (writing || !quillRef.current) return;
    setWriting(true);
    setOpen(false);

    // All coordinates in unified SVG space (viewBox 0 0 80 380)
    const quillRestX = 28;
    const quillRestY = 340;
    const paperTopY = 14;
    const paperBotY = 160;
    const paperX = 40;
    const steps = 6;

    const tl = gsap.timeline({ onComplete: () => setWriting(false) });

    // 1. Quill lifts out of bottle
    tl.to(quillRef.current, { x: quillRestX - 28, y: -30, duration: 0.3, ease: "power2.out" })
      // 2. Dip shake
      .to(quillRef.current, { y: -25, duration: 0.08 })
      .to(quillRef.current, { y: -30, duration: 0.08 })
      // 3. Fly to top of parchment
      .to(quillRef.current, { x: paperX - 28, y: paperTopY - 340, duration: 0.45, ease: "power2.inOut" });

    // 4. Draw wavy line down the parchment
    const startY = paperTopY - 340;
    const endY = paperBotY - 340;
    const startX = paperX - 28;
    for (let i = 1; i <= steps; i++) {
      const frac = i / steps;
      const y = startY + (endY - startY) * frac;
      const x = startX + (i % 2 === 0 ? 6 : -6);
      tl.to(quillRef.current, { x, y, duration: 0.15 });
    }

    // 5. Fade ink stroke
    tl.call(() => {
      if (inkLineRef.current) {
        inkLineRef.current.style.opacity = "1";
        inkLineRef.current.style.strokeDashoffset = "0";
      }
    }, [0])
      // 6. Download
      .call(() => {
        if (format === "yaml") {
          const fixed = yaml.replace(/title:\s*".*?"/, `title: "${scriptTitle}"`);
          download(fixed, "yaml", "text/yaml");
        } else if (script) {
          download(exportFountain(script), "fountain", "text/plain");
        }
      })
      // 7. Return to bottle
      .to({}, { duration: 0.5 })
      .to(quillRef.current, { x: 0, y: 0, duration: 0.5, ease: "power2.in" })
      // 8. Hide ink
      .call(() => {
        if (inkLineRef.current) {
          inkLineRef.current.style.opacity = "0";
          inkLineRef.current.style.strokeDashoffset = "320";
        }
      });
  }, [writing, yaml, scriptTitle, script, download]);

  if (!hasContent) return null;

  return (
    <div className="relative">
      {/* Format selector dropdown */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-[#2a221a] border border-[rgba(255,255,255,0.08)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] min-w-[140px] z-10">
          <button onClick={() => triggerExport("yaml")}
            className="block w-full text-left px-3 py-2 text-[12px] text-[#c4b8a8] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-colors">
            导出 YAML
          </button>
          {script && (
            <button onClick={() => triggerExport("fountain")}
              className="block w-full text-left px-3 py-2 text-[12px] text-[#c4b8a8] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-colors">
              导出 Fountain
            </button>
          )}
        </div>
      )}

      {/* Unified SVG: parchment + bottle + quill in shared coordinate space */}
      <div className="cursor-pointer mx-auto w-fit" onClick={() => setOpen(!open)}>
        <svg width="80" height="400" viewBox="0 0 80 400" className="overflow-visible">
          <defs>
            <filter id="quillShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* === PARCHMENT STRIP (y: 0-170) === */}
          <rect x="16" y="0" width="48" height="170" rx="3" ry="3"
            fill="#f8f0dc" stroke="rgba(180,140,80,0.2)" strokeWidth="1" />
          <rect x="16" y="0" width="48" height="170" rx="3" ry="3"
            fill="url(#parchGrad)" />
          <defs>
            <linearGradient id="parchGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8f0dc" />
              <stop offset="45%" stopColor="#ecdaa8" />
              <stop offset="100%" stopColor="#f4e8cc" />
            </linearGradient>
          </defs>

          {/* Torn top */}
          <path d="M 16 0 L 22 4 L 28 1 L 34 5 L 40 2 L 46 5 L 52 1 L 58 4 L 64 0"
            fill="#d4c090" stroke="none" />
          {/* Torn bottom */}
          <path d="M 16 170 L 24 166 L 30 169 L 38 165 L 44 168 L 52 164 L 58 167 L 64 170"
            fill="#d4c090" stroke="none" />

          {/* Wax seal */}
          <circle cx="40" cy="170" r="8" fill="#c0392b" />
          <circle cx="38" cy="168" r="3" fill="rgba(255,255,255,0.15)" />

          {/* Ink stroke — hidden until write */}
          <path ref={inkLineRef}
            d="M 40 10 Q 28 25 42 40 Q 50 52 34 66 Q 28 80 44 94 Q 50 104 34 118 Q 28 130 42 144 Q 48 152 36 162"
            stroke="#1a0a04" strokeWidth="2.5" fill="none" strokeLinecap="round"
            style={{ opacity: 0, strokeDasharray: 320, strokeDashoffset: 320, transition: "stroke-dashoffset 1.5s ease-out, opacity 0.3s ease-out" }}
          />

          {/* === INK BOTTLE (y: 260-340) === */}
          {/* Desk shadow */}
          <ellipse cx="42" cy="342" rx="28" ry="4" fill="rgba(0,0,0,0.25)" />
          {/* Bottle body — round */}
          <ellipse cx="40" cy="310" rx="26" ry="26"
            fill="rgba(25,16,8,0.95)" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          {/* Glass highlight */}
          <ellipse cx="30" cy="300" rx="6" ry="14"
            fill="rgba(255,255,255,0.08)" style={{ transform: "rotate(-10deg)", transformOrigin: "30px 300px" }} />
          {/* Ink inside */}
          <ellipse cx="40" cy="318" rx="21" ry="12"
            fill="#080810" />
          {/* Ink shimmer */}
          <ellipse cx="40" cy="316" rx="19" ry="2"
            fill="rgba(255,255,255,0.04)" />
          {/* Cork */}
          <rect x="29" y="268" width="22" height="16" rx="4" ry="4"
            fill="#d4b896" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <line x1="31" y1="274" x2="49" y2="274" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          <line x1="31" y1="278" x2="49" y2="278" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />

          {/* === FEATHER QUILL === */}
          <g ref={quillRef} filter="url(#quillShadow)">
            {/* Shaft */}
            <line x1="28" y1="300" x2="28" y2="345" stroke="#e8d8b0" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="300" x2="28" y2="345" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round" />

            {/* Left barbs */}
            <path d="M 28 305 Q 10 315 10 335 Q 10 345 14 350 L 24 345 Q 20 335 24 320 Z"
              fill="rgba(245,235,215,0.9)" stroke="rgba(200,175,140,0.5)" strokeWidth="0.8" />
            {/* Right barbs */}
            <path d="M 28 305 Q 42 312 44 330 Q 46 342 40 348 L 32 343 Q 36 330 32 318 Z"
              fill="rgba(250,240,220,0.85)" stroke="rgba(200,175,140,0.5)" strokeWidth="0.8" />
            {/* Vane */}
            <line x1="28" y1="310" x2="28" y2="340" stroke="rgba(180,155,120,0.35)" strokeWidth="0.8" />
            {/* Fluff top */}
            <path d="M 24 302 Q 18 295 22 290 Q 26 288 28 292 Q 32 288 36 292 Q 38 296 32 302"
              fill="rgba(245,235,215,0.6)" />

            {/* Nib — in ink */}
            <path d="M 28 340 L 25 348 L 28 344 L 31 348 Z" fill="#4a3a2a" />
            <circle cx="28" cy="344" r="1.5" fill="#060610" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* Label */}
      <div className="text-center mt-1">
        <span className="text-[12px] font-semibold tracking-wider" style={{ color: "#b8a080" }}>
          ✦  蘸墨导出  ✦
        </span>
      </div>

      <style>{`
        @keyframes quillIdle {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(-3deg); }
          70% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
