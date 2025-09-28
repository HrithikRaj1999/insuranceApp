import React from "react";
import { Box, Container, Paper, Typography, Divider, ToggleButton, ToggleButtonGroup, Stack } from "@mui/material";
import { useThemeMode } from "@context/ThemeContext";
const SettingsPage: React.FC = () => {
  const {
    mode,
    setMode,
    toggle
  } = useThemeMode();
  return <Container maxWidth="sm" sx={{
    py: 4
  }}>
      <Paper variant="outlined" sx={{
      p: 3
    }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Settings
        </Typography>
        <Divider sx={{
        my: 2
      }} />

        <Typography variant="subtitle1" gutterBottom>
          Theme
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup value={mode} exclusive onChange={(_, val) => val && setMode(val)} aria-label="theme mode">
            <ToggleButton value="light" aria-label="light mode">
              Light
            </ToggleButton>
            <ToggleButton value="dark" aria-label="dark mode">
              Dark
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Box sx={{
        mt: 2
      }}>
          <Typography variant="body2" color="text.secondary">
            Your preference is saved locally and applied across the app.
          </Typography>
        </Box>
      </Paper>
    </Container>;
};
export default SettingsPage;