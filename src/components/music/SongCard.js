// src/components/music/SongCard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  setCurrentTrack,
  setQueue,
  setCurrentIndex,
  setIsPlaying,
} from '../../redux/slices/playerSlice';
import {addToRecentlyPlayed, addToFavorites, removeFromFavorites} from '../../redux/slices/musicSlice';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

const SongCard = ({song, onPress, showArtwork = true, index}) => {
  const dispatch = useDispatch();
  const {currentTrack, isPlaying} = useSelector(state => state.player);
  const {favorites} = useSelector(state => state.music);
  
  const isCurrentTrack = currentTrack?.id === song.id;
  const isFavorite = favorites.some(fav => fav.id === song.id);

  const handlePress = () => {
    if (onPress) {
      onPress(song);
    } else {
      dispatch(setCurrentTrack(song));
      dispatch(setQueue([song]));
      dispatch(setCurrentIndex(0));
      dispatch(setIsPlaying(true));
      dispatch(addToRecentlyPlayed(song));
    }
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      dispatch(removeFromFavorites(song.id));
    } else {
      dispatch(addToFavorites(song));
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, {width: CARD_WIDTH}]}
      onPress={handlePress}
      activeOpacity={0.8}>
      
      {showArtwork && (
        <View style={styles.artworkContainer}>
          <Image
            source={{
              uri: song.artwork || 'https://via.placeholder.com/150x150?text=Music'
            }}
            style={styles.artwork}
          />
          
          {/* Play indicator overlay */}
          {isCurrentTrack && (
            <LinearGradient
              colors={['transparent', colors.overlay]}
              style={styles.playOverlay}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color={colors.textPrimary}
              />
            </LinearGradient>
          )}
          
          {/* Favorite button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.error : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            isCurrentTrack && {color: colors.primary}
          ]}
          numberOfLines={2}>
          {song.title}
        </Text>
        
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
        
        {song.duration && (
          <View style={styles.footer}>
            <Text style={styles.duration}>
              {formatDuration(song.duration)}
            </Text>
            {song.isLocal && (
              <Ionicons
                name="phone-portrait-outline"
                size={12}
                color={colors.textMuted}
              />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  artworkContainer: {
    position: 'relative',
  },
  artwork: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    backgroundColor: colors.backgroundSecondary,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.overlay,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
  },
});

export default SongCard;