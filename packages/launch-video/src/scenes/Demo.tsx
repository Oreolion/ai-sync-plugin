import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, SCENES } from "../constants";
import { fadeIn, fadeOut, springIn, typewriter, pulse } from "../helpers";
import {
  bgDark, fullScreen, centered, heading, mono, glowText,
  terminalWindow, terminalHeader, terminalDot, terminalBody,
} from "../styles";

// Terminal output lines with timing
const INIT_COMMAND = "npx @oreolion/ai-sync init";
const INIT_OUTPUT = [
  { text: "", delay: 28, color: COLORS.gray }, // blank after command types
  { text: "  Initializing ai-sync in ~/my-project...", delay: 32, color: COLORS.gray },
  { text: "", delay: 36, color: COLORS.gray },
  { text: "  ✓ Created .ai-sync/HANDOFF.md", delay: 40, color: COLORS.green },
  { text: "  ✓ Created .ai-sync/PROGRESS.md", delay: 46, color: COLORS.green },
  { text: "  ✓ Created .ai-sync/PLAN.md", delay: 52, color: COLORS.green },
  { text: "  ✓ Created .ai-sync/sessions/", delay: 58, color: COLORS.green },
  { text: "", delay: 62, color: COLORS.gray },
  { text: "  ✓ Generated AGENTS.md (Codex, OpenCode)", delay: 66, color: COLORS.cyan },
  { text: "  ✓ Generated .cursorrules (Cursor)", delay: 72, color: COLORS.cyan },
  { text: "  ✓ Generated .clinerules (Cline)", delay: 78, color: COLORS.cyan },
  { text: "  ✓ Generated .windsurfrules (Windsurf)", delay: 84, color: COLORS.cyan },
  { text: "  ✓ Generated .aider.conf.yml (Aider)", delay: 90, color: COLORS.cyan },
  { text: "", delay: 94, color: COLORS.gray },
  { text: "  ai-sync initialized! Run /handoff before switching agents.", delay: 98, color: COLORS.white },
];

const STATUS_COMMAND = "ai-sync status";
const STATUS_OUTPUT = [
  { text: "", delay: 18, color: COLORS.gray },
  { text: "  ╔══════════════════════════════════════════╗", delay: 22, color: COLORS.accent },
  { text: "  ║           ai-sync · Project Status       ║", delay: 26, color: COLORS.accent },
  { text: "  ╚══════════════════════════════════════════╝", delay: 30, color: COLORS.accent },
  { text: "", delay: 34, color: COLORS.gray },
  { text: "  Agent: claude-code · Status: in-progress", delay: 38, color: COLORS.gray },
  { text: "  Phase: Core Setup · Task: Build auth system", delay: 42, color: COLORS.gray },
  { text: "", delay: 46, color: COLORS.gray },
  { text: "  Phase 1: Core Setup    ██████░░░░  60%  (3/5)", delay: 50, color: COLORS.green },
  { text: "  Phase 2: API Routes    ░░░░░░░░░░   0%  (0/4)", delay: 56, color: COLORS.grayDark },
  { text: "  Phase 3: Frontend      ░░░░░░░░░░   0%  (0/3)", delay: 62, color: COLORS.grayDark },
  { text: "", delay: 66, color: COLORS.gray },
  { text: "  Overall: ████░░░░░░  25%  (3/12)", delay: 70, color: COLORS.orange },
];

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.demo;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 15) * fadeOut(frame, start + duration - 15, 15);

  // Title
  const titleOp = springIn(frame, start + 3);

  // Terminal scale
  const termScale = springIn(frame, start + 8, { damping: 16 });

  // Phase 1: init command (local 0-110)
  // Phase 2: status command (local 110-210)
  const phase2Start = 110;
  const showingStatus = local >= phase2Start;

  // Terminal glow
  const glow = pulse(frame, 0.05, 0.3, 0.6);

  return (
    <div style={{ ...fullScreen, opacity }}>
      <div style={bgDark}>
        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: 40,
            width: "100%",
            textAlign: "center",
            ...heading,
            fontSize: 42,
            ...glowText(),
            opacity: titleOp,
            transform: `scale(${titleOp})`,
          }}
        >
          {showingStatus ? "Check your progress instantly." : "Get started in one command."}
        </div>

        {/* Terminal */}
        <div
          style={{
            ...centered,
            height: "100%",
            paddingTop: 30,
          }}
        >
          <div
            style={{
              ...terminalWindow,
              width: 800,
              transform: `scale(${termScale})`,
              opacity: termScale,
              boxShadow: `0 0 ${40 + glow * 30}px ${COLORS.accent}${Math.floor(glow * 40)
                .toString(16)
                .padStart(2, "0")}, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Header */}
            <div style={terminalHeader}>
              <div style={terminalDot("#ef4444")} />
              <div style={terminalDot("#f59e0b")} />
              <div style={terminalDot("#10b981")} />
              <div style={{ ...mono, fontSize: 13, color: COLORS.grayDark, marginLeft: 12 }}>
                ~/my-project
              </div>
            </div>

            {/* Body */}
            <div style={{ ...terminalBody, minHeight: 440, fontSize: 16, lineHeight: 1.6 }}>
              {!showingStatus ? (
                <>
                  {/* Init command typing */}
                  <div>
                    <span style={{ color: COLORS.green, fontWeight: 700 }}>$</span>{" "}
                    <span style={{ color: COLORS.white, fontWeight: 600 }}>
                      {typewriter(INIT_COMMAND, frame, start + 12, 1.5)}
                    </span>
                    {local < 12 + INIT_COMMAND.length / 1.5 && local >= 12 && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 2,
                          height: 16,
                          background: COLORS.green,
                          marginLeft: 2,
                          verticalAlign: "text-bottom",
                          boxShadow: `0 0 6px ${COLORS.green}`,
                        }}
                      />
                    )}
                  </div>

                  {/* Init output lines */}
                  {INIT_OUTPUT.map((line, i) => {
                    const lineOpacity = fadeIn(frame, start + line.delay, 4);
                    return (
                      <div
                        key={`init-${i}`}
                        style={{
                          opacity: lineOpacity,
                          color: line.color,
                          fontWeight: line.color === COLORS.white ? 700 : 500,
                          minHeight: line.text === "" ? 8 : undefined,
                        }}
                      >
                        {line.text}
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  {/* Status command typing */}
                  <div>
                    <span style={{ color: COLORS.green, fontWeight: 700 }}>$</span>{" "}
                    <span style={{ color: COLORS.white, fontWeight: 600 }}>
                      {typewriter(STATUS_COMMAND, frame, start + phase2Start + 5, 1.5)}
                    </span>
                    {local < phase2Start + 5 + STATUS_COMMAND.length / 1.5 && local >= phase2Start + 5 && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 2,
                          height: 16,
                          background: COLORS.green,
                          marginLeft: 2,
                          verticalAlign: "text-bottom",
                          boxShadow: `0 0 6px ${COLORS.green}`,
                        }}
                      />
                    )}
                  </div>

                  {/* Status output lines */}
                  {STATUS_OUTPUT.map((line, i) => {
                    const lineLocal = local - phase2Start;
                    const lineOpacity = fadeIn(frame, start + phase2Start + line.delay, 4);

                    // Special: animate progress bars
                    const isProgressBar = line.text.includes("██") || line.text.includes("░░░░░░░░░░");
                    const barGlow = isProgressBar && line.color === COLORS.green
                      ? pulse(frame + i * 10, 0.08, 0.8, 1)
                      : 1;

                    return (
                      <div
                        key={`status-${i}`}
                        style={{
                          opacity: lineOpacity * barGlow,
                          color: line.color,
                          fontWeight: line.color === COLORS.accent ? 700 : line.color === COLORS.green ? 700 : 500,
                          minHeight: line.text === "" ? 8 : undefined,
                          textShadow: line.color === COLORS.green && isProgressBar
                            ? `0 0 8px ${COLORS.green}40`
                            : undefined,
                        }}
                      >
                        {line.text}
                      </div>
                    );
                  })}

                  {/* Blinking cursor at bottom */}
                  {local > phase2Start + 75 && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ color: COLORS.green, fontWeight: 700 }}>$</span>{" "}
                      {Math.floor(local * 0.07) % 2 === 0 && (
                        <span
                          style={{
                            display: "inline-block",
                            width: 2,
                            height: 16,
                            background: COLORS.green,
                            verticalAlign: "text-bottom",
                            boxShadow: `0 0 6px ${COLORS.green}`,
                          }}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
