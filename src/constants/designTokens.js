/**
 * LIZI Design System - Design Tokens
 * Centralized color, typography, and spacing constants
 */

export const COLORS = {
  // Primary Colors
  electricPurple: '#8A2BE2',
  deepIndigo: '#301934',
  white: '#FFFFFF',
  
  // Accent & Semantic Colors
  vibrantBlue: '#00BFFF',
  successGreen: '#32CD32',
  warmOrange: '#FF8C00',
  softLavender: '#E6E6FA',
  
  // Utility Colors
  black: '#000000',
  darkGray: '#333333',
  lightGray: '#E5E5E5',
  borderGray: '#D1D5DB',
};

export const TYPOGRAPHY = {
  fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
  
  // Type Scale
  heading1: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: '1.2',
  },
  heading2: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: '1.3',
  },
  body1: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '1.5',
  },
  body2: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.5',
  },
  buttonText: {
    fontSize: '16px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '1.4',
  },
};

export const SPACING = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  xxl: '64px',
};

export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  full: '9999px', // Pill shape
};

export const SHADOWS = {
  light: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  dark: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  tooltip: 60,
  notification: 70,
};

export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  standard: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
};
