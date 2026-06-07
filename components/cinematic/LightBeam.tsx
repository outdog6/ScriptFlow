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
      {/* Main light cone — uses CSS variable for palette cycling */}
      <div
        className="absolute"
        style={{
          top: 40,
          left: 180,
          width: 800,
          height: 650,
          background: `
            linear-gradient(
              155deg,
              var(--cine-beam) 0%,
              rgba(255, 179, 71, 0.08) 25%,
              rgba(255, 160, 50, 0.03) 55%,
              transparent 100%
            )
          `,
          clipPath: "polygon(0% 0%, 85% 3%, 100% 100%, 5% 90%)",
          filter: "blur(25px)",
        }}
      />

      {/* Warm glow around lamp */}
      <div
        className="absolute rounded-full"
        style={{
          top: -60,
          left: 80,
          width: 360,
          height: 360,
          background: `
            radial-gradient(
              circle,
              var(--cine-beam) 0%,
              rgba(255, 179, 71, 0.04) 50%,
              transparent 70%
            )
          `,
          filter: "blur(2px)",
        }}
      />

      {/* Pool of light on the desk */}
      <div
        className="absolute"
        style={{
          top: "35%",
          left: "20%",
          width: "60%",
          height: "50%",
          background: `
            radial-gradient(
              ellipse at 35% 15%,
              var(--cine-beam) 0%,
              rgba(255, 160, 50, 0.03) 50%,
              transparent 75%
            )
          `,
        }}
      />
    </div>
  );
}
