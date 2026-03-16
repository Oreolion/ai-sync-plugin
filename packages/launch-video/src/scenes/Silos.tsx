import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SCENES, TOOLS } from "../constants";
import { fadeIn, fadeOut, springIn, pulse } from "../helpers";
import { bgDark, fullScreen, centered, heading, mono, glowText } from "../styles";

export const Silos: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.silos;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 15) * fadeOut(frame, start + duration - 15, 15);

  // Title
  const titleOpacity = fadeIn(frame, start + 5, 15);

  // 3x3 grid of tool bubbles, each isolated
  const toolsToShow = TOOLS.slice(0, 9);
  const gridCols = 3;

  return (
    <div style={{ ...fullScreen, opacity }}>
      <div style={bgDark}>
        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: 60,
            width: "100%",
            textAlign: "center",
            ...heading,
            fontSize: 42,
            ...glowText(),
            opacity: titleOpacity,
          }}
        >
          Every tool is an island
        </div>

        {/* Tool bubbles grid */}
        <div
          style={{
            ...centered,
            height: "100%",
            paddingTop: 60,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, 200px)`,
              gap: 40,
            }}
          >
            {toolsToShow.map((tool, i) => {
              const row = Math.floor(i / gridCols);
              const col = i % gridCols;
              const delay = (row + col) * 5;
              const scale = springIn(frame, start + 15 + delay, {
                damping: 15,
                stiffness: 80,
              });

              // Pulsing border to show isolation
              const borderPulse = pulse(frame + i * 13, 0.06, 0.3, 0.7);

              // Dashed orbiting ring
              const rotation = (local + i * 40) * 0.5;

              return (
                <div
                  key={tool.name}
                  style={{
                    width: 200,
                    height: 140,
                    borderRadius: 20,
                    background: `${tool.color}08`,
                    border: `2px dashed ${tool.color}${Math.floor(borderPulse * 99)
                      .toString(16)
                      .padStart(2, "0")}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    transform: `scale(${scale})`,
                    opacity: scale,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Orbiting dot */}
                  <div
                    style={{
                      position: "absolute",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: tool.color,
                      boxShadow: `0 0 10px ${tool.color}`,
                      top: 70 + Math.sin((rotation * Math.PI) / 180) * 55,
                      left: 100 + Math.cos((rotation * Math.PI) / 180) * 85,
                    }}
                  />

                  {/* Tool icon */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${tool.color}20`,
                      border: `1px solid ${tool.color}50`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...mono,
                      fontSize: 18,
                      fontWeight: 700,
                      color: tool.color,
                    }}
                  >
                    {tool.icon}
                  </div>

                  {/* Tool name */}
                  <div
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 15,
                      fontWeight: 600,
                      color: COLORS.white,
                    }}
                  >
                    {tool.short}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Red X connections between tools */}
        <svg
          style={{ ...fullScreen, pointerEvents: "none" }}
          viewBox="0 0 1920 1080"
        >
          {/* Dashed lines between adjacent tools with X marks */}
          {[
            [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8],
            [0, 3], [1, 4], [2, 5], [3, 6], [4, 7], [5, 8],
          ].map(([a, b], lineIdx) => {
            const lineOpacity = interpolate(
              local,
              [40 + lineIdx * 2, 55 + lineIdx * 2],
              [0, 0.4],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            const aRow = Math.floor(a / gridCols);
            const aCol = a % gridCols;
            const bRow = Math.floor(b / gridCols);
            const bCol = b % gridCols;

            // Grid starts at center
            const gridX = 960 - (gridCols * 240) / 2 + 120;
            const gridY = 540 - (3 * 180) / 2 + 120;

            const x1 = gridX + aCol * 240;
            const y1 = gridY + aRow * 180;
            const x2 = gridX + bCol * 240;
            const y2 = gridY + bRow * 180;

            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            return (
              <g key={`line-${lineIdx}`} opacity={lineOpacity}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={COLORS.red}
                  strokeWidth={1}
                  strokeDasharray="6 4"
                  opacity={0.3}
                />
                {/* X mark */}
                <line x1={mx - 6} y1={my - 6} x2={mx + 6} y2={my + 6} stroke={COLORS.red} strokeWidth={2} />
                <line x1={mx + 6} y1={my - 6} x2={mx - 6} y2={my + 6} stroke={COLORS.red} strokeWidth={2} />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
