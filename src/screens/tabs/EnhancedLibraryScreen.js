// src/screens/tabs/EnhancedLibraryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import {
  setCurrentTrack,
  setQueue,
  setCurrentIndex,
  setIsPlaying,
} from '../../redux/slices/playerSlice';
import { addToRecentlyPlayed } from '../../redux/slices/musicSlice';
import CreatePlaylistModal from '../../components/common/CreatePlaylistModal';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { SmallGradientArtwork } from '../../components/common/GradientArtwork';

const EnhancedLibraryScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('localSongs'); // localSongs, playlists, favorites, recent
  const [localSongs, setLocalSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { favorites, recentlyPlayed } = useSelector(state => state.music);
  const { currentTrack, isPlaying } = useSelector(state => state.player);

  useEffect(() => {
    loadLocalSongs();
  }, []);

  const loadLocalSongs = async () => {
    try {
      setLoading(true);
      
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to load your local songs.');
        return;
      }

      // Get audio files
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 1000, // Limit to first 1000 songs
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });

      const songs = media.assets.map((asset, index) => ({
        id: asset.id,
        title: asset.filename.replace(/\.[^/.]+$/, ""), // Remove file extension
        artist: 'Unknown Artist',
        album: 'Local Music',
        duration: asset.duration,
        artwork: null, // Local files usually don't have artwork
        uri: asset.uri,
        isLocal: true,
      }));

      setLocalSongs(songs);
    } catch (error) {
      console.error('Error loading local songs:', error);
      Alert.alert('Error', 'Failed to load local songs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLocalSongs();
    setRefreshing(false);
  };

  const handlePlaySong = (song, songList = localSongs) => {
    const songIndex = songList.findIndex(s => s.id === song.id);
    dispatch(setCurrentTrack(song));
    dispatch(setQueue(songList));
    dispatch(setCurrentIndex(songIndex));
    dispatch(setIsPlaying(true));
    dispatch(addToRecentlyPlayed(song));
  };

  const handleCreatePlaylist = (playlist) => {
    setPlaylists([...playlists, playlist]);
    Alert.alert('Success', `Playlist "${playlist.name}" created successfully!`);
  };

  const renderLocalSong = ({ item, index }) => {
    const isCurrentSong = currentTrack?.id === item.id;
    
    return (
      <View style={styles.localSongCard}>
        <TouchableOpacity 
          style={[styles.songCardContainer, isCurrentSong && styles.currentSongCard]}
          onPress={() => handlePlaySong(item)}
          activeOpacity={0.8}
        >
          {/* Album Artwork */}
          <View style={styles.localArtworkContainer}>
            <LinearGradient
              colors={[colors.primary + '60', colors.secondary + '60']}
              style={styles.localCardArtwork}
            >
              <Ionicons 
                name="musical-notes" 
                size={32} 
                color={colors.textPrimary} 
              />
            </LinearGradient>
            
            {/* Play Button Overlay */}
            <TouchableOpacity 
              style={styles.localCardPlayOverlay}
              onPress={() => handlePlaySong(item)}
              activeOpacity={0.8}
            >
              <View style={styles.localCardPlayButton}>
                <Ionicons
                  name={isCurrentSong && isPlaying ? 'pause' : 'play'}
                  size={16}
                  color={colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Song Info */}
          <View style={styles.localCardContent}>
            <Text 
              style={[styles.localCardTitle, isCurrentSong && styles.currentCardTitle]} 
              numberOfLines={2}
            >
              {item.title}
            </Text>
            
            <View style={styles.localCardMeta}>
              <View style={styles.localBadge}>
                <Ionicons name="phone-portrait" size={10} color={colors.textPrimary} />
                <Text style={styles.localBadgeText}>Local</Text>
              </View>
            </View>
            
            {item.duration && (
              <Text style={styles.localCardDuration}>
                {Math.floor(item.duration / 60)}:{Math.floor(item.duration % 60).toString().padStart(2, '0')}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity style={styles.playlistItem}>
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.backgroundTertiary]}
        style={styles.playlistGradient}
      >
        <View style={styles.playlistIcon}>
          <Ionicons name="musical-notes" size={24} color={colors.primary} />
        </View>
        
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.playlistMeta} numberOfLines={1}>
            {item.songs.length} songs • Created {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.playlistAction}>
          <Ionicons name="play-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.favoriteItem}
      onPress={() => handlePlaySong(item, favorites)}
    >
      <SmallGradientArtwork 
        song={item}
        size={50}
        style={styles.favoriteArtwork}
      />
      
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.favoriteArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.favoritePlayButton}
        onPress={() => handlePlaySong(item, favorites)}
      >
        <Ionicons name="play" size={16} color={colors.textPrimary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTabButton = (tab, label, icon, count = null) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <View style={styles.tabContent}>
        <Ionicons
          name={icon}
          size={20}
          color={activeTab === tab ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
          {label}
        </Text>
        {count !== null && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    const emptyStates = {
      localSongs: {
        icon: 'phone-portrait',
        title: 'No Local Songs',
        subtitle: 'No music files found on your device',
      },
      playlists: {
        icon: 'musical-notes',
        title: 'No Playlists',
        subtitle: 'Create your first playlist to get started',
      },
      favorites: {
        icon: 'heart',
        title: 'No Favorites',
        subtitle: 'Songs you like will appear here',
      },
      recent: {
        icon: 'time',
        title: 'No Recent Songs',
        subtitle: 'Songs you play will appear here',
      },
    };

    const state = emptyStates[activeTab];

    return (
      <View style={styles.emptyState}>
        <Ionicons name={state.icon} size={60} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>{state.title}</Text>
        <Text style={styles.emptySubtitle}>{state.subtitle}</Text>
        
        {activeTab === 'playlists' && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreatePlaylist(true)}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.createButtonGradient}
            >
              <Ionicons name="add" size={20} color={colors.textPrimary} />
              <Text style={styles.createButtonText}>Create Playlist</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    const data = {
      localSongs: localSongs,
      playlists: playlists,
      favorites: favorites,
      recent: recentlyPlayed,
    };

    const renderItem = {
      localSongs: renderLocalSong,
      playlists: renderPlaylistItem,
      favorites: renderFavoriteItem,
      recent: renderFavoriteItem,
    };

    const currentData = data[activeTab];
    const currentRenderItem = renderItem[activeTab];

    if (loading && activeTab === 'localSongs') {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading local songs...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={currentData}
        renderItem={currentRenderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        horizontal={activeTab === 'localSongs'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={activeTab === 'localSongs' ? styles.horizontalListContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          activeTab === 'localSongs' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      />
    );
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        
        {activeTab === 'playlists' && (
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => setShowCreatePlaylist(true)}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('localSongs', 'Local', 'phone-portrait', localSongs.length)}
        {renderTabButton('playlists', 'Playlists', 'musical-notes', playlists.length)}
        {renderTabButton('favorites', 'Favorites', 'heart', favorites.length)}
        {renderTabButton('recent', 'Recent', 'time', recentlyPlayed.length)}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        visible={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onCreatePlaylist={handleCreatePlaylist}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  headerTitle: {
    ...typography.styles.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  headerAction: {
    padding: 8,
  },
  
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  
  activeTab: {
    backgroundColor: colors.primary + '20',
  },
  
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  
  tabText: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
    fontWeight: '500',
  },
  
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  
  tabBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 16,
  },
  
  tabBadgeText: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  content: {
    flex: 1,
  },
  
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  
  horizontalListContainer: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingBottom: 20,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
  },
  
  // Local Songs Styles - Horizontal Card Design
  localSongCard: {
    width: 160,
    marginRight: 12,
  },
  
  songCardContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    ...globalStyles.shadowMedium,
  },
  
  currentSongCard: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  
  localArtworkContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  
  localCardArtwork: {
    width: '100%',
    height: 136,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  localCardPlayOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  localCardPlayButton: {
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  localCardContent: {
    gap: 6,
  },
  
  localCardTitle: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
  },
  
  currentCardTitle: {
    color: colors.primary,
  },
  
  localCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  
  localBadgeText: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '600',
  },
  
  localCardDuration: {
    ...typography.styles.bodySmall,
    color: colors.textMuted,
    fontSize: 11,
  },
  
  // Playlist Styles
  playlistItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  playlistGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  
  playlistIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  playlistInfo: {
    flex: 1,
    gap: 4,
  },
  
  playlistName: {
    ...typography.styles.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  playlistMeta: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
  },
  
  playlistAction: {
    padding: 8,
  },
  
  // Favorite Styles
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  
  favoriteArtwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.backgroundTertiary,
  },
  
  favoriteInfo: {
    flex: 1,
    gap: 4,
  },
  
  favoriteTitle: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  favoriteArtist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
  },
  
  favoritePlayButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  
  emptyTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  emptySubtitle: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  createButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  
  createButtonText: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default EnhancedLibraryScreen;