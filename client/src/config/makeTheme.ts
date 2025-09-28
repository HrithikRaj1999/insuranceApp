import { createTheme, alpha } from "@mui/material/styles";
export type ThemeMode = "light" | "dark";
export const makeTheme = (mode: ThemeMode) => {
  const isDark = mode === "dark";
  const primary = {
    main: "#667eea"
  };
  const secondary = {
    main: "#764ba2"
  };
  return createTheme({
    palette: {
      mode,
      primary,
      secondary,
      background: isDark ? {
        default: "#0f1115",
        paper: "#12151b"
      } : {
        default: "#f7f8fb",
        paper: "#ffffff"
      },
      text: isDark ? {
        primary: "#eef0f5",
        secondary: alpha("#eef0f5", 0.7)
      } : {
        primary: "#111318",
        secondary: "#5a6072"
      },
      divider: isDark ? alpha("#eef0f5", 0.12) : "#E6E8F0"
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiPaper: {
        defaultProps: {
          elevation: 0
        },
        styleOverrides: {
          root: ({
            theme
          }) => ({
            backgroundImage: "none",
            border: `1px solid ${theme.palette.divider}`
          })
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({
            theme
          }) => ({
            backgroundImage: "none",
            backgroundColor: theme.palette.background.paper
          })
        }
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
          color: "default"
        },
        styleOverrides: {
          root: ({
            theme
          }) => ({
            backdropFilter: "blur(8px)",
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.background.paper, mode === "dark" ? 0.7 : 0.8)
          })
        }
      }
    }
  });
};