import React from "react";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Link,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/config/theme.js";
import HeightWrapper from "./HeightWrapper.js";

interface LayoutProps {
  children: React.ReactNode;
  footer?: {
    developerName?: string;
    pdfHref?: string;
    appDescription?: string;
    year?: number;
  };
}

const HEADER_HEIGHT = 50; // px
const FOOTER_HEIGHT = 60; // px

const Layout: React.FC<LayoutProps> = ({ children, footer }) => {
  const {
    developerName = "Hrithik Raj",
    pdfHref = "/assets/Hrithik_Raj_Software_developer.pdf",
    appDescription = "Insurance claim assistant — smart, fast and accurate.",
    year = new Date().getFullYear(),
  } = footer || {};

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HeightWrapper>
        <Box sx={{ minHeight: "100dvh" }}>
          <AppBar
            position="fixed"
            elevation={0}
            sx={{ height: HEADER_HEIGHT, justifyContent: "center" }}
          >
            <Toolbar sx={{ minHeight: HEADER_HEIGHT }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <img src="/vite.svg" width={32} height={32} alt="logo" />
                Happy Claim
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Top spacer to offset fixed header */}
          <Box sx={{ height: HEADER_HEIGHT }} />

          {/* Main content with bottom padding to avoid footer overlap */}
          <Container
            component="main"
            sx={{
              py: 4,
              pb: `calc(${FOOTER_HEIGHT}px + 16px)`,
              minHeight: `calc(100dvh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
            }}
          >
            {children}
          </Container>

          {/* Sticky Footer */}
          <Paper
            component="footer"
            square
            elevation={3}
            sx={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              height: FOOTER_HEIGHT,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Container>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {appDescription}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    © {year} • Developed by{" "}
                    <Link
                      href={pdfHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      {developerName}
                    </Link>
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    href={pdfHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Developer PDF
                  </Button>
                </Stack>
              </Stack>
            </Container>
          </Paper>
        </Box>
      </HeightWrapper>
    </ThemeProvider>
  );
};

export default Layout;
