import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SCENES } from "../constants";
import { fadeIn, fadeOut, springIn, generateParticles } from "../helpers";
import { bgDark, fullScreen, centered, heading, mono, glowText } from "../styles";

const FRAGMENTS = [
  { text: "CLAUDE.md", color: "#d97706" },
  { text: "AGENTS.md", color: "#10b981" },
  { text: ".cursorrules", color: "#6366f1" },
  { text: ".clinerules", color: "#a855f7" },
  { text: "context = {}", color: "#ef4444" },
  { text: "session: lost", color: "#f59e0b" },
  { text: "plan: undefined", color: "#ec4899" },
  { text: "progress: null", color: "#06b6d4" },
];

const particles = generateParticles(40, 99);

export const ContextLoss: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.contextLoss;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 15) * fadeOut(frame, start + duration - 15, 15);

  // Phase 1: Fragments gather at center (0-30 frames)
  // Phase 2: They explode outward (30-60 frames)
  // Phase 3: "All context is lost" text appears (60-120)

  const explodeProgress = interpolate(local, [25, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textOpacity = fadeIn(frame, start + 60, 20);

  return (
    <div style={{ ...fullScreen, opacity }}>
      <div style={bgDark}>
        {/* Explosion particles */}
        {particles.map((p, i) => {
          const dist = p.speed * 60 * explodeProgress;
          const x = 960 + Math.cos(p.angle) * dist;
          const y = 540 + Math.sin(p.angle) * dist;
          const particleOpacity = interpolate(
            explodeProgress,
            [0, 0.1, 0.8, 1],
            [0, p.opacity, p.opacity, 0]
          );
          return (
            <div
              key={`p-${i}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.color,
                opacity: particleOpacity,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              }}
            />
          );
        })}

        {/* Context fragments */}
        {FRAGMENTS.map((frag, i) => {
          const angle = (i / FRAGMENTS.length) * Math.PI * 2;
          const gatherRadius = 120;
          const explodeRadius = 300 + i * 40;

          const radius = interpolate(explodeProgress, [0, 1], [gatherRadius, explodeRadius]);
          const x = 960 + Math.cos(angle) * radius;
          const y = 540 + Math.sin(angle) * radius;

          const fragOpacity = interpolate(
            local,
            [5 + i * 2, 15 + i * 2, 50, 70],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const rotation = explodeProgress * (i % 2 === 0 ? 30 : -30);

          return (
            <div
              key={`f-${i}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                ...mono,
                fontSize: 16,
                color: frag.color,
                padding: "8px 16px",
                background: `${frag.color}10`,
                border: `1px solid ${frag.color}30`,
                borderRadius: 8,
                opacity: fragOpacity,
                whiteSpace: "nowrap",
                boxShadow: `0 0 20px ${frag.color}20`,
              }}
            >
              {frag.text}
            </div>
          );
        })}

        {/* "All context is lost" */}
        <div
          style={{
            ...centered,
            height: "100%",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              ...heading,
              fontSize: 72,
              color: COLORS.red,
              ...glowText(COLORS.red),
              opacity: textOpacity,
            }}
          >
            All context is lost.
          </div>
          <div
            style={{
              ...heading,
              fontSize: 28,
              color: COLORS.gray,
              fontWeight: 400,
              opacity: textOpacity * 0.8,
            }}
          >
            Plans drift. Work gets repeated. Patterns break.
          </div>
        </div>
      </div>
    </div>
  );
};
