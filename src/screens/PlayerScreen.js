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
import { globalStyles } from "../styles/globalStyles";

const { width, height } = Dimensions.get("window");

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
    navigation.goBack();
    return null;
  }

  const handlePlayPause = async () => {
    if (isLoading) return;

    try {
      if (isPlaying) {
        await audioService.pause();
        dispatch(setIsPlaying(false));
        console.log("Paused playback");
      } else {
        await audioService.play();
        dispatch(setIsPlaying(true));
        console.log("Started playback");
      }
    } catch (error) {
      console.error("Error during play/pause:", error);
      // Still update UI state for demo purposes
      dispatch(setIsPlaying(!isPlaying));
    }
  };

  const handleNext = async () => {
    if (currentIndex < queue.length - 1 || repeatMode === "queue") {
      try {
        await audioService.stop();
        dispatch(nextTrack());
        console.log("Skipped to next track");
      } catch (error) {
        console.error("Error skipping to next track:", error);
        dispatch(nextTrack());
      }
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0 || repeatMode === "queue") {
      try {
        await audioService.stop();
        dispatch(previousTrack());
        console.log("Skipped to previous track");
      } catch (error) {
        console.error("Error skipping to previous track:", error);
        dispatch(previousTrack());
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
      colors={[colors.gradientStart, colors.background]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} of {queue.length}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Animated.View
          style={[
            styles.artworkWrapper,
            { transform: [{ scale: artworkScale }] },
          ]}
        >
          <Image
            source={{
              uri:
                currentTrack.artwork ||
                "https://via.placeholder.com/300x300?text=Music",
            }}
            style={styles.artwork}
          />
        </Animated.View>
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

      {/* Progress Bar */}
      <ProgressBar />

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
          >
            <Ionicons
              name={isLoading ? "refresh" : isPlaying ? "pause" : "play"}
              size={40}
              color={colors.background}
            />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  headerSubtitle: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  artworkContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  artworkWrapper: {
    borderRadius: 20,
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  trackInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 8,
  },
  trackArtist: {
    ...typography.styles.bodyLarge,
    color: colors.textSecondary,
  },
  favoriteButton: {
    padding: 8,
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
    backgroundColor: colors.textPrimary,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 30,
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonLoading: {
    opacity: 0.7,
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
