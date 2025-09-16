// src/screens/tabs/LibraryScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {setLocalSongs, createPlaylist} from '../../redux/slices/musicSlice';
import {localMusicService} from '../../services/localMusicService';
import SongCard from '../../components/music/SongCard';
import PlaylistCard from '../../components/music/PlaylistCard';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {globalStyles} from '../../styles/globalStyles';

const LibraryScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    localSongs,
    favorites,
    recentlyPlayed,
    playlists,
  } = useSelector(state => state.music);

  const [selectedTab, setSelectedTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLocalMusic();
  }, []);

  const loadLocalMusic = async () => {
    setIsLoading(true);
    try {
      const songs = await localMusicService.scanLocalMusic();
      dispatch(setLocalSongs(songs));
    } catch (error) {
      console.error('Error loading local music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = () => {
    Alert.prompt(
      'Create Playlist',
      'Enter playlist name:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: (name) => {
            if (name && name.trim()) {
              dispatch(createPlaylist({name: name.trim()}));
            }
          },
        },
      ],
      'plain-text',
    );
  };

  const tabs = [
    {key: 'all', title: 'All', count: localSongs.length + favorites.length},
    {key: 'local', title: 'Downloaded', count: localSongs.length},
    {key: 'favorites', title: 'Favorites', count: favorites.length},
    {key: 'playlists', title: 'Playlists', count: playlists.length},
    {key: 'recent', title: 'Recent', count: recentlyPlayed.length},
  ];

  const renderTabButton = (tab) => (
    <TouchableOpacity
      key={tab.key}
      style={[
        styles.tabButton,
        selectedTab === tab.key && styles.activeTabButton,
      ]}
      onPress={() => setSelectedTab(tab.key)}>
      <Text
        style={[
          styles.tabButtonText,
          selectedTab === tab.key && styles.activeTabButtonText,
        ]}>
        {tab.title}
      </Text>
      <Text
        style={[
          styles.tabCount,
          selectedTab === tab.key && styles.activeTabCount,
        ]}>
        {tab.count}
      </Text>
    </TouchableOpacity>
  );

  const renderSongItem = ({item}) => (
    <View style={styles.songItem}>
      <SongCard song={item} showArtwork={false} />
    </View>
  );

  const renderPlaylistItem = ({item}) => (
    <PlaylistCard playlist={item} />
  );

  const getCurrentData = () => {
    switch (selectedTab) {
      case 'local':
        return localSongs;
      case 'favorites':
        return favorites;
      case 'playlists':
        return playlists;
      case 'recent':
        return recentlyPlayed;
      default:
        return [...localSongs, ...favorites];
    }
  };

  const renderContent = () => {
    const data = getCurrentData();

    if (selectedTab === 'playlists') {
      return (
        <View style={styles.playlistsContainer}>
          <Button
            title="Create Playlist"
            onPress={handleCreatePlaylist}
            style={styles.createButton}
            icon="add"
          />
          
          <FlatList
            data={data}
            renderItem={renderPlaylistItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        renderItem={renderSongItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={loadLocalMusic}
      />
    );
  };

  return (
    <View style={globalStyles.container}>
      <Header 
        title="Your Library" 
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}>
        {tabs.map(renderTabButton)}
      </ScrollView>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    maxHeight: 60,
    backgroundColor: colors.backgroundSecondary,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButton: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    ...typography.styles.labelMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: colors.background,
  },
  tabCount: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  activeTabCount: {
    color: colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  songItem: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  playlistsContainer: {
    flex: 1,
  },
  createButton: {
    margin: 16,
  },
});

export default LibraryScreen;