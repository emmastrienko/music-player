// src/components/music/PlaylistCard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';

const PlaylistCard = ({playlist}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('PlaylistDetail', {playlist});
  };

  const getPlaylistArtwork = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      return playlist.songs[0].artwork;
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}>
      
      <View style={styles.artworkContainer}>
        {getPlaylistArtwork() ? (
          <Image
            source={{uri: getPlaylistArtwork()}}
            style={styles.artwork}
          />
        ) : (
          <View style={styles.placeholderArtwork}>
            <Ionicons name="musical-notes" size={32} color={colors.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {String(playlist.name || 'Untitled Playlist')}
        </Text>
        
        <Text style={styles.songCount} numberOfLines={1}>
          {String(playlist.songs?.length || 0)} song{playlist.songs?.length !== 1 ? 's' : ''}
        </Text>
        
        {playlist.createdAt && (
          <Text style={styles.createdAt}>
            Created {new Date(playlist.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  artworkContainer: {
    marginRight: 12,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  songCount: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  createdAt: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
  },
  actions: {
    padding: 8,
  },
});

export default PlaylistCard;