import React from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { makeTheme } from "@/config/makeTheme";
import { ThemeModeProvider, useThemeMode } from "@/context/ThemeContext";
import { router } from "@route/router.js";
import "./App.css";
const ThemedApp: React.FC = () => {
  const {
    mode
  } = useThemeMode();
  const theme = React.useMemo(() => makeTheme(mode), [mode]);
  return <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>;
};
const App: React.FC = () => <ThemeModeProvider>
    <ThemedApp />
  </ThemeModeProvider>;
export default App;