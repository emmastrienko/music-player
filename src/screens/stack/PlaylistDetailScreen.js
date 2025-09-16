// src/screens/stack/PlaylistDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
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
import {removeSongFromPlaylist, deletePlaylist} from '../../redux/slices/musicSlice';
import {addToRecentlyPlayed} from '../../redux/slices/musicSlice';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {globalStyles} from '../../styles/globalStyles';

const PlaylistDetailScreen = ({route, navigation}) => {
  const dispatch = useDispatch();
  const {playlist} = route.params;

  const handlePlayAll = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      dispatch(setQueue(playlist.songs));
      dispatch(setCurrentTrack(playlist.songs[0]));
      dispatch(setCurrentIndex(0));
      dispatch(setIsPlaying(true));
      dispatch(addToRecentlyPlayed(playlist.songs[0]));
    }
  };

  const handleSongPress = (song, index) => {
    dispatch(setCurrentTrack(song));
    dispatch(setQueue(playlist.songs));
    dispatch(setCurrentIndex(index));
    dispatch(setIsPlaying(true));
    dispatch(addToRecentlyPlayed(song));
  };

  const handleRemoveSong = (songId) => {
    Alert.alert(
      'Remove Song',
      'Are you sure you want to remove this song from the playlist?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeSongFromPlaylist({
              playlistId: playlist.id,
              songId,
            }));
          },
        },
      ],
    );
  };

  const handleDeletePlaylist = () => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deletePlaylist(playlist.id));
            navigation.goBack();
          },
        },
      ],
    );
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
      
      <View style={styles.songInfo}>
        <Image
          source={{
            uri: item.artwork || 'https://via.placeholder.com/50x50?text=Music'
          }}
          style={styles.songArtwork}
        />
        
        <View style={styles.songDetails}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
      </View>

      <View style={styles.songActions}>
        <Text style={styles.songDuration}>
          {formatDuration(item.duration)}
        </Text>
        
        <TouchableOpacity
          onPress={() => handleRemoveSong(item.id)}
          style={styles.removeButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getPlaylistArtwork = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      return playlist.songs[0].artwork;
    }
    return null;
  };

  const getTotalDuration = () => {
    if (!playlist.songs) return 0;
    return playlist.songs.reduce((total, song) => total + (song.duration || 0), 0);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.background]}
      style={styles.headerGradient}>
      
      <View style={styles.playlistInfo}>
        <View style={styles.artworkContainer}>
          {getPlaylistArtwork() ? (
            <Image
              source={{uri: getPlaylistArtwork()}}
              style={styles.playlistArtwork}
            />
          ) : (
            <View style={styles.placeholderArtwork}>
              <Ionicons name="musical-notes" size={60} color={colors.textSecondary} />
            </View>
          )}
        </View>

        <View style={styles.playlistDetails}>
          <Text style={styles.playlistName}>{playlist.name}</Text>
          
          <Text style={styles.playlistMeta}>
            {playlist.songs?.length || 0} song{playlist.songs?.length !== 1 ? 's' : ''}
            {getTotalDuration() > 0 && (
              <Text> • {Math.floor(getTotalDuration() / 60)} min</Text>
            )}
          </Text>
          
          {playlist.createdAt && (
            <Text style={styles.createdDate}>
              Created {new Date(playlist.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.playlistActions}>
        <Button
          title="Play All"
          onPress={handlePlayAll}
          icon="play"
          disabled={!playlist.songs || playlist.songs.length === 0}
          style={styles.playButton}
        />
        
        <TouchableOpacity
          onPress={handleDeletePlaylist}
          style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <View style={globalStyles.container}>
      <Header title="" showBack />
      
      <FlatList
        data={playlist.songs || []}
        renderItem={renderSongItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={80} color={colors.textMuted} />
            <Text style={styles.emptyText}>No songs in this playlist</Text>
            <Text style={styles.emptySubtext}>
              Add songs from your library or search
            </Text>
          </View>
        }
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
  playlistInfo: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  artworkContainer: {
    marginRight: 20,
  },
  playlistArtwork: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  placeholderArtwork: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  playlistName: {
    ...typography.styles.headingLarge,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  playlistMeta: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  createdDate: {
    ...typography.styles.bodySmall,
    color: colors.textMuted,
  },
  playlistActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playButton: {
    flex: 1,
    marginRight: 16,
  },
  deleteButton: {
    padding: 12,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.backgroundTertiary,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  songArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
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
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songDuration: {
    ...typography.styles.bodySmall,
    color: colors.textMuted,
    marginRight: 12,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...typography.styles.headingMedium,
    color: colors.textMuted,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.styles.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default PlaylistDetailScreen;