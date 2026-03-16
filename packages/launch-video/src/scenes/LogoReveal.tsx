import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SCENES } from "../constants";
import { springIn, fadeIn, fadeOut, generateParticles, pulse } from "../helpers";
import { bgDark, fullScreen, centered, heading, mono, glowText } from "../styles";

const burstParticles = generateParticles(60, 777);

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.logoReveal;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 10) * fadeOut(frame, start + duration - 10, 10);

  // Logo scale spring
  const logoScale = springIn(frame, start + 10, {
    damping: 12,
    mass: 1,
    stiffness: 120,
  });

  // Subtitle fade
  const subOpacity = fadeIn(frame, start + 35, 20);

  // Energy ring expansion
  const ringProgress = interpolate(local, [10, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rotating glow
  const rotation = local * 2;
  const glowPulse = pulse(frame, 0.08, 0.5, 1);

  return (
    <div style={{ ...fullScreen, opacity }}>
      <div style={bgDark}>
        {/* Burst particles */}
        {burstParticles.map((p, i) => {
          const dist = p.speed * 40 * ringProgress;
          const x = 960 + Math.cos(p.angle + local * 0.01) * dist;
          const y = 540 + Math.sin(p.angle + local * 0.01) * dist;
          const pOpacity = interpolate(
            ringProgress,
            [0, 0.15, 0.6, 1],
            [0, p.opacity * 0.8, p.opacity * 0.4, 0]
          );
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.color,
                opacity: pOpacity,
                boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
              }}
            />
          );
        })}

        {/* Energy rings */}
        {[0, 1, 2].map((ring) => {
          const ringSize = interpolate(
            ringProgress,
            [ring * 0.1, ring * 0.1 + 0.5],
            [0, 200 + ring * 120],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const ringOp = interpolate(
            ringProgress,
            [ring * 0.1, ring * 0.1 + 0.3, ring * 0.1 + 0.5],
            [0, 0.5, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={ring}
              style={{
                position: "absolute",
                left: 960 - ringSize,
                top: 540 - ringSize,
                width: ringSize * 2,
                height: ringSize * 2,
                borderRadius: "50%",
                border: `2px solid ${COLORS.accent}`,
                opacity: ringOp,
                boxShadow: `0 0 30px ${COLORS.accent}40`,
              }}
            />
          );
        })}

        {/* Logo */}
        <div style={{ ...centered, height: "100%", flexDirection: "column", gap: 24 }}>
          {/* Rotating gradient glow behind logo */}
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `conic-gradient(from ${rotation}deg, ${COLORS.accent}00, ${COLORS.accent}40, ${COLORS.purple}40, ${COLORS.accent}00)`,
              filter: "blur(40px)",
              opacity: glowPulse * logoScale,
            }}
          />

          {/* Logo mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              transform: `scale(${logoScale})`,
            }}
          >
            {/* Sync icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 40px ${COLORS.accent}60, 0 0 80px ${COLORS.accent}30`,
              }}
            >
              <svg width={44} height={44} viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12C4 7.58 7.58 4 12 4c3.04 0 5.69 1.68 7.06 4.17"
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <path d="M17 4l2.5 4.5L15 9" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M20 12c0 4.42-3.58 8-8 8-3.04 0-5.69-1.68-7.06-4.17"
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <path d="M7 20l-2.5-4.5L9 15" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Logo text */}
            <div style={{ ...heading, fontSize: 84, ...glowText() }}>
              ai-sync
            </div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              ...heading,
              fontSize: 28,
              fontWeight: 400,
              color: COLORS.gray,
              opacity: subOpacity,
              marginTop: 8,
            }}
          >
            Cross-platform AI agent synchronization
          </div>
        </div>
      </div>
    </div>
  );
};
