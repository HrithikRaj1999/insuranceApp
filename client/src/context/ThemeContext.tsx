import React from "react";
import type { ThemeMode } from "@/config/makeTheme";
type Ctx = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};
const ThemeModeContext = React.createContext<Ctx | null>(null);
const STORAGE_KEY = "ui.theme";
export const ThemeModeProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [mode, setMode] = React.useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return saved ?? "dark";
  });
  const update = React.useCallback((m: ThemeMode) => {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);
  const toggle = React.useCallback(() => update(mode === "light" ? "dark" : "light"), [mode, update]);
  const value = React.useMemo(() => ({
    mode,
    setMode: update,
    toggle
  }), [mode, update, toggle]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};
export const useThemeMode = () => {
  const ctx = React.useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
};