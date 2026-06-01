import { Colors } from '../constants/Colors';

export const cityDetailsTheme = {
  colors: {
    background: Colors.background,
    surface: Colors.inputBackground,
    surfaceMuted: Colors.inputBorder,
    text: Colors.textDark,
    textMuted: Colors.textGray,
    textSoft: Colors.textGray,
    primary: Colors.primary,
    primaryDark: Colors.primary,
    accent: Colors.primary,
    border: Colors.inputBorder,
    overlay: 'rgba(0,0,0,0.42)',
    shadow: '#111827',
    danger: '#E64848',
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
  },
  typography: {
    title: 34,
    section: 20,
    body: 15,
    caption: 12,
  },
} as const;
