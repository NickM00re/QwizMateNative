// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

// Ported 1:1 from the Figma export's src/styles/theme.css (:root / light theme).
export const colors: Record<string, string> = {
  background: "#f7f6ff",
  foreground: "#1c1b2e",
  card: "#ffffff",
  cardForeground: "#1c1b2e",
  primary: "#6366f1",
  primaryForeground: "#ffffff",
  secondary: "#eef0ff",
  secondaryForeground: "#4338ca",
  muted: "#f0effa",
  mutedForeground: "#7171a0",
  accent: "#8b5cf6",
  accentForeground: "#ffffff",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  border: "rgba(99, 102, 241, 0.14)",

  // Utility colors used inline throughout the original screens
  white: "#ffffff",
  black: "#000000",

  emerald50: "#ecfdf5",
  emerald400: "#34d399",
  emerald500: "#10b981",
  emerald600: "#059669",
  emerald800: "#065f46",

  red50: "#fef2f2",
  red400: "#f87171",
  red500: "#ef4444",
  red800: "#991b1b",

  amber50: "#fffbeb",
  amber100: "#fef3c7",
  amber200: "#fde68a",
  amber600: "#d97706",
  amber700: "#b45309",

  indigo50: "#eef2ff",
  indigo100: "#e0e7ff",
  indigo200: "#c7d2fe",
  indigo500: "#6366f1",
  indigo600: "#4f46e5",
  indigo700: "#4338ca",
  indigo800: "#3730a3",

  orange300: "#fdba74",

  gradientPrimaryStart: "#4F46E5",
  gradientPrimaryEnd: "#7C3AED",
  gradientAccentStart: "#6366F1",
  gradientAccentEnd: "#8B5CF6",
};

// Cycled through when a new project is created, so courses get a readable
// color without the user having to pick one.
export const PROJECT_COLOR_PRESETS: { color: string; bg: string }[] = [
  { color: "#6366F1", bg: "#EEEFFE" }, // indigo
  { color: "#10B981", bg: "#ECFDF5" }, // emerald
  { color: "#F59E0B", bg: "#FFFBEB" }, // amber
  { color: "#EF4444", bg: "#FEF2F2" }, // red
  { color: "#8B5CF6", bg: "#F5F3FF" }, // violet
  { color: "#0EA5E9", bg: "#F0F9FF" }, // sky
  { color: "#EC4899", bg: "#FDF2F8" }, // pink
  { color: "#14B8A6", bg: "#F0FDFA" }, // teal
];

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Same helper as scoreColor() in the original App.tsx
export function scoreColor(score: number): string {
  if (score >= 85) return colors.emerald500;
  if (score >= 70) return "#F59E0B";
  return colors.red500;
}

// Adds an alpha suffix to a hex color, mirroring `color + "22"` string
// concatenation used throughout the original web app.
export function withAlpha(hex: string, alphaHex: string): string {
  return `${hex}${alphaHex}`;
}
