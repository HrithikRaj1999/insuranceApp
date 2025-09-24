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
        <Box
          sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
        >
          <AppBar position="static" elevation={0}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Happy Claim
              </Typography>
            </Toolbar>
          </AppBar>

          <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
            {children}
          </Container>

          {/* Footer */}
          <Box
            component="footer"
            sx={{ borderTop: 1, borderColor: "divider", py: 3 }}
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
          </Box>
        </Box>
      </HeightWrapper>
    </ThemeProvider>
  );
};

export default Layout;
