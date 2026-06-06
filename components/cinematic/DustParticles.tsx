// components/cinematic/DustParticles.tsx
"use client";

interface Props {
  visible: boolean;
}

const PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: 15 + Math.random() * 65,
  top: 10 + Math.random() * 75,
  size: 1.5 + Math.random() * 3,
  delay: Math.random() * 4,
  duration: 5 + Math.random() * 10,
  drift: (Math.random() - 0.5) * 60,
}));

export default function DustParticles({ visible }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-35"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 1.5s ease-out",
      }}
    >
      <div
        className="absolute overflow-hidden"
        style={{
          top: 30,
          left: 160,
          width: 750,
          height: 650,
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
              background: p.size > 2.5
                ? "rgba(255, 220, 150, 0.9)"
                : "rgba(255, 200, 120, 0.6)",
              boxShadow: p.size > 2.5
                ? `0 0 ${p.size * 3}px rgba(255, 200, 100, 0.5)`
                : `0 0 ${p.size * 2}px rgba(255, 180, 80, 0.3)`,
              animation: visible
                ? `dustFloat ${p.duration}s ${p.delay}s infinite ease-in-out`
                : "none",
              // @ts-expect-error CSS custom properties
              "--drift": `${p.drift}px`,
              "--size": `${p.size}px`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes dustFloat {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          5%   { opacity: 1; }
          85%  { opacity: 0.8; }
          100% { transform: translate(var(--drift), -40px) scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
