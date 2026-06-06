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
                ? "translateY(0) rotate(0deg)"
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
                    ? "0 2px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)"
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
                  borderTop: "8px solid transparent",
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
