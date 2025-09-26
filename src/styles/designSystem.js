// src/styles/designSystem.js
import { Dimensions, PixelRatio } from 'react-native';
import { colors } from './colors';

const { width, height } = Dimensions.get('window');

// Responsive design utilities
const scale = (size) => (width / 320) * size;
const verticalScale = (size) => (height / 568) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export const designSystem = {
  // Spacing system (8px base unit)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },

  // Border radius system
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Elevation/Shadow levels
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    xl: {
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.30,
      shadowRadius: 7.49,
      elevation: 12,
    },
  },

  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Layout dimensions
  layout: {
    screenPadding: 20,
    cardPadding: 16,
    headerHeight: 60,
    tabBarHeight: 80,
    miniPlayerHeight: 70,
    playerScreenHeight: height,
  },

  // Responsive utilities
  responsive: {
    scale,
    verticalScale,
    moderateScale,
    isSmallScreen: width < 375,
    isLargeScreen: width > 414,
  },

  // Glassmorphism styles
  glass: {
    background: 'rgba(31, 41, 55, 0.8)',
    blur: 20,
    border: `1px solid ${colors.borderLight}`,
  },

  // Neumorphism styles
  neumorphism: {
    light: {
      backgroundColor: colors.surfaceLight,
      shadowColor: colors.overlay,
      shadowOffset: { width: -2, height: -2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    dark: {
      backgroundColor: colors.surface,
      shadowColor: colors.overlay,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 5,
    },
  },
};