"use client";

import { usePauseOffscreen } from "./usePauseOffscreen";

// Topographic contour lines: a "map of the valleys" background for dark sections.

const LINES = Array.from({ length: 14 }, (_, i) => {
  const y = 40 + i * 52;
  const a = 30 + (i % 4) * 14;
  return `M-120 ${y} C 180 ${y - a} 420 ${y + a} 720 ${y} S 1260 ${y - a} 1560 ${y}`;
});

export default function Contours({
  className = "",
  stroke = "#ffbf00",
}: {
  className?: string;
  stroke?: string;
}) {
  const ref = usePauseOffscreen<SVGSVGElement>();
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMidYMid slice"
      // The whole SVG sways as one GPU layer (cheap), instead of repainting the lines.
      className={`pointer-events-none absolute -inset-x-16 inset-y-0 h-full w-[calc(100%+8rem)] animate-sway will-change-transform ${className}`}
    >
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        {LINES.map((d, i) => (
          <path key={i} d={d} opacity={0.35 + (i % 3) * 0.2} />
        ))}
      </g>
    </svg>
  );
}
