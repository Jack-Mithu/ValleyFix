"use client";

import {
  Bath,
  Flame,
  Lightbulb,
  Plug,
  ShowerHead,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { usePauseOffscreen } from "./usePauseOffscreen";

/*
 * A blueprint-style cross-section of a house, showing the systems ValleyFix
 * technicians work on: water pipes (blue, water flowing) and electrical wiring
 * (gold, current flowing), with fixtures marked and a leak being repaired.
 * Used as a faint animated background on dark sections.
 */

const GOLD = "#ffbf00";
const WATER = "#8aa6cc";
const LINE = "#b7c9e1";

// House outline: two floors, four rooms.
const WALL = { left: 430, right: 1010, ground: 690, floor: 490, eaves: 290 };

const FIXTURES: { icon: LucideIcon; x: number; y: number; color: string }[] = [
  { icon: ShowerHead, x: 470, y: 330, color: WATER },
  { icon: Bath, x: 520, y: 430, color: WATER },
  { icon: Flame, x: 470, y: 620, color: WATER },
  { icon: Zap, x: 950, y: 620, color: GOLD },
  { icon: Plug, x: 860, y: 640, color: GOLD },
  { icon: Plug, x: 640, y: 440, color: GOLD },
];

const LIGHTS = [
  { x: 575, y: 300 },
  { x: 865, y: 300 },
  { x: 575, y: 500 },
  { x: 865, y: 500 },
];

// Blueprint grid lines.
const GRID_X = Array.from({ length: 25 }, (_, i) => i * 60);
const GRID_Y = Array.from({ length: 14 }, (_, i) => i * 60);

export default function HouseBlueprint({ className = "" }: { className?: string }) {
  const { left, right, ground, floor, eaves } = WALL;
  const mid = (left + right) / 2;
  const ref = usePauseOffscreen<SVGSVGElement>();

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {/* Grid */}
      <g stroke={LINE} strokeWidth="0.6" opacity="0.35">
        {GRID_X.map((x) => <path key={`x${x}`} d={`M${x} 0 V760`} />)}
        {GRID_Y.map((y) => <path key={`y${y}`} d={`M0 ${y} H1440`} />)}
      </g>

      {/* Structure */}
      <g fill="none" stroke={LINE} strokeWidth="2.2" strokeLinejoin="round">
        <path d={`M${left - 40} ${eaves + 6} L${mid} 90 L${right + 40} ${eaves + 6}`} />
        <path d={`M${left} ${eaves} V${ground} H${right} V${eaves}`} />
        <path d={`M${left} ${floor} H${right}`} />
        <path d={`M${mid} ${eaves} V${ground}`} />
        {/* stairs */}
        <path d={`M${mid + 20} ${ground} h30 v-25 h30 v-25 h30 v-25 h30 v-25 h30 v-25 h30 v-25 h30 v-25`} strokeWidth="1.6" />
        {/* door + windows */}
        <path d={`M${right - 70} ${ground} V${ground - 90} H${right - 20} V${ground}`} strokeWidth="1.6" />
        <rect x={left + 150} y={eaves + 60} width="70" height="60" strokeWidth="1.6" />
        <rect x={right - 220} y={eaves + 60} width="70" height="60" strokeWidth="1.6" />
      </g>

      {/* Dimension lines */}
      <g stroke={LINE} strokeWidth="1" opacity="0.8" fill={LINE} fontFamily="monospace" fontSize="14">
        <path d={`M${left} ${ground + 40} H${right} M${left} ${ground + 32} V${ground + 48} M${right} ${ground + 32} V${ground + 48}`} fill="none" />
        <text x={mid} y={ground + 62} textAnchor="middle" stroke="none">11.6 m</text>
        <path d={`M${left - 50} ${eaves} V${ground} M${left - 58} ${eaves} H${left - 42} M${left - 58} ${ground} H${left - 42}`} fill="none" />
        <text x={left - 62} y={(eaves + ground) / 2} textAnchor="end" stroke="none">8.0 m</text>
        <text x={mid} y="70" textAnchor="middle" stroke="none" letterSpacing="3">ELEVATION · SECTION A–A</text>
      </g>

      {/* Water supply: enters at the ground, rises to the radiator, bath and shower */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d={`M${left - 120} ${ground - 20} H${left + 30} V${floor + 70} H${left + 90} M${left + 30} ${floor + 70} V${floor - 50} H${left + 90} M${left + 30} ${floor - 50} V${eaves + 40}`}
          stroke={WATER}
          strokeWidth="3"
          opacity="0.5"
        />
        <path
          d={`M${left - 120} ${ground - 20} H${left + 30} V${floor + 70} H${left + 90} M${left + 30} ${floor + 70} V${floor - 50} H${left + 90} M${left + 30} ${floor - 50} V${eaves + 40}`}
          stroke={WATER}
          strokeWidth="3"
          strokeDasharray="4 14"
          className="animate-flow"
        />
      </g>

      {/* Electrical: from the fuse box up through the house to every light and socket */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {[
          `M${right - 60} ${ground - 70} V${floor + 10} H${left + 145} V${floor + 10}`,
          `M${right - 60} ${floor + 10} V${eaves + 10} H${left + 145}`,
          `M${right - 60} ${ground - 70} H${right - 150} V${ground - 50}`,
          `M${left + 210} ${eaves + 10} V${floor - 50}`,
        ].map((d, i) => (
          <g key={i}>
            <path d={d} stroke={GOLD} strokeWidth="2.2" opacity="0.35" />
            <path d={d} stroke={GOLD} strokeWidth="2.2" strokeDasharray="3 16" className="animate-flow" style={{ animationDuration: `${2.2 + i * 0.3}s` }} />
          </g>
        ))}
      </g>

      {/* Ceiling lights glowing */}
      {LIGHTS.map((l, i) => (
        <g key={i} transform={`translate(${l.x - 12} ${l.y - 2})`}>
          <Lightbulb size={24} color={GOLD} strokeWidth={1.6} />
        </g>
      ))}

      {/* Fixtures */}
      {FIXTURES.map(({ icon: Icon, x, y, color }, i) => (
        <g key={i} transform={`translate(${x - 14} ${y - 14})`}>
          <Icon size={28} color={color} strokeWidth={1.5} />
        </g>
      ))}

      {/* A leak being fixed: pulsing marker + turning wrench */}
      <g transform={`translate(${left + 30} ${floor + 20})`}>
        <circle r="10" fill={GOLD} opacity="0.5" className="vf-origin-center animate-pulse-lite" />
        <circle r="6" fill={GOLD} />
        <g transform="translate(14 -34)">
          <g className="vf-origin-center animate-tighten">
            <Wrench size={26} color={GOLD} strokeWidth={1.8} />
          </g>
        </g>
        <text x="46" y="-18" fill={GOLD} fontFamily="monospace" fontSize="13" letterSpacing="1">
          LEAK · FIXED
        </text>
      </g>
    </svg>
  );
}
