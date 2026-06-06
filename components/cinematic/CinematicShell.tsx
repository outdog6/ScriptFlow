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
  const inkDropRef = useRef<HTMLDivElement>(null);

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

    // 1. Quill lifts from bottle
    tl.to(quillRef.current, { y: -20, rotate: -15, duration: 0.3, ease: "power2.out" })
      // 2. Dip into ink (tiny pause)
      .to(quillRef.current, { y: -20, scaleX: 0.95, duration: 0.1 })
      .to(quillRef.current, { scaleX: 1, duration: 0.1 })
      // 3. Move to parchment
      .to(quillRef.current, { x: 55, y: -25, rotate: -25, duration: 0.4, ease: "power2.inOut" })
      // 4. Writing wiggle
      .to(quillRef.current, { x: 60, y: -28, duration: 0.08 })
      .to(quillRef.current, { x: 52, y: -24, duration: 0.08 })
      .to(quillRef.current, { x: 58, y: -27, duration: 0.08 })
      .to(quillRef.current, { x: 50, y: -23, duration: 0.08 })
      // 5. Ink drop appears on parchment
      .call(() => {
        if (inkDropRef.current) inkDropRef.current.style.opacity = "1";
      })
      // 6. Trigger download
      .call(() => {
        if (format === "yaml") {
          const fixed = yaml.replace(/title:\s*".*?"/, `title: "${scriptTitle}"`);
          download(fixed, "yaml", "text/yaml");
        } else if (script) {
          download(exportFountain(script), "fountain", "text/plain");
        }
      })
      // 7. Return to bottle
      .to({}, { duration: 0.3 })
      .to(quillRef.current, { x: 0, y: 0, rotate: 0, duration: 0.5, ease: "power2.in" })
      // 8. Hide ink drop
      .call(() => {
        if (inkDropRef.current) inkDropRef.current.style.opacity = "0";
      });
  }, [writing, yaml, scriptTitle, script, download]);

  if (!hasContent) return null;

  return (
    <div className="relative flex items-end gap-4">
      {/* Format selector dropdown */}
      {open && (
        <div className="absolute bottom-full right-0 mb-3 bg-[#2a221a] border border-[rgba(255,255,255,0.08)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] min-w-[140px] z-10">
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

      {/* Parchment paper */}
      <div
        className="relative w-16 h-20 rounded-sm flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #f0e6c8 0%, #e8d8a8 40%, #f2e4c0 100%)",
          boxShadow: "1px 2px 8px rgba(0,0,0,0.3), inset 0 0 30px rgba(180,150,100,0.1)",
          border: "1px solid rgba(180,150,100,0.3)",
        }}
      >
        {/* Parchment curl top-right */}
        <div
          className="absolute -top-1 -right-1 w-4 h-4"
          style={{
            background: "linear-gradient(135deg, #e0d0a0 0%, #f0e6c8 60%)",
            borderRadius: "0 0 0 4px",
            boxShadow: "-1px 1px 2px rgba(0,0,0,0.15)",
          }}
        />
        {/* Ink drop on parchment */}
        <div
          ref={inkDropRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-opacity duration-200"
          style={{
            background: "radial-gradient(circle, #0a0a14 60%, #1a1a2e 100%)",
            opacity: 0,
          }}
        />
      </div>

      {/* Ink bottle + quill */}
      <div className="relative flex-shrink-0 cursor-pointer" onClick={() => setOpen(!open)}>
        {/* Ink bottle */}
        <div
          className="w-12 h-14 rounded-b-xl rounded-t-md relative"
          style={{
            background: "linear-gradient(135deg, rgba(40,30,20,0.7) 0%, rgba(20,15,10,0.9) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {/* Glass highlight */}
          <div
            className="absolute left-1.5 top-2 w-2 h-8 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          {/* Ink level */}
          <div
            className="absolute bottom-2 left-1.5 right-1.5 h-6 rounded-b-lg"
            style={{
              background: "linear-gradient(to bottom, #0a0a14 0%, #1a1a2e 60%, #0d0d18 100%)",
            }}
          />
          {/* Bottle neck */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-3 rounded-t-md"
            style={{
              background: "linear-gradient(135deg, #3a3028, #2a2018)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          />
        </div>

        {/* Feather quill */}
        <div
          ref={quillRef}
          className="absolute -top-2 left-1/2 -translate-x-1/2"
          style={{ transformOrigin: "bottom center" }}
        >
          <svg width="18" height="70" viewBox="0 0 18 70" className="overflow-visible">
            {/* Quill shaft */}
            <line x1="9" y1="5" x2="9" y2="68" stroke="#d4c8a0" strokeWidth="1" />
            <line x1="9" y1="5" x2="9" y2="68" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

            {/* Feather barbs — left side */}
            <path
              d="M 9 8 Q 3 15 2 28 Q 1 35 3 42 L 8 38 Q 7 30 8 20 Z"
              fill="rgba(230,220,200,0.9)"
              stroke="rgba(200,180,150,0.5)"
              strokeWidth="0.5"
            />
            {/* Feather barbs — right side */}
            <path
              d="M 9 8 Q 15 15 16 28 Q 17 35 15 42 L 10 38 Q 11 30 10 20 Z"
              fill="rgba(240,230,210,0.8)"
              stroke="rgba(200,180,150,0.5)"
              strokeWidth="0.5"
            />
            {/* Central vane line */}
            <line x1="9" y1="10" x2="9" y2="38" stroke="rgba(180,160,130,0.4)" strokeWidth="0.5" />

            {/* Tip (nib) */}
            <path
              d="M 9 65 L 7 70 L 9 68 L 11 70 Z"
              fill="#3a3028"
            />
            {/* Ink on nib */}
            <circle cx="9" cy="66" r="1" fill="#0a0a14" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Label */}
      <div
        className="absolute -bottom-6 left-0 right-0 text-center text-[10px] whitespace-nowrap text-[var(--apple-secondary)]"
        style={{ opacity: open ? 1 : 0, transition: "opacity 0.2s" }}
      >
        蘸墨导出
      </div>
    </div>
  );
}
