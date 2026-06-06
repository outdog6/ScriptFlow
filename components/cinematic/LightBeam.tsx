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
