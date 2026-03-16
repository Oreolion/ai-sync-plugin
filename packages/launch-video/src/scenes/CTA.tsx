import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, SCENES } from "../constants";
import { fadeIn, fadeOut, springIn, typewriter, pulse } from "../helpers";
import {
  bgDark, fullScreen, centered, heading, mono, glowText,
  terminalWindow, terminalHeader, terminalDot, terminalBody,
} from "../styles";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.cta;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 15) * fadeOut(frame, start + duration - 10, 10);

  // Title spring
  const titleScale = springIn(frame, start + 5, { damping: 14 });

  // Terminal spring
  const termScale = springIn(frame, start + 20, { damping: 16 });

  // GitHub badge spring
  const badgeScale = springIn(frame, start + 60, { damping: 16 });

  // Pulsing CTA glow
  const ctaGlow = pulse(frame, 0.06, 0.3, 0.8);

  return (
    <div style={{ ...fullScreen, opacity }}>
      <div style={bgDark}>
        {/* Background gradient energy */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: `radial-gradient(ellipse at 50% 60%, ${COLORS.accent}08 0%, transparent 60%)`,
          }}
        />

        <div
          style={{
            ...centered,
            height: "100%",
            flexDirection: "column",
            gap: 40,
          }}
        >
          {/* Title */}
          <div
            style={{
              ...heading,
              fontSize: 52,
              ...glowText(),
              textAlign: "center",
              transform: `scale(${titleScale})`,
              opacity: titleScale,
            }}
          >
            Get started in 30 seconds
          </div>

          {/* Terminal with install command */}
          <div
            style={{
              ...terminalWindow,
              width: 650,
              transform: `scale(${termScale})`,
              opacity: termScale,
              boxShadow: `0 0 ${30 + ctaGlow * 30}px ${COLORS.accent}${Math.floor(ctaGlow * 35)
                .toString(16)
                .padStart(2, "0")}, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            <div style={terminalHeader}>
              <div style={terminalDot("#ef4444")} />
              <div style={terminalDot("#f59e0b")} />
              <div style={terminalDot("#10b981")} />
              <div style={{ ...mono, fontSize: 13, color: COLORS.grayDark, marginLeft: 12 }}>
                terminal
              </div>
            </div>
            <div style={{ ...terminalBody, padding: "24px 28px" }}>
              {/* Line 1 */}
              <div style={{ marginBottom: 8, color: COLORS.grayDark }}>
                # Any project, any tool
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: COLORS.green }}>$</span>{" "}
                <span style={{ color: COLORS.white }}>
                  {typewriter("npx @oreolion/ai-sync init", frame, start + 30, 1.2)}
                </span>
              </div>

              {/* Line 2 */}
              <div style={{ marginBottom: 8, color: COLORS.grayDark }}>
                # As a Claude Code plugin
              </div>
              <div>
                <span style={{ color: COLORS.green }}>$</span>{" "}
                <span style={{ color: COLORS.white }}>
                  {typewriter("claude plugin add Oreolion/ai-sync", frame, start + 55, 1.2)}
                </span>
                {Math.floor(local * 0.08) % 2 === 0 && local > 55 && (
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
            </div>
          </div>

          {/* GitHub + npm badges */}
          <div
            style={{
              display: "flex",
              gap: 24,
              alignItems: "center",
              transform: `scale(${badgeScale})`,
              opacity: badgeScale,
            }}
          >
            {/* GitHub */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 12,
                background: `${COLORS.white}08`,
                border: `1px solid ${COLORS.white}20`,
              }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill={COLORS.white}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 600, color: COLORS.white }}>
                github.com/Oreolion/ai-sync
              </div>
            </div>

            {/* Star CTA */}
            <div
              style={{
                padding: "12px 28px",
                borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
                fontFamily: '"Inter", sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.white,
                boxShadow: `0 0 ${20 + ctaGlow * 20}px ${COLORS.accent}40`,
              }}
            >
              Star it. Try it. Break it.
            </div>
          </div>

          {/* MIT + Free badge */}
          <div
            style={{
              ...mono,
              fontSize: 16,
              color: COLORS.grayDark,
              opacity: fadeIn(frame, start + 80, 15),
            }}
          >
            MIT licensed · Free forever · PRs welcome
          </div>
        </div>
      </div>
    </div>
  );
};
