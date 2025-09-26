// src/components/music/EnhancedAlbumCard.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { designSystem } from '../../styles/designSystem';

const { width } = Dimensions.get('window');

const EnhancedAlbumCard = ({ 
  album, 
  variant = 'default', // 'default', 'large', 'grid'
  onPress 
}) => {
  const navigation = useNavigation();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);

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
      onPress(album);
    } else {
      navigation.navigate('AlbumDetail', { album });
    }
  };

  const getCardDimensions = () => {
    switch (variant) {
      case 'large':
        return {
          width: width * 0.8,
          height: width * 0.8,
        };
      case 'grid':
        return {
          width: (width - 60) / 2, // 2 columns with margins
          height: (width - 60) / 2,
        };
      default:
        return {
          width: width * 0.4,
          height: width * 0.4,
        };
    }
  };

  const cardDimensions = getCardDimensions();

  const renderDefaultCard = () => (
    <View style={[styles.defaultCard, { width: cardDimensions.width }]}>
      <View style={styles.artworkContainer}>
        <Image
          source={{
            uri: album.artwork || 'https://via.placeholder.com/200x200?text=Album'
          }}
          style={[styles.artwork, { 
            width: cardDimensions.width, 
            height: cardDimensions.height 
          }]}
        />
        
        {/* Hover overlay */}
        <View style={styles.overlay}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.overlayGradient}
          >
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Genre badge */}
        {album.genre && (
          <View style={styles.genreBadge}>
            <Text style={styles.genreText}>{album.genre}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {String(album.name || 'Unknown Album')}
        </Text>
        
        <Text style={styles.artist} numberOfLines={1}>
          {String(album.artist || 'Unknown Artist')}
        </Text>
        
        <View style={styles.metadata}>
          {album.year && (
            <Text style={styles.year}>{album.year}</Text>
          )}
          {album.songs && (
            <Text style={styles.songCount}>
              {album.songs.length} song{album.songs.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderLargeCard = () => (
    <View style={[styles.largeCard, { width: cardDimensions.width }]}>
      <View style={styles.largeArtworkContainer}>
        <Image
          source={{
            uri: album.artwork || 'https://via.placeholder.com/300x300?text=Album'
          }}
          style={[styles.largeArtwork, { 
            width: cardDimensions.width, 
            height: cardDimensions.height 
          }]}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.largeOverlay}
        >
          <View style={styles.largeContent}>
            <View style={styles.largeBadges}>
              {album.isExplicit && (
                <View style={styles.explicitBadge}>
                  <Text style={styles.explicitText}>E</Text>
                </View>
              )}
              {album.genre && (
                <View style={styles.genreBadgeLarge}>
                  <Text style={styles.genreTextLarge}>{album.genre}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.largeInfo}>
              <Text style={styles.largeTitle} numberOfLines={2}>
                {String(album.name || 'Unknown Album')}
              </Text>
              
              <Text style={styles.largeArtist} numberOfLines={1}>
                {String(album.artist || 'Unknown Artist')}
              </Text>
              
              <View style={styles.largeMetadata}>
                {album.year && (
                  <Text style={styles.largeYear}>{album.year}</Text>
                )}
                {album.songs && (
                  <Text style={styles.largeSongCount}>
                    {album.songs.length} tracks
                  </Text>
                )}
              </View>

              <View style={styles.largeControls}>
                <TouchableOpacity style={styles.largePlayButton}>
                  <Ionicons name="play" size={20} color={colors.textPrimary} />
                  <Text style={styles.playButtonText}>Play</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shuffleButton}>
                  <Ionicons name="shuffle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.favoriteButton}>
                  <Ionicons name="heart-outline" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderGridCard = () => (
    <View style={[styles.gridCard, { width: cardDimensions.width }]}>
      <View style={styles.gridArtworkContainer}>
        <Image
          source={{
            uri: album.artwork || 'https://via.placeholder.com/150x150?text=Album'
          }}
          style={[styles.gridArtwork, { 
            width: cardDimensions.width, 
            height: cardDimensions.width 
          }]}
        />
        
        <View style={styles.gridOverlay}>
          <TouchableOpacity style={styles.gridPlayButton}>
            <Ionicons name="play" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>
          {String(album.name || 'Unknown Album')}
        </Text>
        
        <Text style={styles.gridArtist} numberOfLines={1}>
          {String(album.artist || 'Unknown Artist')}
        </Text>
      </View>
    </View>
  );

  const renderCard = () => {
    switch (variant) {
      case 'large':
        return renderLargeCard();
      case 'grid':
        return renderGridCard();
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designSystem.spacing.xs,
  },

  // Default card styles
  defaultCard: {
    marginRight: designSystem.spacing.md,
  },

  artworkContainer: {
    position: 'relative',
    marginBottom: designSystem.spacing.sm,
  },

  artwork: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: designSystem.borderRadius.md,
    ...designSystem.elevation.md,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: designSystem.borderRadius.md,
    opacity: 0,
  },

  overlayGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: designSystem.borderRadius.md,
  },

  playButton: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.elevation.lg,
  },

  genreBadge: {
    position: 'absolute',
    top: designSystem.spacing.sm,
    right: designSystem.spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: designSystem.spacing.sm,
    paddingVertical: designSystem.spacing.xs,
    borderRadius: designSystem.borderRadius.full,
  },

  genreText: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  content: {
    paddingHorizontal: designSystem.spacing.xs,
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
    marginBottom: 4,
  },

  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  year: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
  },

  songCount: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
  },

  // Large card styles
  largeCard: {
    marginHorizontal: designSystem.spacing.md,
  },

  largeArtworkContainer: {
    position: 'relative',
  },

  largeArtwork: {
    borderRadius: designSystem.borderRadius.lg,
    ...designSystem.elevation.xl,
  },

  largeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: designSystem.borderRadius.lg,
    borderBottomRightRadius: designSystem.borderRadius.lg,
    padding: designSystem.spacing.lg,
  },

  largeContent: {
    gap: designSystem.spacing.md,
  },

  largeBadges: {
    flexDirection: 'row',
    gap: designSystem.spacing.sm,
  },

  explicitBadge: {
    backgroundColor: colors.error,
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  explicitText: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },

  genreBadgeLarge: {
    backgroundColor: colors.accent,
    paddingHorizontal: designSystem.spacing.sm,
    paddingVertical: designSystem.spacing.xs,
    borderRadius: designSystem.borderRadius.full,
  },

  genreTextLarge: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  largeInfo: {
    gap: designSystem.spacing.xs,
  },

  largeTitle: {
    ...typography.styles.headingLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },

  largeArtist: {
    ...typography.styles.bodyLarge,
    color: colors.textSecondary,
  },

  largeMetadata: {
    flexDirection: 'row',
    gap: designSystem.spacing.md,
  },

  largeYear: {
    ...typography.styles.bodySmall,
    color: colors.textMuted,
  },

  largeSongCount: {
    ...typography.styles.bodySmall,
    color: colors.textMuted,
  },

  largeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.md,
    marginTop: designSystem.spacing.sm,
  },

  largePlayButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.sm,
    borderRadius: designSystem.borderRadius.full,
    gap: designSystem.spacing.sm,
    ...designSystem.elevation.md,
  },

  playButtonText: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  shuffleButton: {
    backgroundColor: colors.surfaceLight,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  favoriteButton: {
    backgroundColor: colors.surfaceLight,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Grid card styles
  gridCard: {
    marginBottom: designSystem.spacing.md,
  },

  gridArtworkContainer: {
    position: 'relative',
    marginBottom: designSystem.spacing.sm,
  },

  gridArtwork: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: designSystem.borderRadius.sm,
    ...designSystem.elevation.sm,
  },

  gridOverlay: {
    position: 'absolute',
    top: designSystem.spacing.sm,
    right: designSystem.spacing.sm,
  },

  gridPlayButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.elevation.md,
  },

  gridContent: {
    paddingHorizontal: designSystem.spacing.xs,
  },

  gridTitle: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },

  gridArtist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
  },
});

export default EnhancedAlbumCard;