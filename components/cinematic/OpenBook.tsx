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
