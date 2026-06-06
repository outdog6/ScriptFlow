// components/cinematic/LightBeam.tsx
"use client";

interface Props {
  visible: boolean;
}

export default function LightBeam({ visible }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease-out",
      }}
    >
      {/* Main light cone from lamp to book */}
      <svg
        className="absolute"
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{ top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,179,71,0.35)" />
            <stop offset="30%" stopColor="rgba(255,179,71,0.15)" />
            <stop offset="60%" stopColor="rgba(255,160,50,0.05)" />
            <stop offset="100%" stopColor="rgba(255,140,30,0)" />
          </linearGradient>
          <filter id="beamBlur">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        {/* Main beam polygon */}
        <polygon
          points="200,50 900,50 1100,800 100,700"
          fill="url(#beamGrad)"
          filter="url(#beamBlur)"
          opacity={0.7}
        />

        {/* Inner sharper beam */}
        <polygon
          points="200,50 500,50 700,650 150,600"
          fill="rgba(255,200,100,0.08)"
          filter="url(#beamBlur)"
        />
      </svg>

      {/* Warm glow on the book area */}
      <div
        className="absolute"
        style={{
          top: "35%",
          left: "25%",
          width: "55%",
          height: "50%",
          background: `
            radial-gradient(
              ellipse at 40% 20%,
              rgba(255, 179, 71, 0.12) 0%,
              rgba(255, 160, 60, 0.04) 40%,
              transparent 70%
            )
          `,
          borderRadius: "50%",
        }}
      />

      {/* Warm ambient glow around lamp */}
      <div
        className="absolute rounded-full"
        style={{
          top: -60,
          left: 80,
          width: 360,
          height: 360,
          background: "radial-gradient(circle, rgba(255,179,71,0.25) 0%, rgba(255,160,50,0.06) 50%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}
