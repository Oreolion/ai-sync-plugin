import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, SCENES } from "../constants";
import { fadeIn, fadeOut, springIn, pulse } from "../helpers";
import { bgDark, fullScreen, centered, heading, mono, glowText, glowBox } from "../styles";

const SHIPS = [
  { name: "Claude Code Plugin", desc: "8 commands + hooks", color: COLORS.orange, icon: "⚡" },
  { name: "CLI", desc: "npx @oreolion/ai-sync", color: COLORS.green, icon: ">" },
  { name: "MCP Server", desc: "6 structured tools", color: COLORS.accent, icon: "◆" },
  { name: "VS Code Extension", desc: "Sidebar + status bar", color: COLORS.cyan, icon: "□" },
  { name: "GitHub Action", desc: "Auto-sync on PRs", color: COLORS.white, icon: "⟳" },
  { name: "Team Sync API", desc: "Cloudflare Workers", color: COLORS.purple, icon: "☁" },
  { name: "Dashboard", desc: "Next.js analytics", color: COLORS.pink, icon: "▦" },
];

export const ShipDay: React.FC = () => {
  const frame = useCurrentFrame();
  const { start, duration } = SCENES.shipDay;
  const local = frame - start;

  if (local < -5 || local > duration + 15) return null;

  const opacity = fadeIn(frame, start, 15) * fadeOut(frame, start + duration - 15, 15);

  const titleOp = springIn(frame, start + 5);

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
            fontSize: 44,
            ...glowText(COLORS.green),
            color: COLORS.green,
            opacity: titleOp,
          }}
        >
          Ships today.
        </div>

        {/* Ship items — stacked list */}
        <div
          style={{
            ...centered,
            height: "100%",
            paddingTop: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: 700,
            }}
          >
            {SHIPS.map((ship, i) => {
              const delay = i * 8 + 20;
              const scale = springIn(frame, start + delay, {
                damping: 18,
                stiffness: 100,
              });
              const slideX = (1 - scale) * (i % 2 === 0 ? -60 : 60);

              return (
                <div
                  key={ship.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "14px 24px",
                    borderRadius: 14,
                    background: `${COLORS.grayDarker}60`,
                    border: `1px solid ${ship.color}20`,
                    opacity: scale,
                    transform: `translateX(${slideX}px)`,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${ship.color}15`,
                      border: `1px solid ${ship.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {ship.icon}
                  </div>

                  {/* Name */}
                  <div
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 20,
                      fontWeight: 700,
                      color: COLORS.white,
                      flex: 1,
                    }}
                  >
                    {ship.name}
                  </div>

                  {/* Description */}
                  <div
                    style={{
                      ...mono,
                      fontSize: 14,
                      color: ship.color,
                    }}
                  >
                    {ship.desc}
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
