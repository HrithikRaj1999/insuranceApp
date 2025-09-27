import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
type LoaderProps = {
  label?: string;
  fullScreen?: boolean;
  size?: number;
};
const Loader: React.FC<LoaderProps> = ({ label = "Loading…", fullScreen = true, size = 72 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const bg = theme.palette.background.default;
  const fg = theme.palette.background.paper;
  const ringTrack = alpha(isDark ? "#fff" : "#000", isDark ? 0.08 : 0.06);
  const glow = alpha(theme.palette.primary.main, 0.35);
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: fullScreen ? "fixed" : "relative",
        inset: fullScreen ? 0 : "unset",
        minHeight: fullScreen ? "100dvh" : "100%",
        width: "100%",
        display: "grid",
        placeItems: "center",
        background: bg,
        zIndex: fullScreen ? theme.zIndex.modal + 1 : "auto",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: isDark
            ? "none"
            : `radial-gradient(${alpha("#000", 0.03)} 1px, transparent 1px)`,
          backgroundSize: isDark ? "auto" : "24px 24px",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "-18px",
            borderRadius: "16px",
            backgroundColor: fg,
            border: `1px solid ${theme.palette.divider}`,
            filter: "blur(0.5px)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "-8px",
            borderRadius: "50%",
            boxShadow: `0 0 32px ${glow}, 0 8px 32px ${alpha(glow, 0.25)}`,
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `conic-gradient(${ringTrack} 0deg, ${ringTrack} 360deg)`,
            mask: `radial-gradient(farthest-side, transparent calc(50% - 6px), #000 calc(50% - 5px))`,
            WebkitMask: `radial-gradient(farthest-side, transparent calc(50% - 6px), #000 calc(50% - 5px))`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `conic-gradient(${theme.palette.primary.main} 0deg, ${theme.palette.secondary.main} 140deg, transparent 150deg 360deg)`,
            mask: `radial-gradient(farthest-side, transparent calc(50% - 6px), #000 calc(50% - 5px))`,
            WebkitMask: `radial-gradient(farthest-side, transparent calc(50% - 6px), #000 calc(50% - 5px))`,
            animation: "spin 1.1s linear infinite",
            "@keyframes spin": {
              to: {
                transform: "rotate(1turn)",
              },
            },
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: theme.palette.primary.main,
          }}
        />
      </Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mt: 3,
            color: theme.palette.text.secondary,
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};
export default Loader;
