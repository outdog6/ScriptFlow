// components/cinematic/CinematicShell.tsx
"use client";
import { useEffect, useState, useCallback, ReactNode } from "react";
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
  const [lampOn, setLampOn] = useState(!isFirstVisit);
  const [bookOpen, setBookOpen] = useState(!isFirstVisit);
  const [beamVisible, setBeamVisible] = useState(!isFirstVisit);
  const [bookmarksVisible, setBookmarksVisible] = useState(!isFirstVisit);
  const [animating, setAnimating] = useState(false);

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

      {/* Inkwell export button — bottom-right of desk */}
      {bookOpen && (
        <div className="absolute bottom-8 right-12 z-50">
          <InkwellExport yaml={yaml} scriptTitle={scriptTitle} script={script} />
        </div>
      )}
    </div>
  );
}

/* Inkwell export component */
function InkwellExport({ yaml, scriptTitle, script }: { yaml: string; scriptTitle: string; script: ScriptData | null }) {
  const [open, setOpen] = useState(false);

  const download = (content: string, ext: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scriptTitle || "script"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportYaml = () => {
    const fixed = yaml.replace(/title:\s*".*?"/, `title: "${scriptTitle}"`);
    download(fixed, "yaml", "text/yaml");
    setOpen(false);
  };

  const handleExportFountain = () => {
    if (!script) return;
    download(exportFountain(script), "fountain", "text/plain");
    setOpen(false);
  };

  if (!yaml && !script) return null;

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      {/* Dropdown menu */}
      {open && (
        <div className="absolute bottom-14 right-0 mb-2 bg-[#1a1816] border border-[rgba(255,255,255,0.08)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] min-w-[140px]">
          <button
            onClick={handleExportYaml}
            className="block w-full text-left px-3 py-2 text-[12px] text-[#d4cfc4] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-colors"
          >
            导出 YAML
          </button>
          {script && (
            <button
              onClick={handleExportFountain}
              className="block w-full text-left px-3 py-2 text-[12px] text-[#d4cfc4] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-colors"
            >
              导出 Fountain
            </button>
          )}
        </div>
      )}

      {/* Inkwell body */}
      <div
        className="w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer"
        onClick={() => setOpen(!open)}
        style={{
          background: "linear-gradient(135deg, #2a2420, #1a1612)",
          boxShadow: open
            ? "0 4px 16px rgba(0,0,0,0.5), 0 0 12px rgba(255,183,77,0.15)"
            : "0 2px 8px rgba(0,0,0,0.4)",
          transform: open ? "translateY(-2px)" : "none",
        }}
      >
        {/* Ink surface */}
        <div
          className="w-6 h-6 rounded-full"
          style={{
            background: "radial-gradient(circle, #1a1a2e 60%, #0a0a14 100%)",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.1)",
          }}
        />
      </div>

      {/* Label */}
      <div
        className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap transition-all duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        style={{ color: "var(--apple-secondary)" }}
      >
        导出
      </div>
    </div>
  );
}
