// src/screens/PlayerScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { LargeGradientArtwork } from '../components/common/GradientArtwork';
import { globalStyles } from "../styles/globalStyles";

const { width, height } = Dimensions.get("window");
const ARTWORK_SIZE = Math.min(width, height) * 0.7;

const PlayerScreen = () => {
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

  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [artworkScale] = useState(new Animated.Value(1));
  const [isLoading, setIsLoading] = useState(false);

  const isFavorite = favorites.some((fav) => fav.id === currentTrack?.id);

  // Set up audio service callbacks
  useEffect(() => {
    audioService.setPositionUpdateCallback((position, duration) => {
      dispatch(setPosition(Math.floor(position / 1000))); // Convert to seconds
      dispatch(setDuration(Math.floor(duration / 1000))); // Convert to seconds
    });

    audioService.setTrackFinishedCallback(() => {
      dispatch(setIsPlaying(false));
      // Auto-play next track if available
      if (currentIndex < queue.length - 1 || repeatMode === "queue") {
        handleNext();
      }
    });
  }, [dispatch, currentIndex, queue.length, repeatMode]);

  // Load track when currentTrack changes
  useEffect(() => {
    const loadTrack = async () => {
      if (currentTrack && currentTrack !== audioService.getCurrentTrack()) {
        setIsLoading(true);
        try {
          console.log(`PlayerScreen: Loading track ${currentTrack.title}`);
          const result = await audioService.loadTrack(currentTrack);
          dispatch(setDuration(Math.floor(result.duration / 1000))); // Convert to seconds
          dispatch(setPosition(0)); // Reset position
          console.log(`✅ PlayerScreen: Track loaded successfully: ${currentTrack.title}`);
          
          // If we're supposed to be playing, start playback
          if (isPlaying) {
            console.log(`PlayerScreen: Auto-starting playback for ${currentTrack.title}`);
            const playResult = await audioService.play();
            if (!playResult.success) {
              console.warn(`❌ PlayerScreen: Failed to start auto-playback`);
              dispatch(setIsPlaying(false));
            }
          }
        } catch (error) {
          console.error(`❌ PlayerScreen: Error loading track: ${error.message}`);
          dispatch(setIsPlaying(false));
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTrack();
  }, [currentTrack, dispatch]); // Remove isPlaying from deps to avoid loop

  // Handle play/pause state changes (when track is already loaded)
  useEffect(() => {
    const handlePlayStateChange = async () => {
      if (currentTrack && audioService.getCurrentTrack()?.id === currentTrack.id && !isLoading) {
        try {
          if (isPlaying && !audioService.isTrackLoaded()) {
            // Track not loaded yet, let the track loading useEffect handle it
            return;
          }
          
          if (isPlaying) {
            console.log(`PlayerScreen: Starting playback for ${currentTrack.title}`);
            const playResult = await audioService.play();
            if (!playResult.success) {
              console.warn(`❌ PlayerScreen: Failed to start playback`);
              dispatch(setIsPlaying(false));
            }
          } else {
            console.log(`PlayerScreen: Pausing playback for ${currentTrack.title}`);
            await audioService.pause();
          }
        } catch (error) {
          console.error(`❌ PlayerScreen: Error handling play state change: ${error.message}`);
        }
      }
    };

    handlePlayStateChange();
  }, [isPlaying, currentTrack, isLoading, dispatch]);

  // Handle artwork animation
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(artworkScale, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(artworkScale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      artworkScale.setValue(1);
    }
  }, [isPlaying, artworkScale]);

  if (!currentTrack) {
    // Check if we can go back, otherwise navigate to a default screen
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home'); // or your default screen name
    }
    return null;
  }

  const handlePlayPause = async () => {
    if (isLoading) return;

    // Update UI immediately for better responsiveness
    dispatch(setIsPlaying(!isPlaying));

    try {
      if (!isPlaying) {
        // Try to play
        const result = await audioService.play();
        if (!result.success) {
          console.warn("Play failed, reverting state");
          dispatch(setIsPlaying(false));
        }
        console.log("Started playback");
      } else {
        // Try to pause
        await audioService.pause();
        console.log("Paused playback");
      }
    } catch (error) {
      console.error("Error during play/pause:", error);
      // Revert state on error
      dispatch(setIsPlaying(isPlaying));
    }
  };

  const handleNext = async () => {
    if (currentIndex < queue.length - 1) {
      try {
        setIsLoading(true);
        await audioService.stop();
        dispatch(nextTrack());
        console.log("Skipped to next track");
      } catch (error) {
        console.error("Error skipping to next track:", error);
        dispatch(nextTrack());
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      try {
        setIsLoading(true);
        await audioService.stop();
        dispatch(previousTrack());
        console.log("Skipped to previous track");
      } catch (error) {
        console.error("Error skipping to previous track:", error);
        dispatch(previousTrack());
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRepeat = () => {
    const modes = ["off", "track", "queue"];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    dispatch(setRepeatMode(nextMode));
  };

  const handleShuffle = () => {
    dispatch(setShuffleMode(!shuffleMode));
  };

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(currentTrack.id));
    } else {
      dispatch(addToFavorites(currentTrack));
    }
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "track":
        return "repeat";
      case "queue":
        return "repeat";
      default:
        return "repeat";
    }
  };

  return (
    <LinearGradient
      colors={colors.gradientHero}
      style={styles.container}
    >
      {/* Backdrop blur effect */}
      <View style={styles.backdrop} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home'); // or your default screen name
            }
          }}
          style={styles.headerButton}
        >
          <View style={styles.headerButtonBg}>
            <Ionicons name="chevron-down" size={24} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} of {queue.length}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <View style={styles.headerButtonBg}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.textPrimary}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.artworkGlow,
            { transform: [{ scale: artworkScale }] },
          ]}
        />
        
        <Animated.View
          style={[
            styles.artworkWrapper,
            { transform: [{ scale: artworkScale }] },
          ]}
        >
          <LargeGradientArtwork 
            song={currentTrack}
            size={ARTWORK_SIZE}
            style={styles.artwork}
          />
          
          {/* Glassmorphic overlay */}
          <LinearGradient
            colors={['transparent', 'transparent', colors.overlayGlass]}
            style={styles.artworkOverlay}
          />
        </Animated.View>
        
        {/* Floating elements */}
        <View style={styles.floatingElements}>
          {isPlaying && (
            <View style={styles.pulseIndicator}>
              <View style={[styles.pulse, styles.pulse1]} />
              <View style={[styles.pulse, styles.pulse2]} />
              <View style={[styles.pulse, styles.pulse3]} />
            </View>
          )}
        </View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View style={styles.trackDetails}>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleFavoriteToggle}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={28}
            color={isFavorite ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar with Play Button */}
      <View style={styles.progressSection}>
        <TouchableOpacity
          onPress={handlePlayPause}
          style={styles.progressPlayButton}
          disabled={isLoading}
        >
          <Ionicons
            name={isLoading ? "refresh" : isPlaying ? "pause" : "play"}
            size={20}
            color={colors.textPrimary}
            style={{marginLeft: isPlaying ? 0 : 2}}
          />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <ProgressBar />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            onPress={handleShuffle}
            style={styles.controlButton}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffleMode ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRepeat} style={styles.controlButton}>
            <Ionicons
              name={getRepeatIcon()}
              size={24}
              color={
                repeatMode !== "off" ? colors.primary : colors.textSecondary
              }
            />
            {repeatMode === "track" && (
              <View style={styles.repeatIndicator}>
                <Text style={styles.repeatText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.primaryControls}>
          <TouchableOpacity
            onPress={handlePrevious}
            style={styles.controlButton}
            disabled={currentIndex === 0 && repeatMode !== "queue"}
          >
            <Ionicons
              name="play-skip-back"
              size={32}
              color={
                currentIndex === 0 && repeatMode !== "queue"
                  ? colors.textMuted
                  : colors.textPrimary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={[styles.playButton, isLoading && styles.playButtonLoading]}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              style={styles.playButtonGradient}
            >
              <Ionicons
                name={isLoading ? "refresh" : isPlaying ? "pause" : "play"}
                size={36}
                color={colors.textPrimary}
                style={{marginLeft: isPlaying ? 0 : 3}}
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={styles.controlButton}
            disabled={
              currentIndex === queue.length - 1 && repeatMode !== "queue"
            }
          >
            <Ionicons
              name="play-skip-forward"
              size={32}
              color={
                currentIndex === queue.length - 1 && repeatMode !== "queue"
                  ? colors.textMuted
                  : colors.textPrimary
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.volumeContainer}>
          <TouchableOpacity
            onPress={() => setShowVolumeControl(!showVolumeControl)}
            style={styles.controlButton}
          >
            <Ionicons
              name={
                volume > 0.5
                  ? "volume-high"
                  : volume > 0
                  ? "volume-medium"
                  : "volume-mute"
              }
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Volume Control */}
      {showVolumeControl && (
        <VolumeControl
          volume={volume}
          onVolumeChange={(value) => dispatch(setVolume(value))}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayGlass,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 1,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlayGlass,
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    ...typography.styles.headingSmall,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 18,
  },
  headerSubtitle: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    opacity: 0.8,
  },
  artworkContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 20,
    position: 'relative',
    marginTop: 20,
  },
  artworkGlow: {
    position: 'absolute',
    width: width - 40,
    height: width - 40,
    borderRadius: (width - 40) / 2,
    backgroundColor: colors.primary,
    opacity: 0.15,
    zIndex: 0,
  },
  artworkWrapper: {
    borderRadius: 24,
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 20,
    position: 'relative',
    zIndex: 1,
  },
  artwork: {
    width: width - 64,
    height: width - 64,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
  },
  artworkOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  pulseIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
  },
  pulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  pulse1: {
    animationDelay: '0s',
  },
  pulse2: {
    animationDelay: '1s', 
  },
  pulse3: {
    animationDelay: '2s',
  },
  trackInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: "800",
    marginBottom: 6,
    fontSize: 20,
  },
  trackArtist: {
    ...typography.styles.bodyLarge,
    color: colors.textSecondary,
    opacity: 0.9,
  },
  favoriteButton: {
    padding: 12,
    backgroundColor: colors.overlayGlass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  progressPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressBarContainer: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  primaryControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  controlButton: {
    padding: 12,
    position: "relative",
  },
  playButton: {
    borderRadius: 40,
    width: 80,
    height: 80,
    marginHorizontal: 24,
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  playButtonGradient: {
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonLoading: {
    opacity: 0.8,
    transform: [{scale: 0.95}],
  },
  repeatIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  repeatText: {
    ...typography.styles.labelSmall,
    color: colors.background,
    fontSize: 10,
    fontWeight: "bold",
  },
  volumeContainer: {
    alignItems: "center",
  },
});

export default PlayerScreen;
