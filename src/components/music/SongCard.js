// src/components/music/SongCard.js
import React, { memo } from 'react';
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
import {audioService} from '../../services/audioService';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

const SongCard = ({song, onPress, showArtwork = true, index}) => {
  const dispatch = useDispatch();
  const {currentTrack, isPlaying} = useSelector(state => state.player);
  const {favorites} = useSelector(state => state.music);
  
  // Safety check - ensure song has required properties
  if (!song || !song.id) {
    console.warn('SongCard: Invalid song data received:', song);
    return null;
  }
  
  const isCurrentTrack = currentTrack?.id === song.id;
  const isFavorite = favorites.some(fav => fav.id === song.id);

  const handlePress = () => {
    if (onPress) {
      onPress(song);
    } else {
      console.log(`SongCard: Selecting song ${song.title}`);
      
      // Update Redux state - PlayerScreen will handle audio loading
      dispatch(setCurrentTrack(song));
      dispatch(setQueue([song]));
      dispatch(setCurrentIndex(0));
      dispatch(setIsPlaying(true)); // This will trigger playback in PlayerScreen
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
    if (!seconds || typeof seconds !== 'number') return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const result = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    // Ensure we return a string
    if (typeof result !== 'string') {
      console.error('formatDuration returned non-string:', result, typeof result);
      return '0:00';
    }
    return result;
  };

  // Add comprehensive debugging to find the text rendering issue
  if (!song || typeof song.id === 'undefined') {
    console.error('SongCard: Invalid song object:', song);
    return null;
  }

  // Check for problematic data that might cause text rendering issues
  const hasProblematicData = [
    song.title,
    song.artist,
    song.duration,
    song.isLocal
  ].some(value => value !== null && value !== undefined && typeof value === 'object');

  if (hasProblematicData) {
    console.error('SongCard: Found object in text field:', {
      id: song.id,
      title: typeof song.title === 'object' ? 'OBJECT' : song.title,
      artist: typeof song.artist === 'object' ? 'OBJECT' : song.artist,
      duration: typeof song.duration === 'object' ? 'OBJECT' : song.duration,
      isLocal: typeof song.isLocal === 'object' ? 'OBJECT' : song.isLocal
    });
  }

  return (
    <TouchableOpacity
      style={[styles.container, {width: CARD_WIDTH}]}
      onPress={handlePress}
      activeOpacity={0.8}>
      
      {showArtwork && (
        <View style={styles.artworkContainer}>
          <Image
            source={{
              uri: (typeof song.artwork === 'string' && song.artwork) || 'https://via.placeholder.com/150x150?text=Music'
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
          {(() => {
            try {
              const title = song.title || 'Unknown Title';
              return String(title);
            } catch (error) {
              console.error('Error rendering title:', error);
              return 'Unknown Title';
            }
          })()}
        </Text>
        
        <Text style={styles.artist} numberOfLines={1}>
          {(() => {
            try {
              const artist = song.artist || 'Unknown Artist';
              return String(artist);
            } catch (error) {
              console.error('Error rendering artist:', error);
              return 'Unknown Artist';
            }
          })()}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.duration}>
            {(() => {
              try {
                if (song.duration && typeof song.duration === 'number') {
                  const duration = formatDuration(song.duration);
                  return String(duration);
                }
                return '0:00';
              } catch (error) {
                console.error('Error rendering duration:', error);
                return '0:00';
              }
            })()}
          </Text>
          {song.isLocal === true && (
            <Ionicons
              name="phone-portrait-outline"
              size={12}
              color={colors.textMuted}
            />
          )}
        </View>
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

// Memoize to prevent unnecessary re-renders
export default memo(SongCard);