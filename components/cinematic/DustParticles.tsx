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
      className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-1000"
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
