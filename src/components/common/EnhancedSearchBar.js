// src/components/common/EnhancedSearchBar.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { modernDesign } from '../../styles/modernDesign';

const EnhancedSearchBar = ({
  placeholder = 'Search songs, artists, albums...',
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  autoFocus = false,
  showMicrophone = true,
  showFilter = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: isFocused || value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(borderColorAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused, value]);

  const handleFocus = () => {
    setIsFocused(true);
    setIsActive(true);
    onFocus && onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      setIsActive(false);
    }
    onBlur && onBlur();
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit && onSubmit(value.trim());
      Keyboard.dismiss();
    }
  };

  const handleMicrophone = () => {
    // Voice search functionality would go here
    console.log('Voice search activated');
  };

  const handleFilter = () => {
    // Filter options would go here
    console.log('Filter options');
  };

  // Animated styles
  const containerScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const placeholderScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  const placeholderTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowOpacity,
            transform: [{ scale: containerScale }],
          },
        ]}
      >
        <LinearGradient
          colors={[colors.primary + '40', 'transparent']}
          style={styles.glow}
        />
      </Animated.View>

      {/* Main search container */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            borderColor,
            transform: [{ scale: containerScale }],
          },
        ]}
      >
        <BlurView intensity={20} style={styles.blurBackground}>
          <LinearGradient
            colors={modernDesign.gradients.card}
            style={styles.gradientBackground}
          >
            <View style={styles.searchContent}>
              {/* Search icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color={isFocused ? colors.primary : colors.textMuted}
                />
              </View>

              {/* Input container */}
              <View style={styles.inputContainer}>
                {/* Floating placeholder */}
                {(isFocused || value) && (
                  <Animated.Text
                    style={[
                      styles.floatingPlaceholder,
                      {
                        transform: [
                          { scale: placeholderScale },
                          { translateY: placeholderTranslateY },
                        ],
                      },
                    ]}
                  >
                    Search
                  </Animated.Text>
                )}

                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder={isFocused ? '' : placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={value}
                  onChangeText={onChangeText}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onSubmitEditing={handleSubmit}
                  autoFocus={autoFocus}
                  returnKeyType="search"
                  selectionColor={colors.primary}
                />
              </View>

              {/* Action buttons */}
              <View style={styles.actionsContainer}>
                {/* Clear button */}
                {value && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleClear}
                    hitSlop={modernDesign.layout.hitSlop}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                )}

                {/* Microphone button */}
                {showMicrophone && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.micButton]}
                    onPress={handleMicrophone}
                    hitSlop={modernDesign.layout.hitSlop}
                  >
                    <LinearGradient
                      colors={modernDesign.gradients.button}
                      style={styles.micGradient}
                    >
                      <Ionicons
                        name="mic"
                        size={16}
                        color={colors.textPrimary}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Filter button */}
                {showFilter && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleFilter}
                    hitSlop={modernDesign.layout.hitSlop}
                  >
                    <Ionicons
                      name="options"
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Search suggestions/history */}
      {isActive && (
        <View style={styles.suggestionsContainer}>
          <BlurView intensity={30} style={styles.suggestionsBlur}>
            <View style={styles.suggestionsContent}>
              {/* Recent searches */}
              <View style={styles.suggestionSection}>
                <TouchableOpacity style={styles.suggestionItem}>
                  <Ionicons name="time" size={16} color={colors.textMuted} />
                  <Text style={styles.suggestionText}>Recent: Pop music</Text>
                  <TouchableOpacity style={styles.suggestionClear}>
                    <Ionicons name="close" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              {/* Trending searches */}
              <View style={styles.suggestionSection}>
                <TouchableOpacity style={styles.suggestionItem}>
                  <Ionicons name="trending-up" size={16} color={colors.accent} />
                  <Text style={styles.suggestionText}>Trending: Jazz classics</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginHorizontal: 20,
    marginVertical: 16,
  },

  glowContainer: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: modernDesign.layout.borderRadius.large + 10,
  },

  glow: {
    flex: 1,
    borderRadius: modernDesign.layout.borderRadius.large + 10,
  },

  searchContainer: {
    borderRadius: modernDesign.layout.borderRadius.large,
    borderWidth: 1,
    overflow: 'hidden',
    ...modernDesign.shadows.floating,
  },

  blurBackground: {
    borderRadius: modernDesign.layout.borderRadius.large,
  },

  gradientBackground: {
    borderRadius: modernDesign.layout.borderRadius.large,
  },

  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
  },

  iconContainer: {
    marginRight: 12,
  },

  inputContainer: {
    flex: 1,
    position: 'relative',
  },

  floatingPlaceholder: {
    position: 'absolute',
    top: -12,
    left: 0,
    ...typography.styles.labelSmall,
    color: colors.primary,
    fontWeight: '600',
  },

  input: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    minHeight: 24,
  },

  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  micButton: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  micGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },

  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    marginTop: 8,
    borderRadius: modernDesign.layout.borderRadius.medium,
    overflow: 'hidden',
    ...modernDesign.shadows.floating,
  },

  suggestionsBlur: {
    borderRadius: modernDesign.layout.borderRadius.medium,
  },

  suggestionsContent: {
    padding: 16,
  },

  suggestionSection: {
    marginBottom: 8,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: modernDesign.layout.borderRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  suggestionText: {
    flex: 1,
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    marginLeft: 12,
  },

  suggestionClear: {
    padding: 4,
  },
});

export default EnhancedSearchBar;