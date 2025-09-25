
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Divider,
  Container,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as ClaimIcon,
  List as ListIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  DarkMode as DarkIcon,
  LightMode as LightIcon,
} from "@mui/icons-material";
import { useThemeMode } from "@/context/ThemeContext";
import { brandGradient } from "@/config/makeTheme";
import { navItems } from "@route/RouteElements.js";

const iconMap: Record<string, React.ElementType> = {
  "/dashboard": DashboardIcon,
  "/submit": ClaimIcon,
  "/claims": ListIcon,
  "/reports": ReportsIcon,
  "/settings": SettingsIcon,
};

const drawerWidth = 280;

const Layout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode, toggle } = useThemeMode();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = !isMobile;

  useEffect(() => {
    setDrawerOpen(isDesktop);
  }, [isDesktop]);

  const handleNavigation = (path: string, available: boolean) => {
    if (!available) return;
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  const headerBg = theme.palette.background.paper;

  const drawerContent = (
    <>
      
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src="/vite.svg" width={32} height={32} alt="logo" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Happy Claim
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <List>
          {navItems.map((item) => {
            const Icon = iconMap[item.path];
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path, item.available)}
                  disabled={!item.available}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive
                      ? theme.palette.action.selected
                      : "transparent",
                    "&:hover": { bgcolor: theme.palette.action.hover },
                    opacity: item.available ? 1 : 0.6,
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon color={isActive ? "primary" : "action"} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>{item.label}</span>
                        {!item.available && (
                          <Chip
                            label="Soon"
                            size="small"
                            sx={{ height: 18, fontSize: "0.65rem" }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{ zIndex: theme.zIndex.drawer + 1, backgroundColor: headerBg }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton edge="start" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Happy Claim
            </Typography>

            
            <Tooltip
              title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
            >
              <IconButton onClick={toggle}>
                {mode === "light" ? <DarkIcon /> : <LightIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}

      
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        
        {isDesktop && (
          <AppBar position="sticky">
            <Toolbar sx={{ backgroundColor: headerBg }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {navItems.find((n) => n.path === location.pathname)?.label ??
                  "Overview"}
              </Typography>
              <Tooltip
                title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
              >
                <IconButton onClick={toggle}>
                  {mode === "light" ? <DarkIcon /> : <LightIcon />}
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
        )}

        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
