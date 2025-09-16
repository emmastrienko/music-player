// src/styles/globalStyles.js
import {StyleSheet, Dimensions} from 'react-native';
import {colors} from './colors';
import {typography} from './typography';

const {width, height} = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  
  // Spacing
  padding: {
    paddingHorizontal: 20,
  },
  paddingVertical: {
    paddingVertical: 20,
  },
  margin: {
    marginHorizontal: 20,
  },
  marginVertical: {
    marginVertical: 20,
  },
  
  // Cards
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Buttons
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.buttonPrimary,
  },
  buttonSecondary: {
    backgroundColor: colors.buttonSecondary,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    backgroundColor: colors.transparent,
  },
  
  // Text styles
  textPrimary: {
    color: colors.textPrimary,
    ...typography.styles.bodyMedium,
  },
  textSecondary: {
    color: colors.textSecondary,
    ...typography.styles.bodySmall,
  },
  textMuted: {
    color: colors.textMuted,
    ...typography.styles.bodySmall,
  },
  
  // Flex utilities
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBetween: {
    justifyContent: 'space-between',
  },
  flexAround: {
    justifyContent: 'space-around',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  
  // Shadows
  shadowSmall: {
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  shadowMedium: {
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowLarge: {
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  
  // Borders
  borderRadius: {
    borderRadius: 8,
  },
  borderRadiusLarge: {
    borderRadius: 16,
  },
  borderRadiusSmall: {
    borderRadius: 4,
  },
  
  // Positions
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  
  // Screen dimensions
  fullWidth: {
    width: width,
  },
  fullHeight: {
    height: height,
  },
});

export const dimensions = {
  width,
  height,
  tabBarHeight: 80,
  headerHeight: 60,
  playerHeight: 60,
};