import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { keyframes } from '@mui/system';


const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const wave = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;


export const AnimatedSpinner: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      style={{ animation: `${spin} 2s linear infinite` }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="url(#gradient)"
        strokeWidth="4"
        fill="none"
        strokeDasharray="80 20"
      />
      <defs>
        <linearGradient id="gradient">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
    </svg>
  </Box>
);


export const AnimatedCheckmark: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="#4caf50"
        strokeWidth="4"
        fill="none"
        strokeDasharray="283"
        strokeDashoffset="283"
        style={{
          animation: 'drawCircle 0.6s ease-out forwards',
        }}
      />
      <path
        d="M30 50 L45 65 L70 35"
        stroke="#4caf50"
        strokeWidth="4"
        fill="none"
        strokeDasharray="60"
        strokeDashoffset="60"
        style={{
          animation: 'drawCheck 0.3s ease-out 0.6s forwards',
        }}
      />
      <style>{`
        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>
  </Box>
);


export const FloatingIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      animation: `${float} 3s ease-in-out infinite`,
      display: 'inline-block',
    }}
  >
    {children}
  </Box>
);


export const AnimatedProgressBar: React.FC<{ progress?: number }> = ({ progress = 75 }) => (
  <Box sx={{ width: '100%', p: 2 }}>
    <Box
      sx={{
        width: '100%',
        height: 8,
        bgcolor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          borderRadius: 4,
          position: 'relative',
          animation: 'progressFill 1.5s ease-out',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: `${wave} 2s linear infinite`,
          },
        }}
      />
      <style>{`
        @keyframes progressFill {
          from {
            width: 0%;
          }
        }
      `}</style>
    </Box>
  </Box>
);


export const PulseButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ 
  children, 
  onClick 
}) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'inline-block',
      position: 'relative',
      cursor: 'pointer',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: '100%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: 2,
        opacity: 0.3,
        animation: `${pulse} 2s ease-in-out infinite`,
      },
    }}
  >
    <Box
      sx={{
        position: 'relative',
        px: 4,
        py: 2,
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        borderRadius: 2,
        fontWeight: 600,
        zIndex: 1,
      }}
    >
      {children}
    </Box>
  </Box>
);


export const WaveBackground: React.FC = () => (
  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: -1 }}>
    <svg
      viewBox="0 0 1200 200"
      style={{
        position: 'absolute',
        bottom: 0,
        width: '200%',
        height: '200px',
      }}
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 0.3 }} />
        </linearGradient>
      </defs>
      <path
        d="M0,100 C200,50 400,150 600,100 C800,50 1000,150 1200,100 L1200,200 L0,200 Z"
        fill="url(#waveGradient)"
        style={{
          animation: 'wave 10s linear infinite',
        }}
      />
      <path
        d="M0,150 C200,100 400,200 600,150 C800,100 1000,200 1200,150 L1200,200 L0,200 Z"
        fill="url(#waveGradient)"
        style={{
          animation: 'wave 8s linear infinite reverse',
          opacity: 0.5,
        }}
      />
      <style>{`
        @keyframes wave {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </svg>
  </Box>
);


  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
    <svg width="100" height="150" viewBox="0 0 100 150">
      <g style={{ animation: `${float} 2s ease-in-out infinite` }}>
        
        <path
          d="M50 20 L60 60 L40 60 Z"
          fill="url(#rocketGradient)"
        />
        
        <path d="M40 50 L30 65 L40 60 Z" fill="#667eea" />
        <path d="M60 50 L70 65 L60 60 Z" fill="#667eea" />
        
        <circle cx="50" cy="40" r="5" fill="#87ceeb" />
      </g>
      
      
      <g style={{ animation: `${pulse} 0.3s ease-in-out infinite` }}>
        <path
          d="M45 60 L50 80 L55 60 Z"
          fill="#ff6b6b"
          opacity="0.8"
        />
        <path
          d="M47 60 L50 75 L53 60 Z"
          fill="#ffd93d"
        />
      </g>
      
      
      <circle cx="45" cy="85" r="3" fill="#999" opacity="0.5"
        style={{ animation: 'smokeUp 2s ease-out infinite' }} />
      <circle cx="55" cy="90" r="2" fill="#999" opacity="0.5"
        style={{ animation: 'smokeUp 2s ease-out infinite 0.5s' }} />
      <circle cx="50" cy="95" r="2.5" fill="#999" opacity="0.5"
        style={{ animation: 'smokeUp 2s ease-out infinite 1s' }} />
      
      <defs>
        <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#667eea" />
        </linearGradient>
      </defs>
      
      <style>{`
        @keyframes smokeUp {
          from {