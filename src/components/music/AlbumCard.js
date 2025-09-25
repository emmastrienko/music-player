// src/components/music/AlbumCard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

const AlbumCard = ({album}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('AlbumDetail', {album});
  };

  return (
    <TouchableOpacity
      style={[styles.container, {width: CARD_WIDTH}]}
      onPress={handlePress}
      activeOpacity={0.8}>
      
      <View style={styles.artworkContainer}>
        <Image
          source={{
            uri: album.artwork || 'https://via.placeholder.com/200x200?text=Album'
          }}
          style={styles.artwork}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {String(album.name || 'Unknown Album')}
        </Text>
        
        <Text style={styles.artist} numberOfLines={1}>
          {String(album.artist || 'Unknown Artist')}
        </Text>
        
        {album.songs && (
          <Text style={styles.songCount}>
            {String(album.songs.length)} song{album.songs.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  artworkContainer: {
    marginBottom: 8,
  },
  artwork: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  content: {
    paddingHorizontal: 4,
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
    marginBottom: 2,
  },
  songCount: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
  },
});

export default AlbumCard;