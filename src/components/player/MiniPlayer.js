// src/components/player/MiniPlayer.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {setIsPlaying} from '../../redux/slices/playerSlice';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {dimensions} from '../../styles/globalStyles';

const MiniPlayer = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {currentTrack, isPlaying, position, duration} = useSelector(
    state => state.player,
  );

  if (!currentTrack) {
    return null;
  }

  const progress = duration > 0 ? position / duration : 0;

  const handlePlayPause = () => {
    dispatch(setIsPlaying(!isPlaying));
  };

  const handlePress = () => {
    navigation.navigate('Player');
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, {width: `${progress * 100}%`}]} />
      </View>
      
      <LinearGradient
        colors={[colors.backgroundTertiary, colors.backgroundSecondary]}
        style={styles.content}>
        <TouchableOpacity
          style={styles.trackInfo}
          onPress={handlePress}
          activeOpacity={0.8}>
          <Image
            source={{
              uri:
                (typeof currentTrack.artwork === 'string' && currentTrack.artwork) ||
                'https://via.placeholder.com/50x50?text=Music',
            }}
            style={styles.artwork}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title || 'Unknown Title'}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist || 'Unknown Artist'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: dimensions.tabBarHeight,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.progressBarBackground,
  },
  progress: {
    height: '100%',
    backgroundColor: colors.progressBar,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: dimensions.playerHeight,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  artist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
});

export default MiniPlayer;