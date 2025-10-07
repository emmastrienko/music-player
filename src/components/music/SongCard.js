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
import EditSongModal from '../common/EditSongModal';
import { SmallGradientArtwork } from '../common/GradientArtwork';
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
const ARTWORK_SIZE = CARD_WIDTH * 0.85;

const SongCard = ({song, onPress, showArtwork = true, index}) => {
  const dispatch = useDispatch();
  const {currentTrack, isPlaying} = useSelector(state => state.player);
  const {favorites} = useSelector(state => state.music);
  const [showEditModal, setShowEditModal] = React.useState(false);
  
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
          {/* Glassmorphic background */}
          <View style={styles.artworkGlow} />
          
          <SmallGradientArtwork 
            song={song}
            size={ARTWORK_SIZE}
            style={styles.artwork}
          />
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'transparent', colors.overlayLight]}
            style={styles.gradientOverlay}
          />
          
          {/* Play indicator overlay */}
          {isCurrentTrack && (
            <View style={styles.playOverlay}>
              <LinearGradient
                colors={colors.gradientPrimary}
                style={styles.playButton}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={20}
                  color={colors.textPrimary}
                />
              </LinearGradient>
            </View>
          )}
          
          {/* Favorite button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}>
            <View style={[styles.favoriteButtonBg, isFavorite && styles.favoriteButtonBgActive]}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={16}
                color={isFavorite ? colors.textPrimary : colors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {/* Edit button for local songs */}
          {song.isLocal && (
            <TouchableOpacity
              style={[styles.favoriteButton, styles.editButton]}
              onPress={() => setShowEditModal(true)}>
              <View style={styles.favoriteButtonBg}>
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.textContainer}>
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
        </View>
        
        <View style={styles.footer}>
          <View style={styles.metaInfo}>
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
              <View style={styles.localBadge}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={10}
                  color={colors.textMuted}
                />
                <Text style={styles.localText}>Local</Text>
              </View>
            )}
          </View>
          
          {/* Quality indicator */}
          {isCurrentTrack && (
            <View style={styles.playingIndicator}>
              <View style={[styles.waveBar, {animationDelay: '0ms'}]} />
              <View style={[styles.waveBar, {animationDelay: '150ms'}]} />
              <View style={[styles.waveBar, {animationDelay: '300ms'}]} />
            </View>
          )}
        </View>
      </View>

      {/* Edit Modal */}
      <EditSongModal
        visible={showEditModal}
        song={song}
        onClose={() => setShowEditModal(false)}
        onSongUpdated={(updatedSong) => {
          // The Redux actions in the modal will handle the updates
          console.log('Song updated:', updatedSong.title);
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  artworkContainer: {
    position: 'relative',
    margin: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  artworkGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: colors.primary,
    opacity: 0.1,
    borderRadius: 20,
    zIndex: 0,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlayLight,
    borderRadius: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  favoriteButtonBg: {
    backgroundColor: colors.overlayGlass,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  favoriteButtonBgActive: {
    backgroundColor: colors.error,
  },
  editButton: {
    top: 44, // Position below favorite button
  },
  content: {
    padding: 12,
    paddingTop: 4,
  },
  textContainer: {
    marginBottom: 8,
  },
  title: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  artist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duration: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  localText: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 2,
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
});

// Memoize to prevent unnecessary re-renders
export default memo(SongCard);