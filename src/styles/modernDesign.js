// src/styles/modernDesign.js
import { Dimensions } from 'react-native';
import { colors } from './colors';

const { width, height } = Dimensions.get('window');

export const modernDesign = {
  // Glassmorphism effects
  glass: {
    background: 'rgba(31, 41, 55, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    backdropFilter: 'blur(20px)',
  },

  // Neumorphism shadows
  neumorphism: {
    light: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: -2, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    dark: {
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  },

  // Advanced shadows
  shadows: {
    glow: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
    floating: {
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 15,
    },
    pressed: {
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
  },

  // Animation presets
  animations: {
    spring: {
      tension: 300,
      friction: 10,
    },
    bounce: {
      tension: 200,
      friction: 8,
    },
    smooth: {
      duration: 200,
    },
  },

  // Modern gradients
  gradients: {
    aurora: ['#8B5CF6', '#A78BFA', '#06B6D4', '#22D3EE'],
    sunset: ['#F59E0B', '#EF4444', '#8B5CF6'],
    ocean: ['#06B6D4', '#3B82F6', '#1E40AF'],
    card: ['rgba(55, 65, 81, 0.8)', 'rgba(31, 41, 55, 0.6)'],
    button: ['#8B5CF6', '#7C3AED'],
    overlay: ['transparent', 'rgba(0, 0, 0, 0.8)'],
  },

  // Layout constants
  layout: {
    cardSpacing: 16,
    sectionSpacing: 24,
    borderRadius: {
      small: 8,
      medium: 12,
      large: 16,
      xlarge: 20,
      round: 50,
    },
    hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
  },

  // Responsive breakpoints
  breakpoints: {
    small: width < 375,
    medium: width >= 375 && width < 414,
    large: width >= 414,
  },
};