"use client";

import { useId, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  Droplets,
  Hammer,
  Lightbulb,
  PaintRoller,
  Plug,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { usePauseOffscreen } from "./usePauseOffscreen";

/*
 * An original, animated illustration: a ValleyFix repair in a South Wales valley.
 *
 * Story: a ValleyFix van drives up the valley road to a house, where a
 * technician on a ladder is fixing a light; sparks fly, and the flickering
 * window settles into a steady glow. Tool "constellations" float in the sky.
 *
 * Pure SVG + CSS/SMIL animations: no image files, no licences, sharp at any size.
 * - `progress` (0 -> 1, e.g. scroll progress) drives parallax depth.
 * - `edgeFill` paints a curved bottom edge that blends into the next section.
 */

// Deterministic pseudo-random numbers so server and browser render identical
// stars (Math.random() would cause a hydration mismatch).
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(42);
const STARS = Array.from({ length: 30 }, () => ({
  x: rand() * 1440,
  y: rand() * 380,
  r: 0.6 + rand() * 1.4,
  delay: rand() * 4,
  duration: 2.5 + rand() * 3,
}));

// Faint tools floating in the sky, placed in the gaps around the hero content.
const TOOLS: { icon: LucideIcon; x: number; y: number; size: number; delay: number }[] = [
  { icon: Wrench, x: 740, y: 150, size: 34, delay: 0 },
  { icon: Lightbulb, x: 700, y: 330, size: 30, delay: 1.2 },
  { icon: Hammer, x: 960, y: 70, size: 32, delay: 2.1 },
  { icon: Droplets, x: 1190, y: 120, size: 28, delay: 0.6 },
  { icon: Plug, x: 1360, y: 250, size: 28, delay: 1.7 },
  { icon: PaintRoller, x: 560, y: 60, size: 30, delay: 2.6 },
];

// Distant houses on the middle hill.
const VILLAGE = [
  { x: 930, y: 594, s: 1 },
  { x: 968, y: 590, s: 0.8 },
  { x: 1006, y: 588, s: 1.1 },
  { x: 260, y: 600, s: 0.85 },
  { x: 296, y: 606, s: 1 },
];

// Narrow screens only see a slice of the scene; show the right-hand side,
// where the van and the house being repaired are.
const NARROW = "(max-width: 640px)";
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useNarrow = () =>
  useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);

const ROAD = "M470 1000 C560 900 700 840 860 800 C960 776 1060 768 1160 766";
const LADDER_RUNGS = [12, 24, 36, 48, 60, 72, 84];

// Van drive: 120 discrete positions (6 s at 20 fps), easing out as it arrives.
const DRIVE = (() => {
  const n = 120;
  const pts: string[] = [];
  const times: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push((1 - Math.pow(1 - t, 2.2)).toFixed(4));
    times.push(t.toFixed(4));
  }
  return { points: pts.join(";"), times: times.join(";") };
})();

function Van() {
  return (
    <g>
      {/* ladder on the roof */}
      <path d="M-20 -24 H8" stroke="#b9c3cd" strokeWidth="1.6" />
      {[-16, -10, -4, 2].map((x) => (
        <path key={x} d={`M${x} -24 V-21`} stroke="#b9c3cd" strokeWidth="1.2" />
      ))}
      {/* body + cab */}
      <path d="M-24 -20 H10 L24 -11 V-3 H-24 Z" fill="#ffbf00" />
      <path d="M12 -18 L21 -11 H12 Z" fill="#002147" />
      {/* brand stripe + little wrench */}
      <rect x="-24" y="-12" width="34" height="2.6" fill="#002147" />
      <circle cx="-6" cy="-15.5" r="2.4" fill="#002147" />
      {/* headlight */}
      <circle cx="23" cy="-6" r="1.6" fill="#fff0bf" />
      {/* wheels */}
      <circle cx="-14" cy="-3" r="4.5" fill="#001630" stroke="#708090" strokeWidth="1.5" />
      <circle cx="14" cy="-3" r="4.5" fill="#001630" stroke="#708090" strokeWidth="1.5" />
    </g>
  );
}

function RepairHouse() {
  return (
    <g>
      {/* house */}
      <rect x="-70" y="-6" width="160" height="10" fill="#001630" opacity="0.6" rx="5" />
      <rect x="-64" y="-80" width="128" height="80" fill="#1f4477" />
      <path d="M-78 -78 L0 -134 L78 -78 Z" fill="#001630" />
      <rect x="30" y="-128" width="14" height="30" fill="#001630" />
      {/* door */}
      <rect x="-12" y="-40" width="24" height="40" rx="2" fill="#0a2850" />
      <circle cx="6" cy="-20" r="1.6" fill="#ffbf00" />
      {/* steady window */}
      <rect x="-50" y="-62" width="26" height="22" rx="2" fill="#ffbf00" />
      <path d="M-37 -62 V-40 M-50 -51 H-24" stroke="#1f4477" strokeWidth="2" />
      {/* window being repaired: flickers, then shines */}
      <rect x="24" y="-62" width="26" height="22" rx="2" fill="#ffbf00" className="animate-fixed" />
      <path d="M37 -62 V-40 M24 -51 H50" stroke="#1f4477" strokeWidth="2" />

      {/* ladder leaning on the wall */}
      <path d="M96 0 L72 -96 M110 0 L86 -96" stroke="#b9c3cd" strokeWidth="2.5" strokeLinecap="round" />
      {LADDER_RUNGS.map((h) => {
        const t = h / 96;
        return (
          <path
            key={h}
            d={`M${96 - 24 * t} ${-h} H${110 - 24 * t}`}
            stroke="#b9c3cd"
            strokeWidth="2"
          />
        );
      })}

      {/* technician on the ladder */}
      <g transform="translate(92 -58)">
        <path d="M-2 14 L-6 28 M4 14 L6 28" stroke="#001630" strokeWidth="3.5" strokeLinecap="round" />
        <rect x="-6" y="-4" width="12" height="19" rx="3" fill="#ffbf00" />
        <rect x="-6" y="4" width="12" height="2.5" fill="#002147" opacity="0.5" />
        <circle cx="0" cy="-10" r="5" fill="#f5d189" />
        <path d="M-6 -11 a6 6 0 0 1 12 0 Z" fill="#eaa221" />
        {/* arm reaching up to the light fitting, holding a turning wrench */}
        <path d="M-3 0 L-12 -14" stroke="#ffbf00" strokeWidth="3.5" strokeLinecap="round" />
        <g transform="translate(-13 -16)">
          <g className="vf-origin-center animate-tighten">
            <path d="M0 0 L-9 -9" stroke="#d6dde4" strokeWidth="3" strokeLinecap="round" />
            <circle cx="-10" cy="-10" r="3.2" fill="none" stroke="#d6dde4" strokeWidth="2.2" />
          </g>
        </g>
      </g>

      {/* sparks where the fix is happening */}
      {[
        { x: 66, y: -84, d: 0 },
        { x: 58, y: -92, d: 0.6 },
        { x: 72, y: -96, d: 1.1 },
      ].map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`}>
          <path
            d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z"
            fill="#ffe180"
            className="vf-origin-center animate-spark"
            style={{ animationDelay: `${s.d}s` }}
          />
        </g>
      ))}
    </g>
  );
}

export default function ValleyScene({
  progress,
  edgeFill,
  showRoad = true,
  showSun = true,
  showRepair = true,
  sun = { x: 1080, y: 470 },
  className = "",
}: {
  progress?: MotionValue<number>;
  edgeFill?: string;
  /** The winding road with the ValleyFix van. */
  showRoad?: boolean;
  showSun?: boolean;
  /** The house being repaired and the floating tools. */
  showRepair?: boolean;
  /** Sun centre in the 1440x900 scene. */
  sun?: { x: number; y: number };
  className?: string;
}) {
  const fallback = useMotionValue(0);
  const p = progress ?? fallback;
  const reduceMotion = useReducedMotion();
  const rootRef = usePauseOffscreen<HTMLDivElement>();
  const narrow = useNarrow();

  // Unique SVG ids, so two scenes on one page never clash.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = {
    sun: `sun-${uid}`,
    glow: `glow-${uid}`,
    haze: `haze-${uid}`,
    road: `road-${uid}`,
  };

  // Parallax: further layers travel further down as you scroll.
  const sunY = useTransform(p, [0, 1], [0, 260]);
  const skyY = useTransform(p, [0, 1], [0, 200]);
  const farY = useTransform(p, [0, 1], [0, 170]);
  const midY = useTransform(p, [0, 1], [0, 110]);
  const nearY = useTransform(p, [0, 1], [0, 60]);
  const frontY = useTransform(p, [0, 1], [0, 25]);

  return (
    <div ref={rootRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Drifting clouds (HTML, so they can blur cheaply) */}
      <div className="absolute left-0 top-[14%] h-10 w-72 animate-drift rounded-full bg-white/10 blur-2xl [animation-duration:85s]" />
      <div className="absolute left-0 top-[28%] h-8 w-56 animate-drift rounded-full bg-gold-200/10 blur-2xl [animation-delay:-40s] [animation-duration:70s]" />
      <div className="absolute left-0 top-[8%] h-6 w-40 animate-drift rounded-full bg-white/10 blur-xl [animation-delay:-20s] [animation-duration:95s]" />

      <svg viewBox="0 0 1440 900" preserveAspectRatio={narrow ? "xMaxYMax slice" : "xMidYMax slice"} className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={ids.sun} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe180" />
            <stop offset="55%" stopColor="#ffbf00" />
            <stop offset="100%" stopColor="#eaa221" />
          </radialGradient>
          <radialGradient id={ids.glow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffbf00" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#eaa221" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#eaa221" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={ids.haze} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffbf00" stopOpacity="0" />
            <stop offset="100%" stopColor="#eaa221" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* Stars + floating tool constellations */}
        <motion.g style={{ y: skyY }}>
          {STARS.map((star, i) => (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="#fff0bf"
              // Only every third star twinkles: fewer moving parts = less redrawing.
              className={i % 3 === 0 ? "animate-twinkle" : undefined}
              opacity={i % 3 === 0 ? undefined : 0.55}
              style={i % 3 === 0 ? { animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` } : undefined}
            />
          ))}
          {showRepair &&
            TOOLS.map(({ icon: Icon, x, y, size, delay }, i) => (
              <g key={i} transform={`translate(${x} ${y})`} opacity="0.32">
                <g className="animate-float-lite" style={{ animationDelay: `${delay}s`, animationDuration: `${6 + i}s` }}>
                  <Icon size={size} color="#ffbf00" strokeWidth={1.4} />
                </g>
              </g>
            ))}
        </motion.g>

        {/* Rising sun */}
        {showSun && (
          <motion.g style={{ y: sunY }}>
            <circle cx={sun.x} cy={sun.y} r="300" fill={`url(#${ids.glow})`} className="vf-origin-center animate-glow" />
            <circle cx={sun.x} cy={sun.y} r="92" fill={`url(#${ids.sun})`} />
          </motion.g>
        )}

        {/* Warm haze over the horizon */}
        <rect x="0" y="330" width="1440" height="260" fill={`url(#${ids.haze})`} />

        {/* Far hills */}
        <motion.path
          style={{ y: farY }}
          d="M0 560 C160 470 320 500 480 540 C640 580 760 470 940 460 C1110 450 1250 520 1440 480 L1440 1000 L0 1000 Z"
          fill="#1a3a68"
        />

        {/* Middle hills + village */}
        <motion.g style={{ y: midY }}>
          <path
            d="M0 640 C180 560 360 600 520 640 C700 685 860 590 1040 585 C1210 580 1320 630 1440 610 L1440 1000 L0 1000 Z"
            fill="#12325e"
          />
          {VILLAGE.map((h, i) => (
            <g key={i} transform={`translate(${h.x} ${h.y}) scale(${h.s})`}>
              <path d="M-12 0 L0 -12 L12 0 V12 H-12 Z" fill="#0a2850" />
              <rect x="-4" y="2" width="8" height="6" rx="1" fill="#ffbf00" className="animate-flicker" style={{ animationDelay: `${i * 0.7}s` }} />
            </g>
          ))}
        </motion.g>

        {/* Near hills: the road, the van and the house being repaired */}
        <motion.g style={{ y: nearY }}>
          <path
            d="M0 720 C220 650 420 700 640 730 C860 760 1040 680 1240 690 C1340 695 1400 710 1440 705 L1440 1000 L0 1000 Z"
            fill="#0a2850"
          />

          {showRoad && (
            <>
              <path id={ids.road} d={ROAD} stroke="#001630" strokeWidth="22" strokeLinecap="round" fill="none" />
              <path d={ROAD} stroke="#ffbf00" strokeWidth="2.5" strokeDasharray="14 18" strokeLinecap="round" fill="none" opacity="0.7" />

              {reduceMotion ? (
                <g transform="translate(1150 767) rotate(-2)">
                  <Van />
                </g>
              ) : (
                <g>
                  <Van />
                  {/* Drive up the road once, then stay parked at the house (no further cost).
                      Discrete steps at ~20 fps: every van move repaints the hill layer. */}
                  <animateMotion dur="6s" repeatCount="1" fill="freeze" rotate="auto" keyPoints={DRIVE.points} keyTimes={DRIVE.times} calcMode="discrete">
                    <mpath href={`#${ids.road}`} />
                  </animateMotion>
                </g>
              )}
            </>
          )}
        </motion.g>

        {/* Front hills */}
        <motion.path
          style={{ y: frontY }}
          d="M0 800 C260 750 520 790 760 805 C1000 820 1220 770 1440 785 L1440 1000 L0 1000 Z"
          fill="#001630"
        />

        {/* The house being repaired sits on the slope in front */}
        {showRepair && (
          <motion.g style={{ y: frontY }}>
            <g transform="translate(1272 772) scale(0.9)">
              <RepairHouse />
            </g>
          </motion.g>
        )}

        {/* Curved edge that blends into the next section */}
        {edgeFill && <path d="M0 872 C360 838 1080 902 1440 858 L1440 900 L0 900 Z" fill={edgeFill} />}
      </svg>
    </div>
  );
}
