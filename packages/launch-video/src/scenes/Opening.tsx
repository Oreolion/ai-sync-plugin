import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, SCENES } from "../constants";
import { fadeIn, fadeOut, typewriter, pulse } from "../helpers";
import { bgDark, centered, heading, glowText, fullScreen } from "../styles";

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.opening;
  const local = frame - start;

  if (local < 0 || local > duration + 15) return null;

  const opacity =
    fadeIn(frame, start, 20) * fadeOut(frame, start + duration - 15, 15);

  const text = "What happens when you switch AI coding tools?";
  const typed = typewriter(text, frame, start + 15, 1.2);

  // Animated cursor blink
  const showCursor = Math.floor(local * 0.08) % 2 === 0 || local < 15 + text.length / 1.2;

  // Subtle floating particles in background
  const particles = Array.from({ length: 30 }, (_, i) => {
    const x = (i * 137.5) % 100;
    const y = (i * 73.7) % 100;
    const size = 1 + (i % 3);
    const p = pulse(frame + i * 17, 0.03, 0.1, 0.4);
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: COLORS.accent,
          opacity: p * opacity,
        }}
      />
    );
  });

  return (
    <div style={{ ...fullScreen, opacity }}>
      <div style={bgDark}>
        {particles}
        <div style={{ ...centered, height: "100%" }}>
          <div
            style={{
              ...heading,
              ...glowText(),
              fontSize: 56,
              maxWidth: 900,
              textAlign: "center",
            }}
          >
            {typed}
            {showCursor && (
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: 56,
                  background: COLORS.accent,
                  marginLeft: 4,
                  verticalAlign: "text-bottom",
                  boxShadow: `0 0 15px ${COLORS.accent}`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
