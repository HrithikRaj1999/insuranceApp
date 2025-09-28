import { Box, useTheme, useMediaQuery, BoxProps } from "@mui/material";
import React, { ReactNode } from "react";
const HeightWrapper = ({
  children,
  width = "100%",
  ...rest
}: {
  children?: ReactNode;
  width?: string | number | null;
} & BoxProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return <Box sx={{
    width: isMobile ? "100%" : width,
    height: `calc(100vh - ${isMobile ? theme.spacing(0) : theme.spacing(4)})`,
    display: "flex",
    flexDirection: "column",
    overflowY: "scroll",
    boxSizing: "border-box",
    maxWidth: "100vw",
    ...rest
  }}>
      {children}
    </Box>;
};
export default HeightWrapper;