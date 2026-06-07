import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0d0f14',
      paper:   '#13161f',
    },
    primary: {
      main:  '#26d982',
      dark:  '#1db864',
      light: '#4de99a',
    },
    secondary: {
      main: '#c8a96e',
    },
    error: {
      main: '#ff5252',
    },
    text: {
      primary:   '#e2e8f0',
      secondary: '#4a5568',
      disabled:  '#2e3f58',
    },
    divider: '#1c2030',
  },

  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontFamily: "'Roboto', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Roboto', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Roboto', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Roboto', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Roboto', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Roboto', sans-serif", fontWeight: 700 },
    body1: { fontFamily: "'Inter', sans-serif", fontWeight: 400 },
    body2: { fontFamily: "'Inter', sans-serif", fontWeight: 400 },
    button: { fontFamily: "'Roboto', sans-serif", fontWeight: 600 },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    // ── Paper ──────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1c2030',
        },
      },
    },

    // ── Button ─────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Orbitron', monospace",
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          borderRadius: 8,
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1db864, #26d982)',
          color: '#0d0f14',
          boxShadow: '0 4px 14px rgba(38,217,130,0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #26d982, #4de99a)',
            boxShadow: '0 6px 20px rgba(38,217,130,0.35)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #a07828, #c8a96e)',
          color: '#0d0f14',
          boxShadow: '0 4px 14px rgba(200,169,110,0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #c8a96e, #d4b97e)',
            boxShadow: '0 6px 20px rgba(200,169,110,0.3)',
          },
        },
        outlined: {
          borderColor: '#1c2030',
          color: '#4a5568',
          '&:hover': {
            borderColor: '#26d982',
            color: '#26d982',
            background: 'rgba(38,217,130,0.05)',
          },
        },
      },
    },

    // ── TextField ──────────────────────────────
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            background: 'rgba(255,255,255,0.02)',
            '& fieldset': {
              borderColor: '#1c2030',
            },
            '&:hover fieldset': {
              borderColor: '#2a3550',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#26d982',
              boxShadow: '0 0 0 2px rgba(38,217,130,0.12)',
            },
          },
          '& .MuiInputLabel-root': {
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: '#4a5568',
            letterSpacing: '0.5px',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#26d982',
          },
        },
      },
    },

    // ── Tab ────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "'Orbitron', monospace",
          fontSize: 11,
          letterSpacing: '1.5px',
          color: '#4a5568',
          '&.Mui-selected': {
            color: '#26d982',
          },
        },
      },
    },

    // ── Tabs Indicator ─────────────────────────
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#26d982',
        },
      },
    },

    // ── Chip ───────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.5px',
        },
      },
    },

    // ── Dialog ─────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: '#13161f',
          border: '1px solid #1c2030',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        },
      },
    },

    // ── Alert ──────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;