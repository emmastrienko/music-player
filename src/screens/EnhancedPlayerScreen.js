// src/screens/EnhancedPlayerScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  setIsPlaying,
  setDuration,
  setPosition,
  nextTrack,
  previousTrack,
  setRepeatMode,
  setShuffleMode,
  setVolume,
} from "../redux/slices/playerSlice";
import {
  addToFavorites,
  removeFromFavorites,
} from "../redux/slices/musicSlice";
import ProgressBar from "../components/player/ProgressBar";
import VolumeControl from "../components/player/VolumeControl";
import { audioService } from "../services/audioService";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";
import { modernDesign } from "../styles/modernDesign";
import { LargeGradientArtwork } from '../components/common/GradientArtwork';

const { width, height } = Dimensions.get("window");

const EnhancedPlayerScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const {
    currentTrack,
    isPlaying,
    repeatMode,
    shuffleMode,
    volume,
    queue,
    currentIndex,
  } = useSelector((state) => state.player);
  const { favorites } = useSelector((state) => state.music);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(height)).current;
  const artworkRotation = useRef(new Animated.Value(0)).current;
  const artworkScale = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(0)).current;

  // State
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [artworkDominantColor, setArtworkDominantColor] = useState(colors.primary);

  const isFavorite = favorites.some((fav) => fav.id === currentTrack?.id);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Artwork rotation animation
  useEffect(() => {
    if (isPlaying) {
      const rotationAnimation = Animated.loop(
        Animated.timing(artworkRotation, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      );
      rotationAnimation.start();
      return () => rotationAnimation.stop();
    } else {
      artworkRotation.stopAnimation();
    }
  }, [isPlaying]);

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100) {
        handleClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: height,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  const handlePlayPause = () => {
    // Scale animation for feedback
    Animated.sequence([
      Animated.timing(artworkScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(artworkScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    dispatch(setIsPlaying(!isPlaying));
  };

  const handleNext = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      dispatch(nextTrack());
    }
  };

  const handlePrevious = () => {
    if (queue.length > 0 && currentIndex > 0) {
      dispatch(previousTrack());
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(currentTrack.id));
    } else {
      dispatch(addToFavorites(currentTrack));
    }
  };

  const handleRepeat = () => {
    const modes = ['off', 'one', 'queue'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    dispatch(setRepeatMode(nextMode));
  };

  const handleShuffle = () => {
    dispatch(setShuffleMode(!shuffleMode));
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return 'repeat-outline';
      case 'queue':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  const renderArtwork = () => {
    const rotation = artworkRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.artworkContainer}>
        {/* Glowing background */}
        <Animated.View style={[
          styles.artworkGlow,
          { opacity: backgroundOpacity }
        ]}>
          <LinearGradient
            colors={[artworkDominantColor + '40', 'transparent']}
            style={styles.artworkGlowGradient}
          />
        </Animated.View>

        {/* Vinyl record effect */}
        <Animated.View style={[
          styles.vinylRecord,
          {
            transform: [
              { rotate: rotation },
              { scale: artworkScale }
            ]
          }
        ]}>
          <View style={styles.vinylGrooves}>
            {[...Array(5)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.vinylGroove,
                  {
                    width: 250 - (i * 30),
                    height: 250 - (i * 30),
                  }
                ]}
              />
            ))}
          </View>
          
          <View style={styles.artworkFrame}>
            <LargeGradientArtwork 
              song={currentTrack}
              size={200}
              style={styles.artwork}
            />
          </View>
          
          <View style={styles.vinylCenter}>
            <View style={styles.vinylCenterDot} />
          </View>
        </Animated.View>

        {/* Floating particles effect */}
        <View style={styles.particlesContainer}>
          {[...Array(6)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  top: Math.random() * 300,
                  left: Math.random() * 300,
                  opacity: backgroundOpacity,
                }
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderControls = () => (
    <Animated.View style={[
      styles.controlsContainer,
      { opacity: controlsOpacity }
    ]}>
      {/* Secondary controls */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={[styles.controlButton, shuffleMode && styles.activeControlButton]}
          onPress={handleShuffle}
        >
          <Ionicons
            name="shuffle"
            size={20}
            color={shuffleMode ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowQueue(!showQueue)}
        >
          <Ionicons name="list" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowVolumeControl(!showVolumeControl)}
        >
          <Ionicons name="volume-medium" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, repeatMode !== 'off' && styles.activeControlButton]}
          onPress={handleRepeat}
        >
          <Ionicons
            name={getRepeatIcon()}
            size={20}
            color={repeatMode !== 'off' ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Primary controls */}
      <View style={styles.primaryControls}>
        <TouchableOpacity
          style={[styles.controlButton, currentIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="play-skip-back"
            size={32}
            color={currentIndex === 0 ? colors.textMuted : colors.textPrimary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <LinearGradient
            colors={modernDesign.gradients.button}
            style={styles.playButtonGradient}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={40}
              color={colors.textPrimary}
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            currentIndex >= queue.length - 1 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={currentIndex >= queue.length - 1}
        >
          <Ionicons
            name="play-skip-forward"
            size={32}
            color={
              currentIndex >= queue.length - 1
                ? colors.textMuted
                : colors.textPrimary
            }
          />
        </TouchableOpacity>
      </View>

      {/* Action controls */}
      <View style={styles.actionControls}>
        <TouchableOpacity
          style={[styles.actionButton, isFavorite && styles.favoriteActive]}
          onPress={handleFavoriteToggle}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? colors.accent : colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (!currentTrack) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        }
      ]}
      {...panResponder.panHandlers}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Dynamic background */}
      <Animated.View style={[styles.backgroundContainer, { opacity: backgroundOpacity }]}>
        <LinearGradient
          colors={[
            artworkDominantColor + '20',
            colors.background,
            colors.background,
          ]}
          style={styles.backgroundGradient}
        />
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
          <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} of {queue.length}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Track info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={2}>
          {currentTrack.title || "Unknown Title"}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {currentTrack.artist || "Unknown Artist"}
        </Text>
        {currentTrack.album && (
          <Text style={styles.trackAlbum} numberOfLines={1}>
            {currentTrack.album}
          </Text>
        )}
      </View>

      {/* Artwork */}
      {renderArtwork()}

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ProgressBar />
      </View>

      {/* Controls */}
      {renderControls()}

      {/* Volume control overlay */}
      {showVolumeControl && (
        <BlurView intensity={50} style={styles.volumeOverlay}>
          <VolumeControl />
        </BlurView>
      )}

      {/* Queue overlay */}
      {showQueue && (
        <BlurView intensity={50} style={styles.queueOverlay}>
          <View style={styles.queueContent}>
            <Text style={styles.queueTitle}>Up Next</Text>
            {/* Queue list would go here */}
          </View>
        </BlurView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  backgroundGradient: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerInfo: {
    alignItems: 'center',
  },

  headerTitle: {
    ...typography.styles.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  headerSubtitle: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },

  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },

  trackTitle: {
    ...typography.styles.displayMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  trackArtist: {
    ...typography.styles.headingSmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  trackAlbum: {
    ...typography.styles.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },

  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    position: 'relative',
  },

  artworkGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },

  artworkGlowGradient: {
    flex: 1,
    borderRadius: 200,
  },

  vinylRecord: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    ...modernDesign.shadows.floating,
  },

  vinylGrooves: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  vinylGroove: {
    position: 'absolute',
    borderRadius: 125,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  artworkFrame: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    ...modernDesign.shadows.glow,
  },

  artwork: {
    width: '100%',
    height: '100%',
  },

  vinylCenter: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },

  vinylCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },

  particlesContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
  },

  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  progressContainer: {
    paddingHorizontal: 30,
    marginBottom: 40,
  },

  controlsContainer: {
    paddingHorizontal: 30,
    gap: 30,
  },

  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },

  actionControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },

  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeControlButton: {
    backgroundColor: colors.primary + '30',
  },

  disabledButton: {
    opacity: 0.5,
  },

  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    ...modernDesign.shadows.glow,
  },

  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  favoriteActive: {
    backgroundColor: colors.accent + '30',
  },

  volumeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  queueOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  queueContent: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: modernDesign.layout.borderRadius.large,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },

  queueTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default EnhancedPlayerScreen;