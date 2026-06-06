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
    tailColor: "#e6b84d",
    offset: 0,
    swayDelay: 0,
  },
  {
    id: "drafts",
    label: "草稿",
    color: "var(--cine-ribbon-blue)",
    tailColor: "#7baed4",
    offset: 32,
    swayDelay: 0.3,
  },
  {
    id: "project",
    label: "项目",
    color: "var(--cine-ribbon-green)",
    tailColor: "#7db886",
    offset: 64,
    swayDelay: 0.6,
  },
  {
    id: "exports",
    label: "导出",
    color: "var(--cine-ribbon-silver)",
    tailColor: "#a0a0a0",
    offset: 96,
    swayDelay: 0.9,
  },
];

export default function SilkBookmarks({ activeNav, onNavigate, visible }: Props) {
  return (
    <div
      className="absolute -top-3 z-20 pointer-events-none"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {RIBBONS.map((ribbon, i) => {
        const isActive =
          activeNav === ribbon.id ||
          (ribbon.id === "edit" &&
            activeNav !== "project" &&
            activeNav !== "drafts" &&
            activeNav !== "exports");

        return (
          <div
            key={ribbon.id}
            className="absolute pointer-events-auto"
            style={{
              top: 0,
              left: -64 + ribbon.offset,
              transition: "all 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)",
              transitionDelay: `${visible ? i * 0.08 : 0}s`,
              transform: visible
                ? "translateY(0) scale(1)"
                : "translateY(-18px) scale(0.9)",
              opacity: visible ? 1 : 0,
            }}
          >
            <div
              className="relative cursor-pointer group"
              onClick={() => onNavigate(ribbon.id)}
            >
              {/* SVG ribbon — organic silk shape */}
              <svg
                width="24"
                height={isActive ? 120 : 70}
                viewBox={isActive ? "0 0 24 120" : "0 0 24 70"}
                className="transition-all duration-300 block"
              >
                <defs>
                  {/* Silk sheen gradient */}
                  <linearGradient
                    id={`silk-${ribbon.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={ribbon.tailColor} stopOpacity="0.8" />
                    <stop offset="35%" stopColor={ribbon.tailColor} stopOpacity="1" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.35)" />
                    <stop offset="65%" stopColor={ribbon.tailColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={ribbon.tailColor} stopOpacity="0.7" />
                  </linearGradient>

                  {/* Shadow */}
                  <filter id={`shadow-${ribbon.id}`}>
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="3"
                      floodColor="#000"
                      floodOpacity="0.25"
                    />
                  </filter>
                </defs>

                {/* Knot at top */}
                <ellipse
                  cx="12"
                  cy="5"
                  rx="10"
                  ry="5"
                  fill={ribbon.tailColor}
                  filter={`url(#shadow-${ribbon.id})`}
                />
                <ellipse
                  cx="12"
                  cy="4"
                  rx="8"
                  ry="3.5"
                  fill={ribbon.tailColor}
                  opacity="0.6"
                />

                {/* Ribbon tail — organic curved path */}
                <path
                  d={
                    isActive
                      ? "M 6 8 Q 4 40 4 70 Q 4 100 8 114 Q 11 118 12 118 Q 13 118 16 114 Q 20 100 20 70 Q 20 40 18 8 Z"
                      : "M 7 8 Q 5 35 5 55 Q 5 65 8 66 Q 10 67 10 66 Q 10 65 8 60 Q 7 50 8 38 Q 10 25 17 8 Z"
                  }
                  fill={`url(#silk-${ribbon.id})`}
                  filter={`url(#shadow-${ribbon.id})`}
                />

                {/* Ribbon fold highlight */}
                <path
                  d={
                    isActive
                      ? "M 8 8 Q 7 50 8 95"
                      : "M 9 8 Q 8 30 9 45"
                  }
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>

              {/* Label */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 text-[10px] font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "opacity-100 -bottom-5"
                    : "opacity-0 group-hover:opacity-100 -bottom-5"
                }`}
                style={{ color: ribbon.tailColor }}
              >
                {ribbon.label}
              </div>

              {/* Active dot */}
              {isActive && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: ribbon.tailColor,
                    boxShadow: `0 0 6px ${ribbon.tailColor}`,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
