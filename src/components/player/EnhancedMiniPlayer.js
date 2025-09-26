// src/components/player/EnhancedMiniPlayer.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { setIsPlaying, nextTrack, previousTrack } from '../../redux/slices/playerSlice';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { designSystem } from '../../styles/designSystem';

const { width, height } = Dimensions.get('window');

const EnhancedMiniPlayer = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, position, duration, queue, currentIndex } = useSelector(
    state => state.player,
  );

  const [translateY] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(1));
  const [waveformAnimation] = useState(new Animated.Value(0));
  const [showMiniPlayer, setShowMiniPlayer] = useState(true);

  // Waveform animation
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnimation, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveformAnimation.stopAnimation();
      waveformAnimation.setValue(0);
    }
  }, [isPlaying]);

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10 || Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
        // Vertical swipe - dismiss mini player
        translateY.setValue(gestureState.dy);
        opacity.setValue(1 - Math.abs(gestureState.dy) / 100);
      } else {
        // Horizontal swipe - track navigation
        const threshold = 50;
        if (gestureState.dx > threshold) {
          // Swipe right - previous track
          handlePreviousTrack();
        } else if (gestureState.dx < -threshold) {
          // Swipe left - next track
          handleNextTrack();
        }
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dy) > 50) {
        // Dismiss mini player
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: gestureState.dy > 0 ? 100 : -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowMiniPlayer(false);
        });
      } else {
        // Snap back
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  if (!currentTrack || !showMiniPlayer) {
    return null;
  }

  const progress = duration > 0 ? position / duration : 0;

  const handlePlayPause = () => {
    dispatch(setIsPlaying(!isPlaying));
  };

  const handleNextTrack = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      dispatch(nextTrack());
    }
  };

  const handlePreviousTrack = () => {
    if (queue.length > 0 && currentIndex > 0) {
      dispatch(previousTrack());
    }
  };

  const handlePress = () => {
    navigation.navigate('Player');
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => {
    return (
      <View style={styles.waveformContainer}>
        {[...Array(4)].map((_, index) => {
          const animatedHeight = waveformAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [4, 12 + (index % 2) * 4],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: animatedHeight,
                  animationDelay: index * 100,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Glass morphism background */}
      <BlurView intensity={80} style={styles.blurBackground}>
        <LinearGradient
          colors={[
            'rgba(31, 41, 55, 0.95)',
            'rgba(17, 24, 39, 0.95)',
          ]}
          style={styles.gradientBackground}
        >
          {/* Swipe indicator */}
          <View style={styles.swipeIndicator} />

          <View style={styles.content}>
            {/* Track info section */}
            <TouchableOpacity
              style={styles.trackInfo}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              {/* Album artwork */}
              <View style={styles.artworkContainer}>
                <Image
                  source={{
                    uri:
                      (typeof currentTrack.artwork === 'string' && currentTrack.artwork) ||
                      'https://via.placeholder.com/60x60?text=♪',
                  }}
                  style={styles.artwork}
                />
                
                {/* Playing indicator overlay */}
                {isPlaying && (
                  <View style={styles.playingOverlay}>
                    {renderWaveform()}
                  </View>
                )}
              </View>

              {/* Track details */}
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {currentTrack.title || 'Unknown Title'}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {currentTrack.artist || 'Unknown Artist'}
                </Text>
                <Text style={styles.timeInfo}>
                  {formatTime(position)} / {formatTime(duration)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Controls section */}
            <View style={styles.controls}>
              {/* Previous track */}
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  currentIndex === 0 && styles.disabledButton,
                ]}
                onPress={handlePreviousTrack}
                disabled={currentIndex === 0}
              >
                <Ionicons
                  name="play-skip-back"
                  size={20}
                  color={currentIndex === 0 ? colors.textMuted : colors.textPrimary}
                />
              </TouchableOpacity>

              {/* Play/Pause */}
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
              >
                <LinearGradient
                  colors={colors.gradientPrimary}
                  style={styles.playButtonGradient}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color={colors.textPrimary}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Next track */}
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  currentIndex >= queue.length - 1 && styles.disabledButton,
                ]}
                onPress={handleNextTrack}
                disabled={currentIndex >= queue.length - 1}
              >
                <Ionicons
                  name="play-skip-forward"
                  size={20}
                  color={
                    currentIndex >= queue.length - 1
                      ? colors.textMuted
                      : colors.textPrimary
                  }
                />
              </TouchableOpacity>

              {/* Queue indicator */}
              <TouchableOpacity
                style={styles.queueButton}
                onPress={handlePress}
              >
                <View style={styles.queueIndicator}>
                  <Text style={styles.queueCount}>{queue.length}</Text>
                </View>
                <Ionicons name="list" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Ambient background based on artwork */}
          <View style={styles.ambientBackground}>
            <LinearGradient
              colors={[
                'rgba(139, 92, 246, 0.1)',
                'rgba(6, 182, 212, 0.1)',
                'transparent',
              ]}
              style={styles.ambientGradient}
            />
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Above tab bar
    left: 0,
    right: 0,
    zIndex: 1000,
    ...designSystem.elevation.xl,
  },

  progressBarContainer: {
    height: 3,
    backgroundColor: 'transparent',
  },

  progressBarBackground: {
    flex: 1,
    backgroundColor: colors.progressBarBackground,
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: colors.progressBar,
  },

  blurBackground: {
    borderTopLeftRadius: designSystem.borderRadius.lg,
    borderTopRightRadius: designSystem.borderRadius.lg,
    overflow: 'hidden',
  },

  gradientBackground: {
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: designSystem.spacing.md,
  },

  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: designSystem.spacing.sm,
    opacity: 0.5,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: designSystem.spacing.md,
  },

  artworkContainer: {
    position: 'relative',
    marginRight: designSystem.spacing.md,
  },

  artwork: {
    width: 50,
    height: 50,
    borderRadius: designSystem.borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
  },

  playingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: designSystem.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  waveformBar: {
    width: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },

  artist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  timeInfo: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.sm,
  },

  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.5,
  },

  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...designSystem.elevation.md,
  },

  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  queueButton: {
    alignItems: 'center',
    gap: 2,
  },

  queueIndicator: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  queueCount: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 10,
  },

  ambientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },

  ambientGradient: {
    flex: 1,
    borderTopLeftRadius: designSystem.borderRadius.lg,
    borderTopRightRadius: designSystem.borderRadius.lg,
  },
});

export default EnhancedMiniPlayer;