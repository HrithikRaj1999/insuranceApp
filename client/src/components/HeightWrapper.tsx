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
  return (
    <Box
      sx={{
        width: isMobile ? "100%" : width,
        height: `calc(100vh - ${
          isMobile ? theme.spacing(0) : theme.spacing(4)
        })`,
        display: "flex",
        flexDirection: "column",
        overflowY: "scroll",
        borderRadius: !isMobile ? "20px" : "0px",

        mt: isMobile ? "auto" : 2,
        mb: isMobile ? "auto" : 2,
        ml: isMobile ? "auto" : 2,
        mr: isMobile ? "auto" : 2, // marginRight minus!

        p: isMobile ? 1 : 2, // <-- smaller padding on mobile, larger on desktop
        pt: isMobile ? 6 : 2, // <-- smaller padding on mobile, larger on desktop
        boxSizing: "border-box",
        maxWidth: "100vw",
        ...rest,
      }}
    >
      {children}
    </Box>
  );
};

export default HeightWrapper;
