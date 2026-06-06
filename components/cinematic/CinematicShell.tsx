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
    tl.to(quillRef.current, { y: -30, rotate: -10, duration: 0.25, ease: "power2.out" })
      // 2. Dip — quick micro shake
      .to(quillRef.current, { scaleX: 0.9, duration: 0.08 })
      .to(quillRef.current, { scaleX: 1, duration: 0.08 })
      // 3. Rise to top of parchment strip
      .to(quillRef.current, { x: -20, y: -100, rotate: -20, duration: 0.45, ease: "power2.inOut" })
      // 4. Draw wavy line down the strip
      .to(quillRef.current, { x: -18, y: -85, duration: 0.15 })
      .to(quillRef.current, { x: -22, y: -70, duration: 0.15 })
      .to(quillRef.current, { x: -18, y: -55, duration: 0.15 })
      .to(quillRef.current, { x: -22, y: -40, duration: 0.15 })
      .to(quillRef.current, { x: -18, y: -25, duration: 0.15 })
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
          inkLineRef.current.style.strokeDashoffset = "100";
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

      {/* Long parchment strip — above the inkwell */}
      <div
        className="relative mx-auto mb-1 w-6 rounded-sm"
        style={{
          height: 88,
          background: "linear-gradient(180deg, #f2e8cc 0%, #e8d8a8 50%, #f0e4c0 100%)",
          boxShadow: "1px 2px 8px rgba(0,0,0,0.25), inset 0 0 20px rgba(180,150,100,0.1)",
          border: "1px solid rgba(180,150,100,0.2)",
        }}
      >
        {/* Top tear / curl */}
        <div
          className="absolute -top-1 left-0 right-0 h-2"
          style={{
            background: "linear-gradient(180deg, #ddd0a0, #f2e8cc)",
            borderRadius: "1px 1px 0 0",
          }}
        />

        {/* Wavy ink stroke — hidden until animation */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 88"
          preserveAspectRatio="none"
          className="absolute inset-0"
          style={{ overflow: "visible" }}
        >
          <path
            ref={inkLineRef}
            d="M 12 4 Q 8 15 12 22 Q 16 30 12 38 Q 8 46 12 54 Q 16 62 12 70 Q 8 78 12 84"
            stroke="#0a0a14"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            style={{
              opacity: 0,
              strokeDasharray: 100,
              strokeDashoffset: 100,
              transition: "stroke-dashoffset 1s ease-out, opacity 0.3s ease-out",
            }}
          />
        </svg>
      </div>

      {/* Ink bottle + quill */}
      <div className="relative cursor-pointer mx-auto w-fit" onClick={() => setOpen(!open)}>
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
            <line x1="9" y1="5" x2="9" y2="68" stroke="#d4c8a0" strokeWidth="1" />
            <line x1="9" y1="5" x2="9" y2="68" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <path d="M 9 8 Q 3 15 2 28 Q 1 35 3 42 L 8 38 Q 7 30 8 20 Z" fill="rgba(230,220,200,0.9)" stroke="rgba(200,180,150,0.5)" strokeWidth="0.5" />
            <path d="M 9 8 Q 15 15 16 28 Q 17 35 15 42 L 10 38 Q 11 30 10 20 Z" fill="rgba(240,230,210,0.8)" stroke="rgba(200,180,150,0.5)" strokeWidth="0.5" />
            <line x1="9" y1="10" x2="9" y2="38" stroke="rgba(180,160,130,0.4)" strokeWidth="0.5" />
            <path d="M 9 65 L 7 70 L 9 68 L 11 70 Z" fill="#3a3028" />
            <circle cx="9" cy="66" r="1" fill="#0a0a14" opacity="0.7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
