import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, SCENES } from "../constants";
import { fadeIn, fadeOut, springIn, typewriter, pulse } from "../helpers";
import {
  bgDark, fullScreen, centered, heading, mono, glowText,
  terminalWindow, terminalHeader, terminalDot, terminalBody,
} from "../styles";

const TREE_LINES = [
  { text: ".ai-sync/", indent: 0, color: COLORS.accent, delay: 0 },
  { text: "├── HANDOFF.md", indent: 1, color: COLORS.green, delay: 8 },
  { text: "│   └── current state — THE key file", indent: 2, color: COLORS.grayDark, delay: 14 },
  { text: "├── PLAN.md", indent: 1, color: COLORS.cyan, delay: 20 },
  { text: "│   └── implementation plan", indent: 2, color: COLORS.grayDark, delay: 26 },
  { text: "├── PROGRESS.md", indent: 1, color: COLORS.orange, delay: 32 },
  { text: "│   └── task checklist + completion %", indent: 2, color: COLORS.grayDark, delay: 38 },
  { text: "└── sessions/", indent: 1, color: COLORS.purple, delay: 44 },
  { text: "    └── audit trail of every session", indent: 2, color: COLORS.grayDark, delay: 50 },
];

export const Protocol: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.protocol;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 15) * fadeOut(frame, start + duration - 15, 15);

  // Title
  const titleScale = springIn(frame, start + 5);

  // Terminal glow pulse
  const glow = pulse(frame, 0.04, 0.3, 0.6);

  return (
    <div style={{ ...fullScreen, opacity }}>
      <div style={bgDark}>
        {/* Subtitle above terminal */}
        <div
          style={{
            position: "absolute",
            top: 80,
            width: "100%",
            textAlign: "center",
            ...heading,
            fontSize: 40,
            ...glowText(),
            opacity: titleScale,
            transform: `scale(${titleScale})`,
          }}
        >
          One protocol. Every tool.
        </div>

        {/* Terminal window */}
        <div
          style={{
            ...centered,
            height: "100%",
            paddingTop: 40,
          }}
        >
          <div
            style={{
              ...terminalWindow,
              width: 700,
              transform: `scale(${springIn(frame, start + 15, { damping: 15 })})`,
              boxShadow: `0 0 ${40 + glow * 30}px ${COLORS.accent}${Math.floor(glow * 40).toString(16).padStart(2, "0")}, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Terminal header */}
            <div style={terminalHeader}>
              <div style={terminalDot("#ef4444")} />
              <div style={terminalDot("#f59e0b")} />
              <div style={terminalDot("#10b981")} />
              <div
                style={{
                  ...mono,
                  fontSize: 13,
                  color: COLORS.grayDark,
                  marginLeft: 12,
                }}
              >
                ~/project
              </div>
            </div>

            {/* Terminal body — tree */}
            <div style={{ ...terminalBody, minHeight: 380 }}>
              {TREE_LINES.map((line, i) => {
                const lineOpacity = fadeIn(frame, start + 20 + line.delay, 8);
                const lineSlide = springIn(frame, start + 20 + line.delay, {
                  damping: 20,
                  stiffness: 90,
                });

                return (
                  <div
                    key={i}
                    style={{
                      opacity: lineOpacity,
                      transform: `translateX(${(1 - lineSlide) * 30}px)`,
                      paddingLeft: line.indent * 0,
                      marginBottom: line.indent === 2 ? 2 : 6,
                    }}
                  >
                    <span style={{ color: line.color, fontWeight: line.indent === 0 ? 700 : 400 }}>
                      {line.indent === 2 ? (
                        <span style={{ fontSize: 14, fontStyle: "italic" }}>{line.text}</span>
                      ) : (
                        line.text
                      )}
                    </span>
                  </div>
                );
              })}

              {/* Cursor at bottom */}
              {local > 70 && (
                <div style={{ marginTop: 16 }}>
                  <span style={{ color: COLORS.green }}>$</span>{" "}
                  <span style={{ color: COLORS.white }}>
                    {typewriter("Plain Markdown. Zero dependencies. Any agent reads it.", frame, start + 80, 1)}
                  </span>
                  {Math.floor(local * 0.08) % 2 === 0 && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 18,
                        background: COLORS.green,
                        marginLeft: 2,
                        verticalAlign: "text-bottom",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
