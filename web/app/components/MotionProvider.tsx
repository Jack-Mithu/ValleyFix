"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Makes every `motion` animation respect the user's "reduce motion" setting.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
