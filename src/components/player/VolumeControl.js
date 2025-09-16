// src/components/player/VolumeControl.js
import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import {colors} from '../../styles/colors';

const VolumeControl = ({volume, onVolumeChange}) => {
  const translateX = useSharedValue(volume * 200);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newX = Math.max(0, Math.min(200, event.translationX + context.startX));
      translateX.value = newX;
      
      const newVolume = newX / 200;
      runOnJS(onVolumeChange)(newVolume);
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    const progressWidth = volume * 200;
    return {
      transform: [{translateX: Math.max(0, Math.min(200, progressWidth))}],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const progressWidth = volume * 200;
    return {
      width: Math.max(0, Math.min(200, progressWidth)),
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onVolumeChange(0)}>
        <Ionicons
          name="volume-low"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      
      <View style={styles.sliderContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </PanGestureHandler>
        </View>
      </View>
      
      <TouchableOpacity onPress={() => onVolumeChange(1)}>
        <Ionicons
          name="volume-high"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundTertiary,
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  track: {
    height: 4,
    backgroundColor: colors.progressBarBackground,
    borderRadius: 2,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -6,
    left: -8,
    width: 16,
    height: 16,
    backgroundColor: colors.primary,
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
  icon: {
    marginHorizontal: 4,
  },
});

export default VolumeControl;
