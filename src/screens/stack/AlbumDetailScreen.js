// src/screens/stack/AlbumDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useDispatch} from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  setCurrentTrack,
  setQueue,
  setCurrentIndex,
  setIsPlaying,
} from '../../redux/slices/playerSlice';
import {addToRecentlyPlayed} from '../../redux/slices/musicSlice';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {globalStyles} from '../../styles/globalStyles';

const AlbumDetailScreen = ({route}) => {
  const dispatch = useDispatch();
  const {album} = route.params;

  const handlePlayAll = () => {
    if (album.songs && album.songs.length > 0) {
      dispatch(setQueue(album.songs));
      dispatch(setCurrentTrack(album.songs[0]));
      dispatch(setCurrentIndex(0));
      dispatch(setIsPlaying(true));
      dispatch(addToRecentlyPlayed(album.songs[0]));
    }
  };

  const handleSongPress = (song, index) => {
    dispatch(setCurrentTrack(song));
    dispatch(setQueue(album.songs));
    dispatch(setCurrentIndex(index));
    dispatch(setIsPlaying(true));
    dispatch(addToRecentlyPlayed(song));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSongItem = ({item, index}) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSongPress(item, index)}
      activeOpacity={0.8}>
      
      <View style={styles.trackNumber}>
        <Text style={styles.trackNumberText}>{index + 1}</Text>
      </View>
      
      <View style={styles.songDetails}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>

      <Text style={styles.songDuration}>
        {formatDuration(item.duration)}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.background]}
      style={styles.headerGradient}>
      
      <View style={styles.albumInfo}>
        <Image
          source={{
            uri: album.artwork || 'https://via.placeholder.com/200x200?text=Album'
          }}
          style={styles.albumArtwork}
        />

        <View style={styles.albumDetails}>
          <Text style={styles.albumName}>{album.name}</Text>
          <Text style={styles.albumArtist}>{album.artist}</Text>
          
          <Text style={styles.albumMeta}>
            {album.songs?.length || 0} song{album.songs?.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <Button
        title="Play Album"
        onPress={handlePlayAll}
        icon="play"
        disabled={!album.songs || album.songs.length === 0}
      />
    </LinearGradient>
  );

  return (
    <View style={globalStyles.container}>
      <Header title="" showBack />
      
      <FlatList
        data={album.songs || []}
        renderItem={renderSongItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  albumInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  albumArtwork: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  albumDetails: {
    alignItems: 'center',
  },
  albumName: {
    ...typography.styles.headingLarge,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  albumArtist: {
    ...typography.styles.bodyLarge,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  albumMeta: {
    ...typography.styles.bodyMedium,
    color: colors.textMuted,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  trackNumber: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  trackNumberText: {
    ...typography.styles.bodyMedium,
    color: colors.textMuted,
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  songArtist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
  },
  songDuration: {
    ...typography.styles.bodySmall,
    color: colors.textMuted,
  },
});

export default AlbumDetailScreen;