import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "./constants";
import { fullScreen } from "./styles";

/** Animated grid background that persists across all scenes */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // Slowly scrolling grid
  const gridOffset = frame * 0.3;

  return (
    <div style={fullScreen}>
      {/* Base gradient */}
      <div
        style={{
          ...fullScreen,
          background: `radial-gradient(ellipse at 50% 30%, ${COLORS.bgGradient2} 0%, ${COLORS.bg} 70%)`,
        }}
      />

      {/* Vertical grid lines */}
      {Array.from({ length: 20 }, (_, i) => {
        const x = (i * 100 + gridOffset) % 1920;
        return (
          <div
            key={`v-${i}`}
            style={{
              position: "absolute",
              left: x,
              top: 0,
              width: 1,
              height: "100%",
              background: `linear-gradient(to bottom, transparent 10%, ${COLORS.accent}04 50%, transparent 90%)`,
            }}
          />
        );
      })}

      {/* Horizontal grid lines */}
      {Array.from({ length: 12 }, (_, i) => {
        const y = (i * 100 + gridOffset * 0.5) % 1080;
        return (
          <div
            key={`h-${i}`}
            style={{
              position: "absolute",
              left: 0,
              top: y,
              width: "100%",
              height: 1,
              background: `linear-gradient(to right, transparent 10%, ${COLORS.accent}04 50%, transparent 90%)`,
            }}
          />
        );
      })}

      {/* Vignette overlay */}
      <div
        style={{
          ...fullScreen,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
};
