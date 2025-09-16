// src/components/common/Button.js
import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
  icon,
  iconSize = 20,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'outline':
        return styles.textOutline;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <View style={styles.content}>
        {icon && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={disabled ? colors.textMuted : getTextStyle().color}
            style={styles.icon}
          />
        )}
        <Text style={[getTextStyle(), disabled && styles.textDisabled, textStyle]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.backgroundTertiary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundTertiary,
  },
  textPrimary: {
    ...typography.styles.labelLarge,
    color: colors.background,
    fontWeight: '600',
  },
  textSecondary: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  textOutline: {
    ...typography.styles.labelLarge,
    color: colors.primary,
    fontWeight: '600',
  },
  textDisabled: {
    color: colors.textMuted,
  },
});

const styles = buttonStyles;

export default Button;