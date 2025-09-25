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
import {loadLocalMusic} from '../../redux/actions/musicActions';
import SongCard from '../../components/music/SongCard';
import PlaylistCard from '../../components/music/PlaylistCard';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {globalStyles} from '../../styles/globalStyles';
import {localMusicService} from '../../services/localMusicService';
import {audioService} from '../../services/audioService';

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
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    loadLocalMusicFiles();
  }, []);

  const loadLocalMusicFiles = async () => {
    setIsLoading(true);
    try {
      console.log('=== DEBUG: Starting local music load ===');
      const result = await dispatch(loadLocalMusic()).unwrap();
      console.log('Local music loaded successfully:', {
        count: result?.length || 0,
        firstSong: result?.[0] ? {
          title: result[0].title,
          url: result[0].url,
          isLocal: result[0].isLocal
        } : null
      });
    } catch (error) {
      console.error('Error loading local music:', error);
      
      // Determine the type of error and show appropriate message
      let title = 'Error Loading Local Music';
      let message = 'Unable to load local music files.';
      
      if (error.message && error.message.includes('permission')) {
        title = 'Permission Required';
        message = 'To play local music, please grant access to your media library in device settings.';
      } else if (error.message && error.message.includes('No audio files found')) {
        title = 'No Music Found';
        message = 'No audio files were found on your device. Please add some music files and try again.';
      } else {
        message = `Error: ${error.message || 'Unknown error occurred'}`;
      }
      
      // Show user-friendly error message
      Alert.alert(
        title,
        message,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Try Again', onPress: loadLocalMusicFiles},
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testLocalMusicDirect = async () => {
    setDebugInfo('Starting direct test...');
    try {
      // Test permissions
      const hasPermission = await localMusicService.requestPermissions();
      setDebugInfo(prev => prev + `\nPermissions: ${hasPermission ? 'GRANTED' : 'DENIED'}`);
      
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Please grant media library access in device settings');
        return;
      }
      
      // Test scanning
      const songs = await localMusicService.scanLocalMusic();
      setDebugInfo(prev => prev + `\nFound ${songs.length} songs`);
      
      if (songs.length > 0) {
        const firstSong = songs[0];
        setDebugInfo(prev => prev + `\nFirst song: ${firstSong.title}`);
        setDebugInfo(prev => prev + `\nURI: ${firstSong.url}`);
        
        // Test audio loading
        try {
          const result = await audioService.loadTrack(firstSong);
          setDebugInfo(prev => prev + `\nAudio load: ${result.success ? 'SUCCESS' : 'FAILED'}`);
          
          if (result.success) {
            const playResult = await audioService.play();
            setDebugInfo(prev => prev + `\nPlayback: ${playResult.success ? 'STARTED' : 'FAILED'}`);
            
            // Stop after 3 seconds
            setTimeout(async () => {
              await audioService.stop();
              setDebugInfo(prev => prev + `\nPlayback stopped`);
            }, 3000);
          }
        } catch (audioError) {
          setDebugInfo(prev => prev + `\nAudio error: ${audioError.message}`);
        }
      }
    } catch (error) {
      setDebugInfo(prev => prev + `\nError: ${error.message}`);
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
        {String(tab.count || 0)}
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
          
          {/* Debug button - remove in production */}
          <Button
            title="Debug Local Music"
            onPress={testLocalMusicDirect}
            style={[styles.createButton, {backgroundColor: colors.error, marginTop: 10}]}
            icon="bug"
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
        onRefresh={loadLocalMusicFiles}
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
  debugContainer: {
    backgroundColor: colors.backgroundSecondary,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  debugText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.error,
    borderRadius: 4,
  },
  clearButtonText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
});

export default LibraryScreen;