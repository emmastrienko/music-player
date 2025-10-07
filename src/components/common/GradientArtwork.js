// src/components/common/GradientArtwork.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { defaultArtworkService } from '../../services/defaultArtworkService';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const GradientArtwork = ({ 
  song, 
  size = 150, 
  borderRadius = 12,
  style = {},
  showIcon = true,
  showLetter = true,
}) => {
  // Get artwork source
  const artworkSource = defaultArtworkService.getArtworkSource(song);

  // If it's a regular image URI, render Image component
  if (artworkSource && artworkSource.uri) {
    return (
      <Image
        source={{ uri: artworkSource.uri }}
        style={[
          {
            width: size,
            height: size,
            borderRadius,
          },
          style,
        ]}
        resizeMode="cover"
      />
    );
  }

  // If it's gradient data, render gradient
  if (defaultArtworkService.isGradientArtwork(artworkSource)) {
    const iconSize = size * 0.35; // Icon is 35% of container size
    const letterSize = size * 0.4; // Letter is 40% of container size

    return (
      <LinearGradient
        colors={[artworkSource.startColor, artworkSource.endColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            width: size,
            height: size,
            borderRadius,
            justifyContent: 'center',
            alignItems: 'center',
          },
          style,
        ]}
      >
        {/* Show icon if available and enabled */}
        {showIcon && artworkSource.icon && (
          <Ionicons
            name={artworkSource.icon}
            size={iconSize}
            color={artworkSource.iconColor}
            style={styles.icon}
          />
        )}

        {/* Show letter if available and enabled */}
        {showLetter && artworkSource.letter && (
          <Text
            style={[
              styles.letter,
              {
                fontSize: letterSize,
                color: artworkSource.textColor,
              },
            ]}
          >
            {artworkSource.letter}
          </Text>
        )}

        {/* Fallback icon if neither icon nor letter */}
        {!artworkSource.icon && !artworkSource.letter && (
          <Ionicons
            name="musical-notes"
            size={iconSize}
            color={artworkSource.iconColor || '#ffffff'}
            style={styles.icon}
          />
        )}
      </LinearGradient>
    );
  }

  // Fallback for no artwork
  return (
    <View
      style={[
        styles.fallbackContainer,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      <Ionicons
        name="musical-notes"
        size={size * 0.35}
        color={colors.textMuted}
      />
    </View>
  );
};

// Optimized version for lists (memoized)
const MemoizedGradientArtwork = React.memo(GradientArtwork);

// Square variant for consistency
const SquareGradientArtwork = ({ song, size = 150, style = {}, ...props }) => (
  <MemoizedGradientArtwork
    song={song}
    size={size}
    borderRadius={12}
    style={[{ aspectRatio: 1 }, style]}
    {...props}
  />
);

// Circular variant for profile/player screens
const CircularGradientArtwork = ({ song, size = 150, style = {}, ...props }) => (
  <MemoizedGradientArtwork
    song={song}
    size={size}
    borderRadius={size / 2}
    style={style}
    {...props}
  />
);

// Small variant for list items
const SmallGradientArtwork = ({ song, style = {}, ...props }) => (
  <MemoizedGradientArtwork
    song={song}
    size={60}
    borderRadius={8}
    style={style}
    showIcon={false}
    showLetter={true}
    {...props}
  />
);

// Large variant for player screens
const LargeGradientArtwork = ({ song, style = {}, ...props }) => (
  <MemoizedGradientArtwork
    song={song}
    size={300}
    borderRadius={20}
    style={style}
    {...props}
  />
);

const styles = StyleSheet.create({
  icon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  letter: {
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fallbackContainer: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});

export default GradientArtwork;
export {
  MemoizedGradientArtwork,
  SquareGradientArtwork,
  CircularGradientArtwork,
  SmallGradientArtwork,
  LargeGradientArtwork,
};