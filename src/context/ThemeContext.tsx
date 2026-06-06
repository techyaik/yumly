import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dark, light, ThemeColors } from "../constants/theme";

type ThemeMode = "system" | "dark" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MODE_ORDER: ThemeMode[] = ["system", "dark", "light"];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [isLoading, setIsLoading] = useState(true);
  const systemScheme = useColorScheme();

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem("theme_mode");
        if (saved === "system" || saved === "dark" || saved === "light") {
          setMode(saved);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const toggleMode = async () => {
    const idx = MODE_ORDER.indexOf(mode);
    const next = MODE_ORDER[(idx + 1) % MODE_ORDER.length];
    setMode(next);
    try {
      await AsyncStorage.setItem("theme_mode", next);
    } catch {
      // ignore
    }
  };

  const selectMode = async (m: ThemeMode) => {
    setMode(m);
    try {
      await AsyncStorage.setItem("theme_mode", m);
    } catch {
      // ignore
    }
  };

  const effectiveScheme = mode === "system" ? (systemScheme ?? "dark") : mode;
  const colors: ThemeColors = effectiveScheme === "dark" ? dark : light;

  if (isLoading) return null;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleMode, setMode: selectMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
