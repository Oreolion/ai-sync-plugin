// Video timing (frames at 30fps)
export const FPS = 30;

// Scene durations in frames
export const SCENES = {
  // Scene 1: Dark opening — "What happens when you switch AI tools?"
  opening: { start: 0, duration: 90 }, // 0-3s

  // Scene 2: Context explosion — context fragments scatter
  contextLoss: { start: 90, duration: 120 }, // 3-7s

  // Scene 3: The silo problem — each tool in its own bubble
  silos: { start: 210, duration: 120 }, // 7-11s

  // Scene 4: Logo reveal — "ai-sync" with energy burst
  logoReveal: { start: 330, duration: 90 }, // 11-14s

  // Scene 5: Protocol visualization — .ai-sync/ tree builds
  protocol: { start: 420, duration: 150 }, // 14-19s

  // Scene 6: The handoff flow — animated tool chain
  handoffFlow: { start: 570, duration: 210 }, // 19-26s

  // Scene 7: Feature grid — cards fly in
  features: { start: 780, duration: 150 }, // 26-31s

  // Scene 8: Supported tools — logo grid pulse
  tools: { start: 930, duration: 150 }, // 31-36s

  // Scene 9: Ship manifest — what launches today
  shipDay: { start: 1080, duration: 120 }, // 36-40s

  // Scene 10: Terminal demo — install + status output
  demo: { start: 1200, duration: 210 }, // 40-47s

  // Scene 11: CTA — GitHub + install
  cta: { start: 1410, duration: 150 }, // 47-52s
} as const;

// Colors
export const COLORS = {
  bg: "#0a0a0f",
  bgGradient1: "#0d0d1a",
  bgGradient2: "#0a0f1e",
  accent: "#6366f1", // indigo
  accentLight: "#818cf8",
  accentGlow: "#4f46e5",
  green: "#10b981",
  greenGlow: "#059669",
  orange: "#f59e0b",
  red: "#ef4444",
  cyan: "#06b6d4",
  purple: "#a855f7",
  pink: "#ec4899",
  white: "#f8fafc",
  gray: "#94a3b8",
  grayDark: "#475569",
  grayDarker: "#1e293b",
  terminal: "#0f172a",
  terminalBorder: "#1e293b",
} as const;

// Tool data
export const TOOLS = [
  { name: "Claude Code", color: "#d97706", icon: "C", short: "Claude" },
  { name: "Codex", color: "#10b981", icon: "Cx", short: "Codex" },
  { name: "Cursor", color: "#6366f1", icon: "Cu", short: "Cursor" },
  { name: "Windsurf", color: "#06b6d4", icon: "W", short: "Windsurf" },
  { name: "Cline", color: "#a855f7", icon: "Cl", short: "Cline" },
  { name: "Aider", color: "#ec4899", icon: "A", short: "Aider" },
  { name: "Copilot", color: "#f8fafc", icon: "Cp", short: "Copilot" },
  { name: "Continue", color: "#f59e0b", icon: "Cn", short: "Continue" },
  { name: "OpenCode", color: "#14b8a6", icon: "O", short: "OpenCode" },
] as const;

export const FEATURES = [
  { title: "Conflict Detection", desc: "Warns if state changed", icon: "!" },
  { title: "Auto-Progress", desc: "Tracks task completion", icon: "%" },
  { title: "Build Awareness", desc: "Records build status", icon: "B" },
  { title: "Session Audit", desc: "Logs every agent session", icon: "S" },
  { title: "Git Hooks", desc: "Auto-save on commit", icon: "G" },
  { title: "9 Adapters", desc: "One init, all tools", icon: "9" },
] as const;
