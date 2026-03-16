import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, SCENES, FEATURES } from "../constants";
import { fadeIn, fadeOut, springIn, pulse } from "../helpers";
import { bgDark, fullScreen, centered, heading, mono, glowText, card, glowBox } from "../styles";

export const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.features;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 15) * fadeOut(frame, start + duration - 15, 15);

  // Title
  const titleOp = springIn(frame, start + 5);

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
            fontSize: 42,
            ...glowText(),
            opacity: titleOp,
            transform: `scale(${titleOp})`,
          }}
        >
          Built different.
        </div>

        {/* Feature cards — 2x3 grid */}
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
              gridTemplateColumns: "repeat(3, 320px)",
              gap: 24,
            }}
          >
            {FEATURES.map((feat, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const delay = (row * 3 + col) * 8 + 20;
              const scale = springIn(frame, start + delay, {
                damping: 16,
                stiffness: 90,
              });

              const iconColors = [
                COLORS.orange,
                COLORS.green,
                COLORS.cyan,
                COLORS.purple,
                COLORS.pink,
                COLORS.accent,
              ];
              const iconColor = iconColors[i];
              const glowPulse = pulse(frame + i * 20, 0.04, 0.15, 0.35);

              return (
                <div
                  key={feat.title}
                  style={{
                    ...card,
                    transform: `scale(${scale})`,
                    opacity: scale,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: `0 0 ${20 + glowPulse * 20}px ${iconColor}${Math.floor(glowPulse * 30)
                      .toString(16)
                      .padStart(2, "0")}, 0 4px 20px rgba(0,0,0,0.3)`,
                  }}
                >
                  {/* Gradient accent line at top */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, transparent, ${iconColor}, transparent)`,
                      opacity: 0.8,
                    }}
                  />

                  {/* Icon badge */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${iconColor}15`,
                      border: `1px solid ${iconColor}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...mono,
                      fontSize: 18,
                      fontWeight: 700,
                      color: iconColor,
                    }}
                  >
                    {feat.icon}
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 20,
                      fontWeight: 700,
                      color: COLORS.white,
                    }}
                  >
                    {feat.title}
                  </div>

                  {/* Description */}
                  <div
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 15,
                      color: COLORS.gray,
                      lineHeight: 1.4,
                    }}
                  >
                    {feat.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
