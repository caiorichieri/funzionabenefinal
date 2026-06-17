import { motion } from "framer-motion";

/**
 * FunzionaBene mascots — minimalist line-art characters.
 *
 * Theme/color variants available:
 *   - "light" (dark ink lines, for cream/light backgrounds)
 *   - "dark"  (cream ink lines, for dark/navy backgrounds)
 *   - "gold"  (warm amber #D4A017 lines, accent color)
 *   - "blue"  (steel blue #6B8FA3 lines, secondary accent)
 *
 * Animation `none|float|wiggle|breathe|peek` for subtle micro-motion.
 */
export const MASCOTS = [
  "embrulhado", "peludo", "ovo", "abbraccio",
  "coppia", "saltitante", "pensativo", "sereno", "curioso",
];

const ANIMATIONS = {
  none: {},
  float: {
    animate: { y: [0, -8, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  wiggle: {
    animate: { rotate: [-2, 2, -2] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  breathe: {
    animate: { scale: [1, 1.04, 1] },
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
  peek: {
    initial: { x: -20, opacity: 0 },
    whileInView: { x: 0, opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Mascotte({
  name = "ovo",
  theme = "light",
  size = 140,
  maxHeight,
  animation = "float",
  className = "",
  alt = "",
}) {
  // Map theme to variant filename
  let variant;
  if (theme === "dark") variant = "cream";
  else if (theme === "gold") variant = "gold";
  else if (theme === "blue") variant = "blue";
  else variant = "dark";

  // Brand-coloured mascots: filled body with black outlines.
  // These overrides apply regardless of theme prop.
  const BRAND_FILLS = {
    abbraccio:   "/mascotte/abbraccio-orange.png",
    sereno:      "/mascotte/sereno-white.png",
    embrulhado:  "/mascotte/embrulhado-peach.png",
    peludo:      "/mascotte/peludo-sage.png",
    ovo:         "/mascotte/ovo-blue.png",
    coppia:      "/mascotte/coppia-coral.png",
    saltitante:  "/mascotte/saltitante-terracotta.png",
    pensativo:   "/mascotte/pensativo-lavender.png",
    curioso:     "/mascotte/curioso-sky.png",
    vr:          "/mascotte/vr-brand.png",
  };
  const src = BRAND_FILLS[name] || `/mascotte/${name}-${variant}.png`;
  const motionProps = ANIMATIONS[animation] || ANIMATIONS.none;

  return (
    <motion.div
      {...motionProps}
      className={`inline-block select-none pointer-events-none ${className}`}
      style={{
        width: size,
        height: maxHeight ? maxHeight : "auto",
        maxHeight: maxHeight || undefined,
      }}
      data-testid={`mascot-${name}`}
    >
      <img
        src={src}
        alt={alt || name}
        loading="lazy"
        draggable={false}
        style={{
          width: "100%",
          height: maxHeight ? "100%" : "auto",
          maxHeight: maxHeight || undefined,
          objectFit: maxHeight ? "contain" : undefined,
          display: "block",
        }}
      />
    </motion.div>
  );
}
