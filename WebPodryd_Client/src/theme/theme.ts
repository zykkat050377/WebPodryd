// src/theme/theme.ts

import { createTheme, keyframes } from '@mui/material/styles';

// Анимации вынесены в константы перед созданием темы
const handshakeAnimation = keyframes`
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`;

const docsFloatAnimation = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-20px) rotate(5deg); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const theme = createTheme({
  palette: {
    primary: {
      main: '#345F9B',
      contrastText: '#fff'
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    }
  },
  shape: {
    borderRadius: 12,
    sidebarWidth: 300
  },
  customShadows: {
    widget: '0px 2px 10px rgba(0, 0, 0, 0.08)',
    cardHover: '0px 8px 16px rgba(0, 0, 0, 0.12)'
  },
  animations: {
    handshake: handshakeAnimation,
    docsFloat: docsFloatAnimation,
    float: floatAnimation
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 300,
          boxSizing: 'border-box',
          backgroundColor: '#345F9B',
          color: '#fff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'inherit',
          minWidth: '36px !important',
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)'
          }
        }
      }
    }
  },
});

declare module '@mui/material/styles' {
  interface Theme {
    animations: {
      handshake: string;
      docsFloat: string;
      float: string;
    };
    customShadows: {
      widget: string;
      cardHover: string;
    };
    shape: {
      sidebarWidth: number;
    };
  }
  interface ThemeOptions {
    animations?: {
      handshake?: string;
      docsFloat?: string;
      float?: string;
    };
    customShadows?: {
      widget?: string;
      cardHover?: string;
    };
    shape?: {
      sidebarWidth?: number;
    };
  }
}

export default theme;
