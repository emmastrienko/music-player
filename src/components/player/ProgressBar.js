// src/components/player/ProgressBar.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
} from "react-native-reanimated";
import { setPosition } from "../../redux/slices/playerSlice";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import { audioService } from "../../services/audioService";

const ProgressBar = () => {
  const dispatch = useDispatch();
  const { position, duration, isPlaying } = useSelector(
    (state) => state.player
  );

  const [isDragging, setIsDragging] = useState(false);
  const translateX = useSharedValue(0);
  const progress = duration > 0 ? position / duration : 0;

  // Simulate position updates when playing
  useEffect(() => {
    let interval;
    if (isPlaying && !isDragging) {
      interval = setInterval(() => {
        dispatch(setPosition(Math.min(position + 1, duration)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, position, duration, isDragging, dispatch]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      runOnJS(setIsDragging)(true);
    },
    onActive: (event, context) => {
      const newX = Math.max(
        0,
        Math.min(300, event.translationX + context.startX)
      );
      translateX.value = newX;

      const newProgress = newX / 300;
      const newPosition = newProgress * duration;

      // Update audioService
      runOnJS(audioService.setPosition.bind(audioService))(newPosition);

      // Update Redux for UI
      runOnJS(dispatch)(setPosition(Math.floor(newPosition)));
    },
    onEnd: () => {
      runOnJS(setIsDragging)(false);
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    const progressWidth = isDragging ? translateX.value : progress * 300;
    return {
      transform: [{ translateX: Math.max(0, Math.min(300, progressWidth)) }],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const progressWidth = isDragging ? translateX.value : progress * 300;
    return {
      width: Math.max(0, Math.min(300, progressWidth)),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, fillStyle]} />
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.progressThumb, thumbStyle]} />
          </PanGestureHandler>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  progressTrack: {
    width: 300,
    height: 4,
    backgroundColor: colors.progressBarBackground,
    borderRadius: 2,
    position: "relative",
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: colors.progressBar,
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    left: -6,
    width: 16,
    height: 16,
    backgroundColor: colors.progressBar,
    borderRadius: 8,
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
  },
});

export default ProgressBar;
