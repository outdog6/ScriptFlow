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
    };
  }, []);

  const handlePullChain = useCallback(() => {
    if (animating) return;

    // If lamp is off, turn it on (full ritual for first-timers, quick for repeats)
    if (!lampOn) {
      setAnimating(true);
      const tl = gsap.timeline({
        onComplete: () => {
          setAnimating(false);
          if (isFirstVisit) {
            setBeamVisible(true);
            setBookOpen(true);
            setBookmarksVisible(true);
          }
        },
      });

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

      {/* Vignette overlay — darkens edges, draws focus to book */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: `
            radial-gradient(
              ellipse at 50% 50%,
              transparent 35%,
              rgba(0, 0, 0, 0.15) 55%,
              rgba(0, 0, 0, 0.4) 80%,
              rgba(0, 0, 0, 0.6) 100%
            )
          `,
        }}
      />

      {/* Quill & Inkwell — right side of desk */}
      {bookOpen && (
        <div className="absolute bottom-12 right-16 z-50">
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
  const inkLineRef = useRef<SVGPathElement>(null);

  const hasContent = !!(yaml || script);

  const download = (content: string, ext: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scriptTitle || "script"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerExport = useCallback((format: "yaml" | "fountain") => {
    if (writing) return;
    setWriting(true);
    setOpen(false);

    const tl = gsap.timeline({ onComplete: () => setWriting(false) });

    // 1. Quill lifts from bottle + tilts
    tl.to(quillRef.current, { y: -40, rotate: -10, duration: 0.25, ease: "power2.out" })
      // 2. Dip — quick micro shake
      .to(quillRef.current, { scaleX: 0.9, duration: 0.08 })
      .to(quillRef.current, { scaleX: 1, duration: 0.08 })
      // 3. Rise to top of parchment strip (taller now: 160px + gaps)
      .to(quillRef.current, { x: -30, y: -210, rotate: -20, duration: 0.5, ease: "power2.inOut" })
      // 4. Draw wavy line down the strip (6 stops over 160px)
      .to(quillRef.current, { x: -25, y: -185, duration: 0.15 })
      .to(quillRef.current, { x: -34, y: -160, duration: 0.15 })
      .to(quillRef.current, { x: -26, y: -135, duration: 0.15 })
      .to(quillRef.current, { x: -34, y: -110, duration: 0.15 })
      .to(quillRef.current, { x: -28, y: -85, duration: 0.15 })
      .to(quillRef.current, { x: -30, y: -60, duration: 0.15 })
      // 5. Fade in the ink stroke on parchment
      .call(() => {
        if (inkLineRef.current) {
          inkLineRef.current.style.opacity = "1";
          inkLineRef.current.style.strokeDashoffset = "0";
        }
      }, [0]) // start at beginning of this label
      // 6. Download
      .call(() => {
        if (format === "yaml") {
          const fixed = yaml.replace(/title:\s*".*?"/, `title: "${scriptTitle}"`);
          download(fixed, "yaml", "text/yaml");
        } else if (script) {
          download(exportFountain(script), "fountain", "text/plain");
        }
      })
      // 7. Pause, then return
      .to({}, { duration: 0.5 })
      .to(quillRef.current, { x: 0, y: 0, rotate: 0, duration: 0.5, ease: "power2.in" })
      // 8. Fade out ink line
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

      {/* Parchment scroll strip — prominent above bottle */}
      <div
        className="relative mx-auto mb-2 w-10 rounded-sm"
        style={{
          height: 160,
          background: "linear-gradient(180deg, #f5edda 0%, #ead8a8 50%, #f3e8cc 100%)",
          boxShadow: "2px 4px 16px rgba(0,0,0,0.3), inset 0 0 40px rgba(180,150,100,0.08)",
          border: "1px solid rgba(180,150,100,0.25)",
        }}
      >
        {/* Torn top edge */}
        <div
          className="absolute -top-1.5 left-0 right-0 h-3"
          style={{
            background: "linear-gradient(180deg, #d8c898 0%, #f5edda 100%)",
            clipPath: "polygon(0% 50%, 10% 0%, 25% 40%, 40% 10%, 55% 45%, 70% 5%, 85% 35%, 100% 15%, 100% 100%, 0% 100%)",
          }}
        />
        {/* Bottom tear */}
        <div
          className="absolute -bottom-1 left-0 right-0 h-2"
          style={{
            background: "linear-gradient(180deg, #f3e8cc, #d8c898)",
            clipPath: "polygon(0% 0%, 15% 50%, 30% 10%, 55% 60%, 70% 15%, 85% 45%, 100% 20%, 100% 100%, 0% 100%)",
          }}
        />

        {/* Wavy ink stroke */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 40 160"
          preserveAspectRatio="none"
          className="absolute inset-0"
          style={{ overflow: "visible" }}
        >
          <path
            ref={inkLineRef}
            d="M 20 8 Q 10 25 22 38 Q 30 48 18 60 Q 8 72 24 84 Q 32 94 16 108 Q 8 118 22 130 Q 30 140 18 152"
            stroke="#2a1a0a"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            style={{
              opacity: 0,
              strokeDasharray: 300,
              strokeDashoffset: 300,
              transition: "stroke-dashoffset 1.4s ease-out, opacity 0.3s ease-out",
            }}
          />
        </svg>
      </div>

      {/* Label — always visible so users know what this is */}
      <div className="text-center mb-2">
        <span
          className="text-[11px] font-medium tracking-wide"
          style={{ color: "var(--apple-secondary)" }}
        >
          蘸墨导出
        </span>
      </div>

      {/* Ink bottle + quill */}
      <div className="relative cursor-pointer mx-auto w-fit" onClick={() => setOpen(!open)}>
        {/* Bottle shadow on desk */}
        <div
          className="absolute -bottom-1 left-2 right-2 h-3 rounded-full bg-black/25 blur-sm"
        />

        {/* Ink bottle */}
        <div
          className="w-18 h-22 rounded-b-2xl rounded-t-lg relative"
          style={{
            width: 72,
            height: 88,
            background: "linear-gradient(135deg, rgba(50,38,24,0.75) 0%, rgba(25,18,12,0.92) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
          }}
        >
          {/* Glass highlight stripe */}
          <div
            className="absolute left-2 top-3 rounded-full"
            style={{ width: 3, height: 48, background: "rgba(255,255,255,0.05)" }}
          />
          {/* Small highlight */}
          <div
            className="absolute left-3 top-4 rounded-full"
            style={{ width: 2, height: 20, background: "rgba(255,255,255,0.04)" }}
          />

          {/* Ink level */}
          <div
            className="absolute bottom-3 left-2 right-2 rounded-b-xl"
            style={{
              height: 36,
              background: "linear-gradient(to bottom, #080810 0%, #141428 50%, #0a0a16 100%)",
              borderTop: "1px solid rgba(255,255,255,0.03)",
            }}
          />
          {/* Ink surface sheen */}
          <div
            className="absolute left-2 right-2 rounded-t-sm"
            style={{
              bottom: 36,
              height: 2,
              background: "rgba(255,255,255,0.04)",
            }}
          />

          {/* Bottle neck */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-t-md"
            style={{
              width: 28,
              height: 14,
              background: "linear-gradient(135deg, #4a3a2a, #2a1a0a)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          />
          {/* Bottle rim */}
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              width: 32,
              height: 5,
              background: "#3a2a1a",
              borderRadius: "3px 3px 0 0",
            }}
          />
        </div>

        {/* Feather quill */}
        <div
          ref={quillRef}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: -6, transformOrigin: "bottom center" }}
        >
          <svg width="28" height="120" viewBox="0 0 28 120" className="overflow-visible">
            {/* Quill shaft */}
            <line x1="14" y1="8" x2="14" y2="115" stroke="#d8cba0" strokeWidth="1.5" />
            <line x1="14" y1="8" x2="14" y2="115" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
            {/* Feather barbs — left */}
            <path d="M 14 10 Q 4 22 3 45 Q 1 58 4 72 L 12 65 Q 10 50 12 30 Z" fill="rgba(240,230,210,0.9)" stroke="rgba(200,180,150,0.6)" strokeWidth="0.8" />
            {/* Feather barbs — right */}
            <path d="M 14 10 Q 24 22 25 45 Q 27 58 24 72 L 16 65 Q 18 50 16 30 Z" fill="rgba(250,240,220,0.8)" stroke="rgba(200,180,150,0.6)" strokeWidth="0.8" />
            {/* Vane center line */}
            <line x1="14" y1="14" x2="14" y2="62" stroke="rgba(170,150,120,0.5)" strokeWidth="0.8" />
            {/* Nib tip */}
            <path d="M 14 108 L 11 118 L 14 114 L 17 118 Z" fill="#3a2a18" />
            <circle cx="14" cy="111" r="1.5" fill="#080810" opacity="0.8" />
          </svg>
        </div>
      </div>
    </div>
  );
}
