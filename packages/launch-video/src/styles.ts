import type { CSSProperties } from "react";
import { COLORS } from "./constants";

export const fullScreen: CSSProperties = {
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
  left: 0,
};

export const centered: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
};

export const column: CSSProperties = {
  ...centered,
  flexDirection: "column",
};

export const bgDark: CSSProperties = {
  ...fullScreen,
  background: `radial-gradient(ellipse at 50% 40%, ${COLORS.bgGradient2} 0%, ${COLORS.bg} 70%)`,
};

export const heading: CSSProperties = {
  fontFamily:
    '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeight: 900,
  color: COLORS.white,
  lineHeight: 1.1,
  letterSpacing: "-0.03em",
};

export const subheading: CSSProperties = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeight: 600,
  color: COLORS.gray,
  lineHeight: 1.5,
};

export const mono: CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
  fontWeight: 500,
};

export const glowText = (color: string = COLORS.accent): CSSProperties => ({
  textShadow: `0 0 40px ${color}40, 0 0 80px ${color}20`,
});

export const glowBox = (color: string = COLORS.accent): CSSProperties => ({
  boxShadow: `0 0 30px ${color}30, 0 0 60px ${color}15, inset 0 1px 0 ${color}20`,
});

export const terminalWindow: CSSProperties = {
  background: COLORS.terminal,
  borderRadius: 16,
  border: `1px solid ${COLORS.terminalBorder}`,
  overflow: "hidden",
  ...glowBox("#6366f1"),
};

export const terminalHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 16px",
  background: "#1a1a2e",
  borderBottom: `1px solid ${COLORS.terminalBorder}`,
};

export const terminalDot = (color: string): CSSProperties => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: color,
});

export const terminalBody: CSSProperties = {
  padding: "20px 24px",
  ...mono,
  fontSize: 18,
  fontWeight: 500,
  lineHeight: 1.7,
  color: COLORS.gray,
};

export const badge = (color: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 16px",
  borderRadius: 100,
  background: `${color}15`,
  border: `1px solid ${color}40`,
  color: color,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: '"Inter", sans-serif',
});

export const card: CSSProperties = {
  background: `${COLORS.grayDarker}80`,
  borderRadius: 16,
  border: `1px solid ${COLORS.terminalBorder}`,
  padding: "24px 28px",
  backdropFilter: "blur(10px)",
};

export const gridLine: CSSProperties = {
  position: "absolute",
  background: `linear-gradient(to bottom, transparent, ${COLORS.accent}08, transparent)`,
  width: 1,
};

export const horizontalGridLine: CSSProperties = {
  position: "absolute",
  background: `linear-gradient(to right, transparent, ${COLORS.accent}08, transparent)`,
  height: 1,
  width: "100%",
};
