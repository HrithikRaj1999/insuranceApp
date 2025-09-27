import React from "react";
import { Box, Typography, Chip, Paper } from "@mui/material";
import { keyframes } from "@mui/system";
import HeightWrapper from "@components/UI/HeightWrapper";
const float = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(-2deg);
  }
  50% {
    transform: translateY(-20px) rotate(0deg);
  }
  75% {
    transform: translateY(-10px) rotate(2deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;
const smokeUp = keyframes`
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-40px) translateX(10px) scale(2);
    opacity: 0;
  }
`;
const twinkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;
const flicker = keyframes`
  0% {
    transform: scaleY(1) scaleX(1);
    opacity: 0.9;
  }
  100% {
    transform: scaleY(1.1) scaleX(0.95);
    opacity: 1;
  }
`;
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;
const loading = keyframes`
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(300%);
  }
`;
export const RocketAnimation: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: 150,
    }}
  >
    <svg width="120" height="150" viewBox="0 0 120 150">
      <g
        style={{
          animation: `${float} 3s ease-in-out infinite`,
          transformOrigin: "center",
        }}
      >
        <path
          d="M60 10 L75 50 L70 70 L50 70 L45 50 Z"
          fill="url(#rocketBodyGradient)"
          stroke="#5a67d8"
          strokeWidth="1"
        />

        <path d="M60 10 L65 25 L55 25 Z" fill="#ff6b6b" />

        <path d="M45 45 L30 65 L40 65 L45 55 Z" fill="#667eea" opacity="0.9" />

        <path d="M75 45 L90 65 L80 65 L75 55 Z" fill="#667eea" opacity="0.9" />

        <circle cx="60" cy="35" r="8" fill="#1a202c" opacity="0.3" />
        <circle cx="60" cy="35" r="6" fill="#63b3ed" />
        <circle cx="62" cy="33" r="2" fill="#bee3f8" opacity="0.8" />

        <rect x="55" y="50" width="10" height="3" rx="1" fill="#4a5568" opacity="0.5" />
        <rect x="55" y="55" width="10" height="3" rx="1" fill="#4a5568" opacity="0.5" />
      </g>

      <g
        style={{
          animation: `${flicker} 0.2s ease-in-out infinite alternate`,
          transformOrigin: "center top",
        }}
      >
        <path d="M50 70 L60 95 L70 70 Z" fill="#ff6b6b" opacity="0.9" />

        <path d="M53 70 L60 88 L67 70 Z" fill="#ffd93d" opacity="0.9" />

        <path d="M56 70 L60 80 L64 70 Z" fill="#fff" opacity="0.8" />
      </g>

      <g opacity="0.4">
        <circle cx="55" cy="100" r="4" fill="#9ca3af" />
        <circle cx="60" cy="105" r="3" fill="#9ca3af" />
        <circle cx="65" cy="100" r="3.5" fill="#9ca3af" />
        <circle cx="58" cy="110" r="2.5" fill="#9ca3af" />
        <circle cx="62" cy="108" r="2" fill="#9ca3af" />
      </g>

      <g
        style={{
          animation: `${twinkle} 2s ease-in-out infinite`,
        }}
      >
        <circle cx="20" cy="30" r="1" fill="#ffd93d" />
        <circle cx="100" cy="40" r="1" fill="#ffd93d" />
        <circle cx="15" cy="60" r="1" fill="#ffd93d" />
        <circle cx="95" cy="20" r="1" fill="#ffd93d" />
        <circle cx="30" cy="15" r="1" fill="#ffd93d" />
        <circle cx="85" cy="55" r="1" fill="#ffd93d" />
      </g>

      <defs>
        <linearGradient id="rocketBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#667eea" />
        </linearGradient>
      </defs>
    </svg>
  </Box>
);
const ComingSoon: React.FC<{
  feature: string;
}> = ({ feature }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      textAlign: "center",
      p: 4,
      position: "relative",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage:
          "radial-gradient(circle at 20% 50%, #667eea 0%, transparent 50%), radial-gradient(circle at 80% 80%, #764ba2 0%, transparent 50%)",
        pointerEvents: "none",
      }}
    />

    <Box
      sx={{
        mb: 3,
        position: "relative",
        zIndex: 1,
      }}
    >
      <RocketAnimation />
    </Box>

    <Typography
      variant="h2"
      sx={{
        fontWeight: 700,
        mb: 2,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: `${fadeInUp} 0.8s ease-out`,
      }}
    >
      {feature} Coming Soon
    </Typography>

    <Typography
      variant="h6"
      color="text.secondary"
      sx={{
        maxWidth: 500,
        mb: 3,
        animation: `${fadeInUp} 0.8s ease-out 0.2s backwards`,
      }}
    >
      We're working hard to bring you this feature.<br/>
      Stay tuned for updates!<br/>
      Susbscribe via email to get latest updates.
    </Typography>

    <Box
      sx={{
        width: 200,
        height: 4,
        bgcolor: "grey.200",
        borderRadius: 1,
        overflow: "hidden",
        position: "relative",
        mb: 3,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "40%",
          background: "linear-gradient(90deg, #667eea, #764ba2)",
          animation: `${loading} 2s ease-in-out infinite`,
          borderRadius: 1,
        }}
      />
    </Box>

    <Chip
      label="In Development"
      variant="outlined"
      sx={{
        borderColor: "#667eea",
        color: "#667eea",
        fontWeight: 600,
        fontSize: "0.9rem",
        px: 2,
        py: 0.5,
        animation: `${pulse} 2s ease-in-out infinite`,
      }}
    />

    <Box
      sx={{
        mt: 6,
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {["Analytics", "Automation", "Integration"].map((item, index) => (
        <Paper
          key={item}
          elevation={0}
          sx={{
            p: 2,
            px: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            animation: `${fadeInUp} 0.8s ease-out ${0.4 + index * 0.1}s backwards`,
            "&:hover": {
              borderColor: "#667eea",
              transform: "translateY(-2px)",
              transition: "all 0.3s ease",
            },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {item}
          </Typography>
        </Paper>
      ))}
    </Box>
  </Box>
);
export default ComingSoon;
