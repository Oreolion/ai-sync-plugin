import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "./constants";
import { Background } from "./Background";
import {
  Opening,
  ContextLoss,
  Silos,
  LogoReveal,
  Protocol,
  HandoffFlow,
  Features,
  ToolsGrid,
  ShipDay,
  Demo,
  CTA,
} from "./scenes";

/**
 * Each scene manages its own visibility via global frame math
 * (fadeIn/fadeOut + null return when out of range).
 * No Sequence wrappers — they offset useCurrentFrame() to local,
 * which conflicts with the scenes' global-frame calculations.
 */
export const AiSyncLaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Background />
      <Opening />
      <ContextLoss />
      <Silos />
      <LogoReveal />
      <Protocol />
      <HandoffFlow />
      <Features />
      <ToolsGrid />
      <ShipDay />
      <Demo />
      <CTA />
    </AbsoluteFill>
  );
};
