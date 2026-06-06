# Cinematic Desk Lamp — ScriptFlow Plan B

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the standard 3-column layout with a cinematic writer's desk experience — desk lamp, open book, silk bookmarks, GSAP animations.

**Architecture:** New `components/cinematic/` directory with 6 self-contained components. `app/page.tsx` rewritten to use a `CinematicShell` wrapper that composes existing child components (Dropzone, NovelView, ScriptView, YamlView, FountainView) inside book pages. Zero modifications to existing components — rollback is a single `git checkout dev`.

**Tech Stack:** Next.js 14, React 18, Tailwind 3, GSAP, existing AppContext

**Design decisions (per user approval):**
- Bookmarks as silk ribbons from book spine (gold=chapters, blue=drafts, green=projects, silver=exports)
- Desk lamp top-left, Pixar-style, beam down-right
- First visit: full animation. Repeat: lamp stays on, book open, 1s micro-animation
- Forced dark cinematic theme (light mode shelved)
- Toolbar redistributed: title/author → page header, convert → lamp chain, export → ink bottle, theme → bulb color temp
- Mobile not addressed in this iteration

---

## File Map

```
Create:
  components/cinematic/DeskLamp.tsx        — SVG lamp + pull chain + bulb glow
  components/cinematic/LightBeam.tsx       — CSS clip-path light cone
  components/cinematic/DustParticles.tsx   — CSS dot particles in beam
  components/cinematic/OpenBook.tsx         — book container, open/close animation
  components/cinematic/SilkBookmarks.tsx    — ribbon nav from spine
  components/cinematic/CinematicShell.tsx   — orchestrator, GSAP timeline, layout

  lib/useFirstVisit.ts                     — localStorage flag for animation gating

Modify:
  app/globals.css                          — add cinematic CSS variable layer
  app/page.tsx                             — rewrite to cinematic layout
  package.json                             — add gsap dependency
```

---

### Task 1: Create feature branch + install GSAP

- [ ] **Step 1: Create and switch to new branch**

```bash
git checkout -b feat/cinematic-desk-lamp
```

- [ ] **Step 2: Install GSAP**

```bash
npm install gsap
```

Expected: `gsap` added to `package.json` dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add gsap dependency"
```

---

### Task 2: Cinematic CSS foundation

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append cinematic CSS variables and base styles to globals.css**

Append the following after line 57 (end of scrollbar styles):

```css
/* ============================================
   Cinematic Desk Mode (forced dark)
   ============================================ */

html[data-cinematic] {
  --cine-bg: #0a0a0c;
  --cine-desk: #141210;
  --cine-book-cover: #2c2218;
  --cine-book-spine: #3d3224;
  --cine-book-page: #f4f0e6;
  --cine-page-text: #2c2416;
  --cine-page-secondary: #6b5e4e;
  --cine-bulb: #ffb74d;
  --cine-beam: rgba(255, 183, 77, 0.10);
  --cine-accent: #e6a23c;
  --cine-ribbon-gold: #d4a843;
  --cine-ribbon-blue: #5b8ec9;
  --cine-ribbon-green: #5e9b6e;
  --cine-ribbon-silver: #8a8a8a;
}

html[data-cinematic] body {
  background: var(--cine-bg);
  color: #d4cfc4;
}

html[data-cinematic] .dark {
  --apple-bg: var(--cine-bg);
  --apple-white: #1a1816;
  --apple-text: #d4cfc4;
  --apple-secondary: #8a8070;
  --apple-blue: var(--cine-accent);
  --apple-blue-hover: #f0b840;
  --apple-border: rgba(255, 255, 255, 0.06);
  --apple-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
}

/* Book page content resets — override dark panel styles inside book */
.cine-page {
  background: var(--cine-book-page);
  color: var(--cine-page-text);
}

.cine-page ::-webkit-scrollbar-thumb {
  background: rgba(139, 119, 90, 0.3);
}

/* Desk surface texture */
.cine-desk {
  background:
    radial-gradient(ellipse at 50% 50%, #1a1814 0%, #0a0a0c 100%);
}

/* Page paper texture */
.cine-page-texture {
  background-image:
    linear-gradient(0deg, transparent 24%, rgba(139, 119, 90, 0.03) 25%, rgba(139, 119, 90, 0.03) 26%, transparent 27%, transparent 74%, rgba(139, 119, 90, 0.03) 75%, rgba(139, 119, 90, 0.03) 76%, transparent 77%),
    linear-gradient(90deg, transparent 24%, rgba(139, 119, 90, 0.02) 25%, rgba(139, 119, 90, 0.02) 26%, transparent 27%);
  background-size: 24px 24px;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add cinematic CSS variable layer with forced dark mode"
```

---

### Task 3: Create useFirstVisit hook

**Files:**
- Create: `lib/useFirstVisit.ts`

- [ ] **Step 1: Write the hook**

```typescript
// lib/useFirstVisit.ts
"use client";
import { useState, useEffect } from "react";

const KEY = "scriptflow-cinematic-visited";

export function useFirstVisit(): boolean {
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    try {
      const visited = localStorage.getItem(KEY);
      if (visited) {
        setIsFirst(false);
      } else {
        localStorage.setItem(KEY, "1");
      }
    } catch {
      // localStorage unavailable, treat as first visit
    }
  }, []);

  return isFirst;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/useFirstVisit.ts
git commit -m "feat: add useFirstVisit hook for animation gating"
```

---

### Task 4: Create DeskLamp component

**Files:**
- Create: `components/cinematic/DeskLamp.tsx`

- [ ] **Step 1: Create the component directory**

```bash
mkdir -p components/cinematic
```

- [ ] **Step 2: Write DeskLamp.tsx**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/DeskLamp.tsx
git commit -m "feat: add DeskLamp component with SVG lamp, pull chain, color palette cycling"
```

---

### Task 5: Create LightBeam + DustParticles

**Files:**
- Create: `components/cinematic/LightBeam.tsx`
- Create: `components/cinematic/DustParticles.tsx`

- [ ] **Step 1: Write LightBeam.tsx**

```typescript
// components/cinematic/LightBeam.tsx
"use client";

interface Props {
  visible: boolean;
}

export default function LightBeam({ visible }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-1000"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Main beam — large polygon from lamp to book */}
      <div
        className="absolute"
        style={{
          top: 52,
          left: 200,
          width: 0,
          height: 0,
          filter: "blur(2px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 700,
            height: 600,
            background: `
              linear-gradient(
                160deg,
                var(--cine-beam) 0%,
                rgba(255, 183, 77, 0.04) 30%,
                rgba(255, 183, 77, 0.01) 60%,
                transparent 100%
              )
            `,
            clipPath: "polygon(0% 0%, 100% 5%, 95% 100%, 5% 95%)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* Secondary warm glow — wider, softer */}
      <div
        className="absolute"
        style={{
          top: -100,
          left: -100,
          width: 600,
          height: 600,
          background: `
            radial-gradient(
              ellipse at 200px 150px,
              rgba(255, 183, 77, 0.06) 0%,
              rgba(255, 183, 77, 0.02) 40%,
              transparent 70%
            )
          `,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Write DustParticles.tsx**

```typescript
// components/cinematic/DustParticles.tsx
"use client";

interface Props {
  visible: boolean;
}

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: 30 + Math.random() * 50,
  top: 15 + Math.random() * 70,
  size: 1 + Math.random() * 2.5,
  delay: Math.random() * 3,
  duration: 4 + Math.random() * 8,
  drift: (Math.random() - 0.5) * 40,
}));

export default function DustParticles({ visible }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-45 transition-opacity duration-1000"
      style={{ opacity: visible ? 0.7 : 0 }}
    >
      {/* Contain particles within the beam area */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: 40,
          left: 190,
          width: 700,
          height: 600,
        }}
      >
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: "rgba(255, 220, 160, 0.8)",
              boxShadow: `0 0 ${p.size * 2}px rgba(255, 200, 120, 0.3)`,
              animation: visible
                ? `dustDrift ${p.duration}s ${p.delay}s infinite ease-in-out`
                : "none",
              // @ts-expect-error CSS custom properties for animation
              "--drift": `${p.drift}px`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes dustDrift {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translate(var(--drift), -30px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/cinematic/LightBeam.tsx components/cinematic/DustParticles.tsx
git commit -m "feat: add LightBeam and DustParticles cinematic components"
```

---

### Task 6: Create OpenBook component

**Files:**
- Create: `components/cinematic/OpenBook.tsx`

- [ ] **Step 1: Write OpenBook.tsx**

```typescript
// components/cinematic/OpenBook.tsx
"use client";
import { ReactNode } from "react";

interface Props {
  open: boolean;
  children: ReactNode;
}

export default function OpenBook({ open, children }: Props) {
  return (
    <div className="flex items-center justify-center flex-1 px-8 py-10 cine-desk">
      {/* Book container */}
      <div
        className="relative flex transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          width: "92%",
          maxWidth: 1200,
          minHeight: 640,
          ...(open
            ? {
                transform: "rotateX(0deg) scale(1)",
                opacity: 1,
                filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
              }
            : {
                transform: "rotateX(15deg) scale(0.92)",
                opacity: 0,
                filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))",
              }),
        }}
      >
        {/* Book spine shadow (center crease) */}
        {open && (
          <>
            {/* Left page shadow on spine */}
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{
                left: "50%",
                width: 30,
                transform: "translateX(-100%)",
                background: "linear-gradient(to right, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.03) 100%)",
              }}
            />
            {/* Right page shadow on spine */}
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{
                left: "50%",
                width: 30,
                background: "linear-gradient(to left, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 100%)",
              }}
            />
            {/* Spine crease line */}
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{
                left: "calc(50% - 0.5px)",
                width: 1,
                background: "rgba(0,0,0,0.12)",
              }}
            />
          </>
        )}

        {/* Book shadow underneath */}
        <div
          className="absolute -bottom-4 left-2 right-2 h-8 rounded-full bg-black/40 blur-md transition-opacity duration-1000"
          style={{ opacity: open ? 1 : 0 }}
        />

        {/* Children are the two pages */}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/cinematic/OpenBook.tsx
git commit -m "feat: add OpenBook component with spine shadow and open/close animation"
```

---

### Task 7: Create SilkBookmarks component

**Files:**
- Create: `components/cinematic/SilkBookmarks.tsx`

- [ ] **Step 1: Write SilkBookmarks.tsx**

```typescript
// components/cinematic/SilkBookmarks.tsx
"use client";
import { BookOpen, FileText, Download } from "lucide-react";

interface Props {
  activeNav: string;
  onNavigate: (id: string) => void;
  visible: boolean;
}

const RIBBONS = [
  {
    id: "edit",
    label: "章节",
    color: "var(--cine-ribbon-gold)",
    icon: <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />,
    offset: 0,
  },
  {
    id: "drafts",
    label: "草稿",
    color: "var(--cine-ribbon-blue)",
    icon: <FileText className="w-3.5 h-3.5" strokeWidth={2} />,
    offset: 28,
  },
  {
    id: "project",
    label: "项目",
    color: "var(--cine-ribbon-green)",
    icon: <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />,
    offset: 56,
  },
  {
    id: "exports",
    label: "导出",
    color: "var(--cine-ribbon-silver)",
    icon: <Download className="w-3.5 h-3.5" strokeWidth={2} />,
    offset: 84,
  },
];

export default function SilkBookmarks({ activeNav, onNavigate, visible }: Props) {
  return (
    <div
      className="absolute -top-2 z-20 pointer-events-none transition-opacity duration-700"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        opacity: visible ? 1 : 0,
      }}
    >
      {RIBBONS.map((ribbon, i) => {
        const isActive = activeNav === ribbon.id || (ribbon.id === "edit" && activeNav !== "project" && activeNav !== "drafts" && activeNav !== "exports");
        return (
          <div
            key={ribbon.id}
            className="absolute pointer-events-auto"
            style={{
              top: -12,
              left: -60 + ribbon.offset,
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transitionDelay: `${visible ? i * 0.1 : 0}s`,
              transform: visible
                ? `translateY(0) rotate(0deg)`
                : `translateY(-20px) rotate(${(i - 1.5) * 5}deg)`,
              opacity: visible ? 1 : 0,
            }}
          >
            {/* Ribbon body */}
            <div
              className="relative cursor-pointer group"
              onClick={() => onNavigate(ribbon.id)}
            >
              {/* Ribbon tail */}
              <div
                className="w-5 rounded-b-sm transition-all duration-300"
                style={{
                  height: isActive ? 100 : 55,
                  background: `linear-gradient(to bottom, ${ribbon.color}, ${ribbon.color}dd)`,
                  boxShadow: isActive
                    ? `0 2px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)`
                    : "0 1px 4px rgba(0,0,0,0.2)",
                }}
              />

              {/* V-cut at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: `8px solid ${ribbon.color}`,
                  borderTopColor: ribbon.color,
                  margin: "0 auto",
                }}
              />

              {/* Label on hover + active */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium transition-all duration-200 ${
                  isActive ? "opacity-100 -bottom-7" : "opacity-0 group-hover:opacity-100 -bottom-7"
                }`}
                style={{ color: ribbon.color }}
              >
                {ribbon.label}
              </div>

              {/* Active indicator dot */}
              {isActive && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-2 h-2 rounded-full"
                  style={{ background: ribbon.color, boxShadow: `0 0 6px ${ribbon.color}` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/cinematic/SilkBookmarks.tsx
git commit -m "feat: add SilkBookmarks ribbon navigation from book spine"
```

---

### Task 8: Create CinematicShell (GSAP orchestrator)

**Files:**
- Create: `components/cinematic/CinematicShell.tsx`

- [ ] **Step 1: Write CinematicShell.tsx**

```typescript
// components/cinematic/CinematicShell.tsx
"use client";
import { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import gsap from "gsap";
import DeskLamp, { cyclePalette } from "./DeskLamp";
import LightBeam from "./LightBeam";
import DustParticles from "./DustParticles";
import OpenBook from "./OpenBook";
import SilkBookmarks from "./SilkBookmarks";
import { useFirstVisit } from "@/lib/useFirstVisit";

interface Props {
  converting: boolean;
  activeNav: string;
  onNavigate: (id: string) => void;
  onConvert: () => void;
  children: ReactNode; // book page content (left + right)
}

export default function CinematicShell({
  converting,
  activeNav,
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
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Force cinematic dark mode
  useEffect(() => {
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
        tl.to({}, { duration: 0.3 }) // chain pull settle
          .call(() => setLampOn(true))
          .to({}, { duration: 0.5 }) // bulb warm-up
          .call(() => setBeamVisible(true))
          .to({}, { duration: 0.8 }) // beam spread
          .call(() => setBookOpen(true))
          .to({}, { duration: 0.4 }) // book settles
          .call(() => setBookmarksVisible(true));
      } else {
        // Quick 0.6s micro-animation for repeats
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

        {/* Page content (children are the left and right pages) */}
        {children}
      </OpenBook>

      {/* Inkwell export button — bottom-right of desk */}
      {bookOpen && (
        <div className="absolute bottom-8 right-12 z-50">
          <InkwellExport />
        </div>
      )}
    </div>
  );
}

/* Small inkwell component for export metaphor */
function InkwellExport() {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative cursor-pointer group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Inkwell body */}
      <div
        className="w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #2a2420, #1a1612)",
          boxShadow: hover
            ? "0 4px 16px rgba(0,0,0,0.5), 0 0 12px rgba(255,183,77,0.15)"
            : "0 2px 8px rgba(0,0,0,0.4)",
          transform: hover ? "translateY(-2px)" : "none",
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
          hover ? "opacity-100" : "opacity-0"
        }`}
        style={{ color: "var(--apple-secondary)" }}
      >
        导出
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/cinematic/CinematicShell.tsx
git commit -m "feat: add CinematicShell orchestrator with GSAP timeline and inkwell export"
```

---

### Task 9: Rewrite app/page.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Read existing types needed for the new page**

(Already done — see EditorPanel, PreviewPanel interfaces above.)

- [ ] **Step 2: Rewrite page.tsx**

```typescript
// app/page.tsx
"use client";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import Toast from "@/components/Toast";
import Dropzone from "@/components/Dropzone";
import NovelView from "@/components/NovelView";
import ScriptView from "@/components/ScriptView";
import YamlView from "@/components/YamlView";
import FountainView from "@/components/FountainView";
import DraftsView from "@/components/DraftsView";
import ProjectsView from "@/components/ProjectsView";
import CinematicShell from "@/components/cinematic/CinematicShell";

export default function Home() {
  const {
    mode,
    chapters,
    activeChapter,
    yaml,
    script,
    editorTab,
    previewTab,
    converting,
    drafts,
    activeNav,
    loadText,
    updateChapterContent,
    setEditorTab,
    setPreviewTab,
    setActiveChapter,
    setScript,
    autoSaveDraft,
    removeDraft,
    restoreDraft,
    setConverting,
    setActiveNav,
    projects,
    activeProjectId,
    createNewProject,
    switchProject,
    removeProject,
  } = useApp();

  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [title, setTitle] = useState("未命名作品");
  const [author, setAuthor] = useState("未知");

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, chapters }),
      });
      const data = await res.json();
      if (data.error) {
        setToast({ message: "转换失败：" + data.error, type: "error" });
      } else {
        setScript(data.yaml, data.script);
        setEditorTab("script");
        autoSaveDraft(data.script.meta.title, data.yaml, data.script, chapters);
        setToast({ message: "剧本已自动保存到草稿", type: "success" });
      }
    } catch (err) {
      setToast({ message: "请求失败：" + String(err), type: "error" });
    } finally {
      setConverting(false);
    }
  };

  const isEditing = activeNav !== "project" && activeNav !== "drafts" && activeNav !== "exports";

  return (
    <CinematicShell
      converting={converting}
      activeNav={activeNav}
      onNavigate={setActiveNav}
      onConvert={handleConvert}
    >
      {isEditing ? (
        <>
          {/* ===== LEFT PAGE: Editor content ===== */}
          <div className="flex-1 cine-page cine-page-texture flex flex-col min-w-0 rounded-l-md overflow-hidden border-r border-[rgba(139,119,90,0.15)]">
            {/* Page header: title, author, tab toggle */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(139,119,90,0.12)]">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5 bg-[rgba(139,119,90,0.08)] p-0.5 rounded-md">
                  {(["novel", "script"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEditorTab(tab)}
                      className={`px-4 py-1.5 text-[12px] font-medium rounded transition-all duration-200 ${
                        editorTab === tab
                          ? "bg-[var(--cine-book-page)] text-[var(--cine-page-text)] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                          : "text-[var(--cine-page-secondary)] hover:text-[var(--cine-page-text)]"
                      }`}
                    >
                      {tab === "novel" ? "原文" : "剧本"}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-[rgba(139,119,90,0.15)]" />

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="作品标题"
                  className="w-28 bg-transparent text-[13px] font-medium text-[var(--cine-page-text)] placeholder-[var(--cine-page-secondary)] outline-none border-b border-transparent hover:border-[rgba(139,119,90,0.3)] focus:border-[var(--cine-accent)] transition-colors"
                />
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="作者"
                  className="w-16 bg-transparent text-[12px] text-[var(--cine-page-secondary)] placeholder-[var(--cine-page-secondary)] outline-none border-b border-transparent hover:border-[rgba(139,119,90,0.3)] focus:border-[var(--cine-accent)] transition-colors"
                />
              </div>

              <span className="text-[10px] text-[var(--cine-page-secondary)] tracking-wider uppercase">
                ScriptFlow
              </span>
            </div>

            {/* Page content */}
            <div className="flex-1 overflow-y-auto">
              {mode === "upload" ? (
                <Dropzone onTextLoaded={loadText} />
              ) : editorTab === "novel" ? (
                <NovelView
                  chapters={chapters}
                  activeChapter={activeChapter}
                  onSelectChapter={setActiveChapter}
                  onUpdateContent={updateChapterContent}
                />
              ) : script ? (
                <ScriptView script={script} />
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--cine-page-secondary)] text-[14px]">
                  拉动台灯链绳开始 AI 转换
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT PAGE: Preview content ===== */}
          <div className="flex-1 cine-page cine-page-texture flex flex-col min-w-0 rounded-r-md overflow-hidden">
            {!yaml && !script ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[14px] text-[var(--cine-page-secondary)]">
                  生成剧本后将在此预览
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(139,119,90,0.12)]">
                  <div className="flex gap-4">
                    {(["yaml", "fountain"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setPreviewTab(tab)}
                        className={`text-[12px] pb-2 -mb-[1px] font-medium transition-all ${
                          previewTab === tab
                            ? "text-[var(--cine-accent)] border-b-2 border-[var(--cine-accent)]"
                            : "text-[var(--cine-page-secondary)] hover:text-[var(--cine-page-text)]"
                        }`}
                      >
                        {tab === "yaml" ? "YAML" : "Fountain"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  {previewTab === "yaml" ? (
                    <YamlView yaml={yaml} />
                  ) : script ? (
                    <FountainView script={script} />
                  ) : null}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        /* ===== Overlay views for project/drafts/exports ===== */
        <div className="flex-1 cine-page cine-page-texture flex flex-col rounded-md overflow-hidden mx-1">
          <div className="flex items-center px-6 py-3 border-b border-[rgba(139,119,90,0.12)]">
            <h2 className="text-[14px] font-semibold text-[var(--cine-page-text)]">
              {activeNav === "project" ? "我的项目" : activeNav === "drafts" ? "草稿" : "导出记录"}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeNav === "project" ? (
              <ProjectsView
                projects={projects}
                activeProjectId={activeProjectId}
                onCreate={createNewProject}
                onSwitch={switchProject}
                onDelete={removeProject}
              />
            ) : (
              <DraftsView
                drafts={drafts}
                onRestore={restoreDraft}
                onDelete={removeDraft}
              />
            )}
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </CinematicShell>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: rewrite page.tsx with cinematic book layout"
```

---

### Task 10: Verify and polish

- [ ] **Step 1: Run dev server and check for compilation errors**

```bash
npm run dev
```

Expected: No TypeScript or build errors. App loads at `http://localhost:3000`.

- [ ] **Step 2: Manual verification checklist**

Verify each scenario works:
1. **First visit**: Page loads dark, lamp off, chain visible with "拉我" hint → click chain → lamp on, beam spreads, book opens, bookmarks appear, content visible
2. **Convert**: Click chain again → lamp stays on, bulb color cycles, conversion triggers, right page updates with results
3. **Repeat visit** (refresh): Lamp already on, book open, no animation replay
4. **Bookmarks**: Click each ribbon → navigation changes, active ribbon extends longer
5. **Tab toggle**: Click "原文"/"剧本" → left page content switches
6. **Preview tabs**: Click "YAML"/"Fountain" → right page content switches
7. **Import text**: Drop/paste novel text → chapters appear in left page

- [ ] **Step 3: Fix any visual issues**

Common issues to check:
- Book pages scroll independently
- Light beam doesn't block interaction (pointer-events-none is set)
- Chain pull animation smooth (GSAP timeline correct)
- Book spine shadow properly centered between pages
- Bookmarks don't overlap each other at default 28px spacing

- [ ] **Step 4: Clear first-visit flag for testing**

In browser console:
```javascript
localStorage.removeItem("scriptflow-cinematic-visited");
```
Then refresh to re-test first-visit animation.

- [ ] **Step 5: Final commit (if fixes made)**

```bash
git add -A
git commit -m "chore: polish cinematic layout and fix visual issues"
```

---

## Rollback Plan

If Plan B doesn't work out:

```bash
git checkout dev                    # back to original branch
git branch -D feat/cinematic-desk-lamp  # delete feature branch
```

All Plan B code is isolated in `feat/cinematic-desk-lamp`. The `dev` branch and all existing components are untouched.

---

## Known Limitations (accepted for this iteration)

- No mobile adaptation (per user decision)
- Dust particles are CSS dots, not canvas — limited to ~24 particles for performance
- No sound effects
- Export still uses the inkwell button (functional but not yet the full "inkwell with dropdown" metaphor)
- Projects view and drafts view are not yet integrated into the book metaphor — clicking their bookmarks currently navigates but the content area is basic
- GSAP timeline uses empty `to({}, {})` tweens as delays — functional but could be replaced with proper animated properties in a future iteration
