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
  const quillRef = useRef<HTMLDivElement>(null);
  const parchmentRef = useRef<HTMLDivElement>(null);
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
    if (writing || !quillRef.current || !parchmentRef.current) return;
    setWriting(true);
    setOpen(false);

    // Calculate real positions: parchment strip relative to quill container
    const quillBox = quillRef.current.getBoundingClientRect();
    const parchBox = parchmentRef.current.getBoundingClientRect();
    const dx = parchBox.left + parchBox.width / 2 - quillBox.left - quillBox.width / 2;
    const dyTop = parchBox.top + 12 - quillBox.top;
    const dyBot = parchBox.bottom - 24 - quillBox.top;
    const steps = 6;

    const tl = gsap.timeline({ onComplete: () => setWriting(false) });

    // 1. Quill lifts from bottle
    tl.to(quillRef.current, { y: -30, rotate: -10, duration: 0.25, ease: "power2.out" })
      // 2. Dip micro-shake
      .to(quillRef.current, { scaleX: 0.9, duration: 0.08 })
      .to(quillRef.current, { scaleX: 1, duration: 0.08 })
      // 3. Fly to top of parchment
      .to(quillRef.current, { x: dx, y: dyTop, rotate: -20, duration: 0.45, ease: "power2.inOut" });

    // 4. Draw wavy line down the strip
    for (let i = 1; i <= steps; i++) {
      const frac = i / steps;
      const y = dyTop + (dyBot - dyTop) * frac;
      const xOff = (i % 2 === 0 ? 6 : -6);
      tl.to(quillRef.current, { x: dx + xOff, y, duration: 0.15 });
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
      .to(quillRef.current, { x: 0, y: 0, rotate: 12, duration: 0.5, ease: "power2.in" })
      // 8. Hide ink
      .call(() => {
        if (inkLineRef.current) {
          inkLineRef.current.style.opacity = "0";
          inkLineRef.current.style.strokeDashoffset = "300";
        }
      });
  }, [writing, yaml, scriptTitle, script, download]);

  if (!hasContent) return null;

  return (
    <div className="relative">
      {/* Format selector dropdown */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-[#2a221a] border border-[rgba(255,255,255,0.08)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] min-w-[140px] z-10">
          <button
            onClick={() => triggerExport("yaml")}
            className="block w-full text-left px-3 py-2 text-[12px] text-[#c4b8a8] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-colors"
          >
            导出 YAML
          </button>
          {script && (
            <button
              onClick={() => triggerExport("fountain")}
              className="block w-full text-left px-3 py-2 text-[12px] text-[#c4b8a8] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-colors"
            >
              导出 Fountain
            </button>
          )}
        </div>
      )}

      {/* Parchment scroll — long tear-edged strip */}
      <div
        ref={parchmentRef}
        className="relative mx-auto mb-3 w-12 rounded-sm"
        style={{
          height: 170,
          background: "linear-gradient(180deg, #f8f0dc 0%, #ecdaa8 45%, #f4e8cc 100%)",
          boxShadow: "3px 6px 20px rgba(0,0,0,0.35), inset 0 0 50px rgba(200,160,100,0.06)",
          border: "1px solid rgba(180,140,80,0.2)",
        }}
      >
        {/* Torn top */}
        <div className="absolute -top-2 left-0 right-0 h-4"
          style={{
            background: "linear-gradient(180deg, #d4c090 0%, #f8f0dc 100%)",
            clipPath: "polygon(0% 60%, 8% 0%, 22% 50%, 35% 10%, 50% 55%, 65% 5%, 78% 45%, 92% 15%, 100% 50%, 100% 100%, 0% 100%)",
          }}
        />
        {/* Bottom tear */}
        <div className="absolute -bottom-1.5 left-0 right-0 h-3"
          style={{
            background: "linear-gradient(180deg, #f4e8cc, #d4c090)",
            clipPath: "polygon(0% 0%, 12% 55%, 28% 8%, 48% 60%, 62% 12%, 80% 50%, 92% 20%, 100% 40%, 100% 100%, 0% 100%)",
          }}
        />

        {/* Wax seal at bottom */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
          style={{
            background: "radial-gradient(circle at 40% 35%, #c0392b 0%, #8b1a1a 100%)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)",
          }}
        />

        {/* Ink stroke (hidden until write) */}
        <svg width="100%" height="100%" viewBox="0 0 48 170" preserveAspectRatio="none" className="absolute inset-0" style={{ overflow: "visible" }}>
          <path ref={inkLineRef}
            d="M 24 10 Q 12 30 26 45 Q 36 58 20 72 Q 10 84 28 98 Q 38 108 18 122 Q 10 134 26 146 Q 36 154 22 164"
            stroke="#1a0a04" strokeWidth="2.5" fill="none" strokeLinecap="round"
            style={{ opacity: 0, strokeDasharray: 320, strokeDashoffset: 320, transition: "stroke-dashoffset 1.5s ease-out, opacity 0.3s ease-out" }}
          />
        </svg>
      </div>

      {/* Label */}
      <div className="text-center mb-3">
        <span className="text-[12px] font-semibold tracking-wider" style={{ color: "#b8a080" }}>
          ✦  蘸墨导出  ✦
        </span>
      </div>

      {/* Ink bottle + quill */}
      <div className="relative cursor-pointer mx-auto w-fit" onClick={() => setOpen(!open)}>
        {/* Desk shadow */}
        <div className="absolute -bottom-1 -left-2 -right-2 h-4 rounded-full bg-black/30 blur-sm" />

        {/* === INK BOTTLE — cartoon pot-bellied === */}
        <div className="relative" style={{ width: 64, height: 72 }}>
          {/* Bottle body — round, pot-bellied */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(180deg, rgba(60,45,30,0.8) 0%, rgba(25,16,8,0.95) 100%)",
              border: "2px solid rgba(255,255,255,0.06)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.5), inset 0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            {/* Glass reflection — cartoon arc */}
            <div className="absolute left-2 top-3 rounded-full"
              style={{
                width: 14,
                height: 30,
                background: "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)",
                borderRadius: "40% 60% 50% 50%",
              }}
            />
            {/* Small highlight dot */}
            <div className="absolute left-4 top-5 w-2 h-3 rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />

            {/* Ink visible through glass */}
            <div className="absolute bottom-2 left-3 right-3 rounded-full"
              style={{
                height: 28,
                background: "linear-gradient(180deg, #060610 0%, #14142a 50%, #0a0a18 100%)",
                borderTop: "2px solid rgba(255,255,255,0.04)",
              }}
            />
            {/* Ink surface shimmer */}
            <div className="absolute left-4 right-4 rounded-full"
              style={{
                bottom: 28,
                height: 2,
                background: "rgba(255,255,255,0.06)",
              }}
            />
          </div>

          {/* Cork stopper */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-md"
            style={{
              width: 22,
              height: 20,
              background: "linear-gradient(135deg, #d4b896 0%, #b8956e 50%, #a07850 100%)",
              borderRadius: "5px 5px 2px 2px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            {/* Cork texture lines */}
            <div className="absolute top-2 left-1 right-1 h-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.15)" }} />
            <div className="absolute top-5 left-1 right-1 h-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.1)" }} />
            <div className="absolute top-8 left-2 right-2 h-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.12)" }} />
          </div>
        </div>

        {/* === FEATHER QUILL — cartoon expressive === */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: -90 }}>
          <div ref={quillRef}
            style={{
              transformOrigin: "bottom center",
              transform: "rotate(12deg)",
              transition: "transform 0.3s ease-out",
              animation: writing ? "none" : "quillIdle 3s ease-in-out infinite",
            }}
          >
          <svg width="34" height="130" viewBox="0 0 34 130" className="overflow-visible">
            {/* Shaft */}
            <line x1="17" y1="10" x2="17" y2="122" stroke="#e8d8b0" strokeWidth="2" strokeLinecap="round" />
            <line x1="17" y1="10" x2="17" y2="122" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" />

            {/* Left barbs — big swoopy curves */}
            <path d="M 17 12 Q 2 25 0 52 Q -2 72 4 86 L 14 78 Q 10 60 14 38 Z"
              fill="rgba(245,235,215,0.9)" stroke="rgba(200,175,140,0.6)" strokeWidth="1" />
            {/* Left inner layer */}
            <path d="M 17 16 Q 8 28 6 48 Q 4 60 7 72 L 13 66 Q 10 52 13 34 Z"
              fill="rgba(255,245,230,0.5)" />

            {/* Right barbs — asymmetric, playful */}
            <path d="M 17 12 Q 30 22 33 48 Q 35 65 30 82 L 20 74 Q 24 56 20 36 Z"
              fill="rgba(250,240,220,0.85)" stroke="rgba(200,175,140,0.6)" strokeWidth="1" />
            {/* Right inner layer */}
            <path d="M 17 16 Q 26 26 28 46 Q 30 58 26 70 L 20 64 Q 22 50 20 32 Z"
              fill="rgba(255,248,238,0.5)" />

            {/* Vane line */}
            <line x1="17" y1="18" x2="17" y2="68" stroke="rgba(180,155,120,0.4)" strokeWidth="1" />

            {/* Fluffy top curl */}
            <path d="M 14 12 Q 8 8 12 2 Q 17 0 20 4 Q 24 0 28 6 Q 30 10 24 12"
              fill="rgba(245,235,215,0.7)" stroke="rgba(200,175,140,0.4)" strokeWidth="0.5" />

            {/* Nib — cartoon metal tip */}
            <path d="M 17 112 L 13 122 L 17 118 L 21 122 Z" fill="#5a4a3a" />
            <path d="M 17 114 L 15 121 L 17 117 L 19 121 Z" fill="#3a2a18" />
            {/* Ink on nib tip */}
            <circle cx="17" cy="118" r="2" fill="#060610" opacity="0.9" />
            {/* Tiny ink drip */}
            <ellipse cx="17" cy="124" rx="1" ry="1.5" fill="#060610" opacity="0.5" />
          </svg>
          </div>
        </div>
      </div>

      {/* Idle quill bob animation */}
      <style>{`
        @keyframes quillIdle {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          30% { transform: rotate(-2deg) translateY(-3px); }
          70% { transform: rotate(2deg) translateY(-1px); }
        }
      `}</style>
    </div>
  );
}
