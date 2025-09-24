import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography } from '@mui/material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/config/theme.js';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Insurance Claim Portal
            </Typography>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;