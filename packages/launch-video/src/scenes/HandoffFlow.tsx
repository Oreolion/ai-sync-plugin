import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SCENES, TOOLS } from "../constants";
import { fadeIn, fadeOut, springIn, pulse } from "../helpers";
import { bgDark, fullScreen, centered, heading, mono, glowText } from "../styles";

// 5 tools in the handoff chain
const CHAIN = [TOOLS[0], TOOLS[2], TOOLS[1], TOOLS[5], TOOLS[3]]; // Claude → Cursor → Codex → Aider → Windsurf

export const HandoffFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.handoffFlow;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 15) * fadeOut(frame, start + duration - 15, 15);

  // Title
  const titleOp = fadeIn(frame, start + 5, 15);

  // Layout: tools spaced horizontally with sync arrows between them
  const toolSpacing = 300;
  const startX = 960 - ((CHAIN.length - 1) * toolSpacing) / 2;
  const centerY = 500;

  // Each handoff triggers sequentially
  const handoffDuration = 30; // frames per handoff
  const handoffGap = 35; // frames between handoffs

  return (
    <div style={{ ...fullScreen, opacity }}>
      <div style={bgDark}>
        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: 70,
            width: "100%",
            textAlign: "center",
            ...heading,
            fontSize: 40,
            ...glowText(),
            opacity: titleOp,
          }}
        >
          Seamless handoff. Any direction.
        </div>

        {/* Subtitle showing the flow */}
        <div
          style={{
            position: "absolute",
            top: 140,
            width: "100%",
            textAlign: "center",
            ...mono,
            fontSize: 18,
            color: COLORS.grayDark,
            opacity: titleOp * 0.7,
          }}
        >
          Rate limit? Context full? Just switch. Nothing is lost.
        </div>

        {/* Tool chain */}
        {CHAIN.map((tool, i) => {
          const x = startX + i * toolSpacing;
          const toolDelay = i * handoffGap + 20;
          const scale = springIn(frame, start + toolDelay, {
            damping: 16,
            stiffness: 100,
          });

          // Active state — tool glows when "active"
          const activeStart = start + toolDelay + 10;
          const activeEnd = activeStart + handoffDuration;
          const isActive =
            frame >= activeStart && frame < activeEnd;
          const wasActive = frame >= activeEnd;

          const glowIntensity = isActive ? pulse(frame, 0.15, 0.5, 1) : 0;

          // Checkmark for completed
          const checkOpacity = fadeIn(frame, activeEnd, 10);

          return (
            <React.Fragment key={tool.name}>
              {/* Tool node */}
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: centerY,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                {/* Glow ring */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      border: `2px solid ${tool.color}`,
                      opacity: glowIntensity,
                      boxShadow: `0 0 30px ${tool.color}60, 0 0 60px ${tool.color}30`,
                      top: -10,
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    background: isActive
                      ? `${tool.color}30`
                      : wasActive
                      ? `${tool.color}15`
                      : `${tool.color}08`,
                    border: `2px solid ${tool.color}${isActive ? "80" : wasActive ? "50" : "20"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...mono,
                    fontSize: 24,
                    fontWeight: 700,
                    color: tool.color,
                    boxShadow: isActive
                      ? `0 0 30px ${tool.color}40`
                      : "none",
                    transition: "all 0.3s",
                  }}
                >
                  {tool.icon}
                </div>

                {/* Name */}
                <div
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 16,
                    fontWeight: 600,
                    color: isActive ? tool.color : COLORS.white,
                  }}
                >
                  {tool.short}
                </div>

                {/* Status label */}
                <div
                  style={{
                    ...mono,
                    fontSize: 12,
                    color: isActive
                      ? COLORS.green
                      : wasActive
                      ? COLORS.grayDark
                      : COLORS.grayDark,
                    opacity: scale,
                  }}
                >
                  {isActive ? "ACTIVE" : wasActive ? "HANDED OFF" : "WAITING"}
                </div>

                {/* Completion check */}
                {wasActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: COLORS.green,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: checkOpacity,
                      boxShadow: `0 0 10px ${COLORS.green}60`,
                      fontSize: 14,
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>

              {/* Arrow to next tool */}
              {i < CHAIN.length - 1 && (
                <svg
                  style={{
                    position: "absolute",
                    left: x + 55,
                    top: centerY - 15,
                    width: toolSpacing - 110,
                    height: 30,
                    overflow: "visible",
                  }}
                >
                  {/* Arrow line */}
                  {(() => {
                    const arrowStart = start + toolDelay + handoffDuration - 5;
                    const arrowProgress = interpolate(
                      frame,
                      [arrowStart, arrowStart + 15],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    );
                    const lineWidth = (toolSpacing - 130) * arrowProgress;
                    const arrowColor = frame >= arrowStart
                      ? COLORS.accent
                      : COLORS.grayDarker;

                    return (
                      <>
                        <line
                          x1={0}
                          y1={15}
                          x2={lineWidth}
                          y2={15}
                          stroke={arrowColor}
                          strokeWidth={2}
                          opacity={arrowProgress > 0 ? 0.8 : 0.2}
                        />
                        {arrowProgress > 0.8 && (
                          <>
                            <polygon
                              points={`${toolSpacing - 130},15 ${toolSpacing - 145},8 ${toolSpacing - 145},22`}
                              fill={COLORS.accent}
                              opacity={arrowProgress}
                            />
                            {/* Glow dot traveling along arrow */}
                            <circle
                              cx={lineWidth}
                              cy={15}
                              r={4}
                              fill={COLORS.accent}
                              opacity={arrowProgress < 1 ? 1 : 0}
                            >
                            </circle>
                          </>
                        )}
                      </>
                    );
                  })()}
                </svg>
              )}
            </React.Fragment>
          );
        })}

        {/* .ai-sync badge at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 100,
            width: "100%",
            textAlign: "center",
            opacity: fadeIn(frame, start + 100, 20),
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 28px",
              borderRadius: 100,
              background: `${COLORS.accent}10`,
              border: `1px solid ${COLORS.accent}30`,
              ...mono,
              fontSize: 20,
              color: COLORS.accent,
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12C4 7.58 7.58 4 12 4c3.04 0 5.69 1.68 7.06 4.17"
                stroke={COLORS.accent}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d="M20 12c0 4.42-3.58 8-8 8-3.04 0-5.69-1.68-7.06-4.17"
                stroke={COLORS.accent}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
            .ai-sync/ keeps every handoff intact
          </div>
        </div>
      </div>
    </div>
  );
};
