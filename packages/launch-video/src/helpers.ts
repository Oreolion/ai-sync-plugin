import { interpolate, spring } from "remotion";
import { FPS } from "./constants";

/** Smooth spring animation helper */
export function springIn(
  frame: number,
  startFrame: number,
  options?: { damping?: number; mass?: number; stiffness?: number }
) {
  return spring({
    frame: frame - startFrame,
    fps: FPS,
    config: {
      damping: options?.damping ?? 20,
      mass: options?.mass ?? 0.8,
      stiffness: options?.stiffness ?? 100,
    },
  });
}

/** Fade in from 0 to 1 */
export function fadeIn(frame: number, start: number, duration: number = 15) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Fade out from 1 to 0 */
export function fadeOut(frame: number, start: number, duration: number = 15) {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Slide in from direction */
export function slideIn(
  frame: number,
  startFrame: number,
  direction: "left" | "right" | "up" | "down" = "up",
  distance: number = 80
) {
  const progress = springIn(startFrame > 0 ? frame : frame, startFrame, {
    damping: 18,
    stiffness: 80,
  });
  const offset = interpolate(progress, [0, 1], [distance, 0]);

  switch (direction) {
    case "left":
      return { transform: `translateX(${-offset}px)`, opacity: progress };
    case "right":
      return { transform: `translateX(${offset}px)`, opacity: progress };
    case "up":
      return { transform: `translateY(${offset}px)`, opacity: progress };
    case "down":
      return { transform: `translateY(${-offset}px)`, opacity: progress };
  }
}

/** Typewriter effect — returns substring */
export function typewriter(text: string, frame: number, startFrame: number, charsPerFrame: number = 1.5) {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
  return text.substring(0, chars);
}

/** Pulsing glow effect */
export function pulse(frame: number, speed: number = 0.05, min: number = 0.4, max: number = 1) {
  return min + (max - min) * (0.5 + 0.5 * Math.sin(frame * speed));
}

/** Staggered delay for list items */
export function stagger(index: number, baseDelay: number = 6) {
  return index * baseDelay;
}

/** Ease out cubic */
export function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Generate particles for explosion effects */
export function generateParticles(count: number, seed: number = 42) {
  const particles = [];
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    particles.push({
      angle: rand() * Math.PI * 2,
      speed: 2 + rand() * 8,
      size: 2 + rand() * 4,
      opacity: 0.3 + rand() * 0.7,
      delay: Math.floor(rand() * 10),
      color: rand() > 0.5 ? "#6366f1" : rand() > 0.5 ? "#818cf8" : "#a855f7",
    });
  }
  return particles;
}
