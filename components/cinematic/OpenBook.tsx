// components/cinematic/OpenBook.tsx
"use client";
import { ReactNode } from "react";

interface Props {
  open: boolean;
  children: ReactNode;
}

export default function OpenBook({ open, children }: Props) {
  return (
    <div className="flex items-center justify-center flex-1 px-8 py-12 cine-desk relative">
      {/* Desk light pool — the circle of light on the desk */}
      <div
        className="absolute rounded-[50%] pointer-events-none"
        style={{
          top: "15%",
          left: "15%",
          width: "70%",
          height: "75%",
          background: `
            radial-gradient(
              ellipse at 35% 15%,
              rgba(255, 179, 71, 0.08) 0%,
              rgba(255, 150, 50, 0.03) 50%,
              transparent 75%
            )
          `,
          opacity: open ? 1 : 0,
          transition: "opacity 1.2s ease-out",
        }}
      />

      {/* Book container */}
      <div
        className="relative flex cine-book-shadow rounded-lg"
        style={{
          width: "92%",
          maxWidth: 1100,
          minHeight: 560,
          transition: "all 1s cubic-bezier(0.34, 1.3, 0.64, 1)",
          ...(open
            ? {
                transform: "rotateX(0deg) scale(1)",
                opacity: 1,
              }
            : {
                transform: "rotateX(12deg) scale(0.94)",
                opacity: 0,
              }),
        }}
      >
        {/* Book cover backing — visible behind pages */}
        <div
          className="absolute -inset-2 rounded-lg pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #5c3d2e 0%, #4a3020 40%, #3d2518 100%)",
            borderRadius: "10px 12px 12px 10px",
            zIndex: -2,
          }}
        />

        {/* Page stack — creates thickness illusion behind content */}
        <div className="absolute inset-0 rounded-r-md pointer-events-none" style={{ background: "#e6d9c0", transform: "translateX(3px) translateY(2px)", zIndex: -1 }} />
        <div className="absolute inset-0 rounded-r-md pointer-events-none" style={{ background: "#ece2cc", transform: "translateX(1.5px) translateY(1px)", zIndex: -1 }} />

        {/* Spine shadow gradient — left page */}
        {open && (
          <>
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{
                left: "50%",
                width: 24,
                transform: "translateX(-100%)",
                background: "linear-gradient(to right, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 100%)",
              }}
            />
            {/* Spine shadow — right page (deeper) */}
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{
                left: "50%",
                width: 28,
                background: "linear-gradient(to left, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.03) 100%)",
              }}
            />
            {/* Spine crease */}
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{
                left: "calc(50% - 0.5px)",
                width: 1,
                background: "rgba(0,0,0,0.08)",
              }}
            />
          </>
        )}

        {/* Page content — positioned above backing layers */}
        {open && (
          <div className="relative flex flex-1" style={{ zIndex: 0 }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
