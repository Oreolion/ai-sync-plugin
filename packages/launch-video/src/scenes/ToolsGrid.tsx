import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SCENES, TOOLS } from "../constants";
import { fadeIn, fadeOut, springIn, pulse } from "../helpers";
import { bgDark, fullScreen, centered, heading, mono, glowText } from "../styles";

export const ToolsGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.tools;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 15) * fadeOut(frame, start + duration - 15, 15);

  const titleOp = springIn(frame, start + 5);

  // Central sync node
  const syncPulse = pulse(frame, 0.06, 0.6, 1);

  // Tools arranged in a circle around center
  const centerX = 960;
  const centerY = 540;
  const radius = 300;

  return (
    <div style={{ ...fullScreen, opacity }}>
      <div style={bgDark}>
        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: 50,
            width: "100%",
            textAlign: "center",
            ...heading,
            fontSize: 42,
            ...glowText(),
            opacity: titleOp,
          }}
        >
          9 tools. One protocol.
        </div>

        {/* Connection lines (behind everything) */}
        <svg
          style={{ ...fullScreen, pointerEvents: "none" }}
          viewBox="0 0 1920 1080"
        >
          {TOOLS.map((tool, i) => {
            const angle = (i / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
            const tx = centerX + Math.cos(angle) * radius;
            const ty = centerY + Math.sin(angle) * radius;

            const lineDelay = i * 6 + 30;
            const lineProgress = interpolate(
              local,
              [lineDelay, lineDelay + 15],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            // Animated dash
            const dashOffset = -local * 2;

            return (
              <g key={`line-${i}`}>
                {/* Faint connection line */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={centerX + (tx - centerX) * lineProgress}
                  y2={centerY + (ty - centerY) * lineProgress}
                  stroke={tool.color}
                  strokeWidth={1.5}
                  opacity={0.2 * lineProgress}
                  strokeDasharray="8 6"
                  strokeDashoffset={dashOffset}
                />
                {/* Glow dot traveling to tool */}
                {lineProgress > 0 && lineProgress < 1 && (
                  <circle
                    cx={centerX + (tx - centerX) * lineProgress}
                    cy={centerY + (ty - centerY) * lineProgress}
                    r={3}
                    fill={tool.color}
                    opacity={0.8}
                  >
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Central ai-sync node */}
        <div
          style={{
            position: "absolute",
            left: centerX,
            top: centerY,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          {/* Glow ring */}
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              left: -60,
              top: -60,
              borderRadius: "50%",
              border: `2px solid ${COLORS.accent}`,
              opacity: syncPulse * 0.4,
              boxShadow: `0 0 40px ${COLORS.accent}30`,
            }}
          />
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 40px ${COLORS.accent}50`,
              transform: `translate(-50%, -50%) scale(${springIn(frame, start + 15)})`,
              position: "absolute",
              left: 0,
              top: 0,
            }}
          >
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
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
        </div>

        {/* Tool nodes in circle */}
        {TOOLS.map((tool, i) => {
          const angle = (i / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
          const tx = centerX + Math.cos(angle) * radius;
          const ty = centerY + Math.sin(angle) * radius;

          const delay = i * 6 + 20;
          const scale = springIn(frame, start + delay, {
            damping: 16,
            stiffness: 90,
          });

          const toolPulse = pulse(frame + i * 15, 0.05, 0.2, 0.5);

          return (
            <div
              key={tool.name}
              style={{
                position: "absolute",
                left: tx,
                top: ty,
                transform: `translate(-50%, -50%) scale(${scale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                zIndex: 5,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: `${tool.color}12`,
                  border: `2px solid ${tool.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...mono,
                  fontSize: 20,
                  fontWeight: 700,
                  color: tool.color,
                  boxShadow: `0 0 ${15 + toolPulse * 20}px ${tool.color}${Math.floor(toolPulse * 40)
                    .toString(16)
                    .padStart(2, "0")}`,
                }}
              >
                {tool.icon}
              </div>
              <div
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.white,
                  textAlign: "center",
                }}
              >
                {tool.short}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
