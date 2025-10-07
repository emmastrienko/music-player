// src/components/music/EnhancedSongCard.js
import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur'; // Removed - not installed
import {
  setCurrentTrack,
  setQueue,
  setCurrentIndex,
  setIsPlaying,
} from '../../redux/slices/playerSlice';
import { addToRecentlyPlayed, addToFavorites, removeFromFavorites } from '../../redux/slices/musicSlice';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { designSystem } from '../../styles/designSystem';
import EditSongModal from '../common/EditSongModal';
import { SmallGradientArtwork } from '../common/GradientArtwork';

const { width } = Dimensions.get('window');

const EnhancedSongCard = ({ 
  song, 
  onPress, 
  variant = 'default', // 'default', 'compact', 'featured'
  showArtwork = true,
  index 
}) => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector(state => state.player);
  const { favorites } = useSelector(state => state.music);
  
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  if (!song || !song.id) {
    return null;
  }
  
  const isCurrentTrack = currentTrack?.id === song.id;
  const isFavorite = favorites.some(fav => fav.id === song.id);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

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
    if (!seconds || typeof seconds !== 'number') return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Variant-specific styles
  const getCardStyle = () => {
    switch (variant) {
      case 'featured':
        return styles.featuredCard;
      case 'compact':
        return styles.compactCard;
      default:
        return styles.defaultCard;
    }
  };

  const getArtworkSize = () => {
    switch (variant) {
      case 'featured':
        return { width: width * 0.8, height: width * 0.8 };
      case 'compact':
        return { width: 50, height: 50 };
      default:
        return { width: 60, height: 60 };
    }
  };

  const renderDefaultCard = () => (
    <View style={[styles.defaultCard, isCurrentTrack && styles.activeCard]}>
      <LinearGradient
        colors={isCurrentTrack ? colors.gradientPrimary : [colors.cardBackground, colors.surface]}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {showArtwork && (
          <View style={styles.artworkContainer}>
            <SmallGradientArtwork 
              song={song}
              size={getArtworkSize().width}
              style={styles.artwork}
            />
            {isCurrentTrack && (
              <View style={styles.playingOverlay}>
                <View style={styles.waveformContainer}>
                  {[...Array(3)].map((_, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.waveformBar,
                        isPlaying && { opacity: 0.8 }
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              isCurrentTrack && styles.activeTitle
            ]} numberOfLines={1}>
              {String(song.title || 'Unknown Title')}
            </Text>
            <Text style={[
              styles.artist,
              isCurrentTrack && styles.activeArtist
            ]} numberOfLines={1}>
              {String(song.artist || 'Unknown Artist')}
            </Text>
          </View>

          <View style={styles.controls}>
            <Text style={styles.duration}>
              {formatDuration(song.duration)}
            </Text>
            
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
              onPress={handleFavoriteToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? colors.accent : colors.textMuted}
              />
            </TouchableOpacity>

            {song.isLocal && (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setShowEditModal(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.moreButton}>
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderFeaturedCard = () => (
    <View style={styles.featuredCard}>
      <View style={styles.featuredArtworkContainer}>
        <SmallGradientArtwork 
          song={song}
          size={getArtworkSize().width}
          style={styles.featuredArtwork}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredOverlay}
        >
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {String(song.title || 'Unknown Title')}
            </Text>
            <Text style={styles.featuredArtist} numberOfLines={1}>
              {String(song.artist || 'Unknown Artist')}
            </Text>
            
            <View style={styles.featuredControls}>
              <TouchableOpacity
                style={styles.featuredPlayButton}
                onPress={handlePress}
              >
                <Ionicons name="play" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.featuredFavoriteButton, isFavorite && styles.favoriteActive]}
                onPress={handleFavoriteToggle}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? colors.accent : colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderCompactCard = () => (
    <View style={[styles.compactCard, isCurrentTrack && styles.activeCard]}>
      <SmallGradientArtwork 
        song={song}
        size={getArtworkSize().width}
        style={styles.compactArtwork}
      />
      
      <View style={styles.compactContent}>
        <Text style={[styles.compactTitle, isCurrentTrack && styles.activeTitle]} numberOfLines={1}>
          {String(song.title || 'Unknown Title')}
        </Text>
        <Text style={[styles.compactArtist, isCurrentTrack && styles.activeArtist]} numberOfLines={1}>
          {String(song.artist || 'Unknown Artist')}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.compactPlayButton}
        onPress={handlePress}
      >
        <Ionicons
          name={isCurrentTrack && isPlaying ? 'pause' : 'play'}
          size={16}
          color={colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderCard = () => {
    switch (variant) {
      case 'featured':
        return renderFeaturedCard();
      case 'compact':
        return renderCompactCard();
      default:
        return renderDefaultCard();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        {renderCard()}
      </TouchableOpacity>

      {/* Edit Modal */}
      <EditSongModal
        visible={showEditModal}
        song={song}
        onClose={() => setShowEditModal(false)}
        onSongUpdated={(updatedSong) => {
          console.log('Song updated:', updatedSong.title);
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designSystem.spacing.xs,
  },
  
  // Default card styles
  defaultCard: {
    marginHorizontal: designSystem.spacing.md,
    borderRadius: designSystem.borderRadius.md,
    overflow: 'hidden',
    ...designSystem.elevation.md,
  },
  
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designSystem.spacing.md,
    minHeight: 80,
  },
  
  activeCard: {
    ...designSystem.elevation.lg,
  },
  
  artworkContainer: {
    position: 'relative',
    marginRight: designSystem.spacing.md,
  },
  
  artwork: {
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
    width: 3,
    height: 12,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  textContainer: {
    flex: 1,
    marginRight: designSystem.spacing.sm,
  },
  
  title: {
    ...typography.styles.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  activeTitle: {
    color: colors.textPrimary,
  },
  
  artist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
  },
  
  activeArtist: {
    color: colors.textSecondary,
  },
  
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.sm,
  },
  
  duration: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
  },
  
  favoriteButton: {
    padding: designSystem.spacing.xs,
  },
  
  favoriteActive: {
    transform: [{ scale: 1.1 }],
  },
  
  editButton: {
    padding: designSystem.spacing.xs,
  },
  
  moreButton: {
    padding: designSystem.spacing.xs,
  },
  
  // Featured card styles
  featuredCard: {
    marginHorizontal: designSystem.spacing.md,
    borderRadius: designSystem.borderRadius.lg,
    overflow: 'hidden',
    ...designSystem.elevation.xl,
  },
  
  featuredArtworkContainer: {
    position: 'relative',
  },
  
  featuredArtwork: {
    borderRadius: designSystem.borderRadius.lg,
  },
  
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: designSystem.spacing.lg,
  },
  
  featuredContent: {
    gap: designSystem.spacing.xs,
  },
  
  featuredTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  featuredArtist: {
    ...typography.styles.bodyLarge,
    color: colors.textSecondary,
  },
  
  featuredControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.md,
    marginTop: designSystem.spacing.sm,
  },
  
  featuredPlayButton: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.elevation.md,
  },
  
  featuredFavoriteButton: {
    padding: designSystem.spacing.sm,
  },
  
  // Compact card styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: designSystem.spacing.sm,
    backgroundColor: colors.surface,
    marginHorizontal: designSystem.spacing.md,
    borderRadius: designSystem.borderRadius.sm,
    ...designSystem.elevation.sm,
  },
  
  compactArtwork: {
    borderRadius: designSystem.borderRadius.xs,
    marginRight: designSystem.spacing.sm,
  },
  
  compactContent: {
    flex: 1,
  },
  
  compactTitle: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  
  compactArtist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  compactPlayButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(EnhancedSongCard);