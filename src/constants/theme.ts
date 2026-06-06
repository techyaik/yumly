import { Platform } from "react-native";

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGlow: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  surface: string;
  card: string;
  elevated: string;
  bg3: string;
  glass: string;
  text: string;
  textSecondary: string;
  textLight: string;
  textMuted: string;
  text2: string;
  text3: string;
  accent: string;
  accentWarm: string;
  accentCool: string;
  border: string;
  borderLight: string;
  borderAccent: string;
  success: string;
  error: string;
  warning: string;
  veg: string;
  nonVeg: string;
  info: string;
  bg: string;
  inverseText: string;
  tabBarBg: string;
};

export const dark: ThemeColors = {
  primary: "#E8A838",
  primaryDark: "#D4654A",
  primaryLight: "rgba(232, 168, 56, 0.12)",
  primaryGlow: "rgba(232, 168, 56, 0.25)",
  secondary: "#8BA888",
  secondaryLight: "rgba(139, 168, 136, 0.12)",

  background: "#0D0D0F",
  surface: "#161618",
  card: "#1A1A1D",
  elevated: "#1E1D22",
  bg3: "#242428",
  glass: "rgba(255, 255, 255, 0.03)",

  text: "#F5F0EB",
  textSecondary: "#8A8690",
  textLight: "#8A8690",
  textMuted: "#5A5660",
  text2: "#8A8690",
  text3: "#5A5660",

  accent: "#E8A838",
  accentWarm: "#D4654A",
  accentCool: "#6B8EBF",

  border: "rgba(245, 240, 235, 0.06)",
  borderLight: "rgba(245, 240, 235, 0.1)",
  borderAccent: "rgba(232, 168, 56, 0.2)",

  success: "#8BA888",
  error: "#E85D5D",
  warning: "#E8A838",
  veg: "#8BA888",
  nonVeg: "#E85D5D",
  info: "#6B8EBF",

  bg: "#0D0D0F",

  inverseText: "#1A0E04",

  tabBarBg: "rgba(22, 22, 24, 0.92)",
} as const;

export const light: ThemeColors = {
  primary: "#E8A838",
  primaryDark: "#D4654A",
  primaryLight: "rgba(232, 168, 56, 0.12)",
  primaryGlow: "rgba(232, 168, 56, 0.25)",
  secondary: "#8BA888",
  secondaryLight: "rgba(139, 168, 136, 0.12)",

  background: "#FAF8F5",
  surface: "#F5F0EB",
  card: "#FFFFFF",
  elevated: "#F0EBE3",
  bg3: "#E8E3DA",
  glass: "rgba(0, 0, 0, 0.02)",

  text: "#1A1A1D",
  textSecondary: "#6B6670",
  textLight: "#6B6670",
  textMuted: "#9A959F",
  text2: "#6B6670",
  text3: "#9A959F",

  accent: "#E8A838",
  accentWarm: "#D4654A",
  accentCool: "#6B8EBF",

  border: "rgba(0, 0, 0, 0.06)",
  borderLight: "rgba(0, 0, 0, 0.08)",
  borderAccent: "rgba(232, 168, 56, 0.2)",

  success: "#8BA888",
  error: "#E85D5D",
  warning: "#E8A838",
  veg: "#8BA888",
  nonVeg: "#E85D5D",
  info: "#6B8EBF",

  bg: "#0D0D0F",

  inverseText: "#1A0E04",

  tabBarBg: "rgba(250, 248, 245, 0.92)",
};

export const COLORS = dark;

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  xs: 6,
  s: 10,
  m: 14,
  l: 20,
  xl: 28,
  xxl: 36,
  full: 100,
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  glow: {
    shadowColor: "#E8A838",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const FONTS = {
  serif: Platform.OS === "ios" ? "Georgia" : "serif",
  mono: Platform.OS === "ios" ? "Menlo" : "monospace",
};
