import Link from "next/link";

// tone="light" -> for light backgrounds, tone="dark" -> for Oxford Blue backgrounds.
export default function Logo({
  tone = "light",
  size = "md",
}: {
  tone?: "light" | "dark";
  size?: "md" | "lg";
}) {
  const tile = size === "lg" ? "h-11 w-11 text-xl" : "h-9 w-9 text-lg";
  const text = size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="ValleyFix home">
      <span
        className={`relative flex ${tile} items-center justify-center overflow-hidden rounded-xl font-bold shadow-md transition-transform duration-300 group-hover:-rotate-6 ${
          tone === "dark"
            ? "bg-gold-400 text-oxford-900 shadow-gold-500/30"
            : "bg-oxford-900 text-gold-400 shadow-oxford-900/25"
        }`}
      >
        {/* A tiny valley inside the logo tile */}
        <svg
          aria-hidden="true"
          viewBox="0 0 40 40"
          className="absolute inset-x-0 bottom-0 h-1/2 w-full"
        >
          <path
            d="M0 26 C10 16 18 22 24 18 C30 14 36 20 40 18 V40 H0 Z"
            fill={tone === "dark" ? "#002147" : "#ffffff"}
            opacity={tone === "dark" ? 0.18 : 0.14}
          />
        </svg>
        <span className="relative">V</span>
      </span>

      <span
        className={`${text} font-bold tracking-tight ${
          tone === "dark" ? "text-white" : "text-oxford-900"
        }`}
      >
        Valley
        <span className={tone === "dark" ? "text-gold-400" : "text-marigold-600"}>Fix</span>
      </span>
    </Link>
  );
}
