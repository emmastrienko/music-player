// src/styles/typography.js
import {Platform} from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
  },
});

export const typography = {
  // Font families
  fontFamily,
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    heading: 28,
    title: 32,
    display: 40,
  },
  
  // Line heights
  lineHeight: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 36,
    heading: 40,
    title: 44,
    display: 52,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  
  // Text styles
  styles: {
    displayLarge: {
      fontSize: 40,
      fontWeight: '700',
      lineHeight: 52,
    },
    displayMedium: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 44,
    },
    displaySmall: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 40,
    },
    headingLarge: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 36,
    },
    headingMedium: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 32,
    },
    headingSmall: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 28,
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    labelLarge: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    labelMedium: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    labelSmall: {
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 14,
    },
  },
};