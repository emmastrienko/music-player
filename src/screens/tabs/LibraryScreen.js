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
import * as MediaLibrary from 'expo-media-library';
import {setLocalSongs, createPlaylist} from '../../redux/slices/musicSlice';
import {loadLocalMusic} from '../../redux/actions/musicActions';
import EnhancedSongCard from '../../components/music/EnhancedSongCard';
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
  const [permissionStatus, setPermissionStatus] = useState('unknown'); // 'granted', 'denied', 'unknown'
  const [showPermissionCard, setShowPermissionCard] = useState(false);

  useEffect(() => {
    checkPermissionsAndLoad();
  }, []);

  // Add focus listener to re-check permissions when returning from settings
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('📱 Screen focused, re-checking permissions...');
      checkPermissionsAndLoad();
    });

    return unsubscribe;
  }, [navigation]);

  const checkPermissionsAndLoad = async () => {
    try {
      console.log('🔍 Checking permissions and loading...');
      // Check permission status first without requesting
      const hasPermission = await localMusicService.checkPermissions();
      console.log('Permission check result:', hasPermission);
      
      setPermissionStatus(hasPermission ? 'granted' : 'denied');
      
      if (hasPermission) {
        console.log('✅ Permissions granted, hiding permission card and loading music');
        setShowPermissionCard(false);
        await loadLocalMusicFiles();
      } else {
        console.log('❌ Permissions not granted, showing permission card');
        setShowPermissionCard(true);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionStatus('denied');
      setShowPermissionCard(true);
    }
  };

  const requestPermissionAndLoad = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Requesting permissions...');
      // First check current status to see if we can ask
      const currentStatus = await MediaLibrary.getPermissionsAsync();
      console.log('Permission check before request:', currentStatus);
      
      let hasPermission = await localMusicService.requestPermissions();
      
      // If normal request failed, try force request
      if (!hasPermission) {
        console.log('Normal request failed, trying force request...');
        hasPermission = await localMusicService.forceRequestPermissions();
      }
      
      // Double-check permission status after request
      const finalStatus = await localMusicService.checkPermissions();
      console.log('Final permission check after request:', finalStatus);
      
      setPermissionStatus(finalStatus ? 'granted' : 'denied');
      
      if (finalStatus) {
        console.log('✅ Permissions successfully granted, loading music...');
        setShowPermissionCard(false);
        await loadLocalMusicFiles();
      } else {
        console.log('❌ Permissions still not granted');
        setShowPermissionCard(true);
        
        // Check if permission was permanently denied
        const newStatus = await MediaLibrary.getPermissionsAsync();
        console.log('Permission status after denial:', newStatus);
        
        if (newStatus.canAskAgain === false) {
          Alert.alert(
            'Permission Required',
            'To access your music files, please:\n\n1. Go to device Settings\n2. Find this app\n3. Enable Media/Storage permissions\n4. Return to the app',
            [
              {text: 'OK', style: 'default'},
            ]
          );
        } else if (newStatus.status === 'denied') {
          // Permission denied but can ask again
          console.log('Permission denied but can ask again');
          Alert.alert(
            'Permission Required',
            'Media access is needed to play local music. Please allow access when prompted.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Try Again', onPress: requestPermissionAndLoad},
            ]
          );
        } else {
          // Unexpected state
          console.warn('Unexpected permission state:', newStatus);
          Alert.alert(
            'Permission Issue',
            'Unable to request media access. Please check your device settings.',
            [
              {text: 'OK', style: 'default'},
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setPermissionStatus('denied');
      setShowPermissionCard(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalMusicFiles = async () => {
    setIsLoading(true);
    try {
      console.log('🎵 Starting local music load...');
      
      // Verify permissions one more time before loading
      const hasPermission = await localMusicService.checkPermissions();
      if (!hasPermission) {
        console.log('❌ No permission during music load, showing permission card');
        setShowPermissionCard(true);
        setPermissionStatus('denied');
        return;
      }
      
      const result = await dispatch(loadLocalMusic()).unwrap();
      console.log('✅ Local music loaded successfully:', {
        count: result?.length || 0,
        firstSong: result?.[0] ? {
          title: result[0].title,
          url: result[0].url,
          isLocal: result[0].isLocal
        } : null
      });
      
      // Successfully loaded music, ensure permission card is hidden
      setShowPermissionCard(false);
      setPermissionStatus('granted');
      
    } catch (error) {
      console.error('❌ Error loading local music:', error);
      
      // Determine the type of error and show appropriate message
      let title = 'Error Loading Local Music';
      let message = 'Unable to load local music files.';
      
      if (error.message && error.message.includes('permission')) {
        title = 'Permission Required';
        message = 'Media library access was denied. Please grant permission to access local music.';
        setShowPermissionCard(true);
        setPermissionStatus('denied');
      } else if (error.message && error.message.includes('No audio files found')) {
        title = 'No Music Found';
        message = 'No audio files were found on your device. Please add some music files and try again.';
        // Don't show permission card for this error - it's not a permission issue
      } else {
        message = `Error: ${error.message || 'Unknown error occurred'}`;
      }
      
      // Show user-friendly error message
      Alert.alert(
        title,
        message,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Try Again', onPress: checkPermissionsAndLoad},
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

  const testForcePermission = async () => {
    try {
      console.log('=== FORCE PERMISSION TEST ===');
      const result = await localMusicService.forceRequestPermissions();
      console.log('Force permission result:', result);
      
      if (result) {
        setPermissionStatus('granted');
        setShowPermissionCard(false);
        Alert.alert('Success!', 'Permission granted! Loading local music...');
        await loadLocalMusicFiles();
      } else {
        Alert.alert('Permission Denied', 'Unable to get media access permission.');
      }
    } catch (error) {
      console.error('Force permission test error:', error);
      Alert.alert('Error', `Permission test failed: ${error.message}`);
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
      <EnhancedSongCard 
        song={item} 
        variant="compact" 
        showArtwork={true} 
      />
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

  const renderPermissionCard = () => {
    if (!showPermissionCard) return null;

    return (
      <View style={styles.permissionCard}>
        <View style={styles.permissionIconContainer}>
          <Ionicons name="musical-notes" size={48} color={colors.primary} />
        </View>
        <Text style={styles.permissionTitle}>Allow Media Access</Text>
        <Text style={styles.permissionDescription}>
          Grant permission to access and play music files stored on your device.
        </Text>
        <View style={styles.permissionButtons}>
          <Button
            title="Allow Media Access"
            onPress={requestPermissionAndLoad}
            style={styles.permissionButton}
            icon="checkmark-circle"
            loading={isLoading}
          />
          <Button
            title="Refresh Status"
            onPress={checkPermissionsAndLoad}
            style={[styles.permissionButton, {backgroundColor: colors.secondary, marginTop: 10}]}
            icon="refresh"
            loading={isLoading}
          />
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => setShowPermissionCard(false)}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    const data = getCurrentData();

    // Show permission card for local tab when permissions are needed
    if ((selectedTab === 'local' || selectedTab === 'all') && showPermissionCard) {
      return renderPermissionCard();
    }

    if (selectedTab === 'playlists') {
      return (
        <View style={styles.playlistsContainer}>
          <Button
            title="Create Playlist"
            onPress={handleCreatePlaylist}
            style={styles.createButton}
            icon="add"
          />
          
          {/* Debug buttons - remove in production */}
          <Button
            title="Debug Local Music"
            onPress={testLocalMusicDirect}
            style={[styles.createButton, {backgroundColor: colors.error, marginTop: 10}]}
            icon="bug"
          />
          <Button
            title="Force Permission Request"
            onPress={testForcePermission}
            style={[styles.createButton, {backgroundColor: colors.primary, marginTop: 10}]}
            icon="lock-open"
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

    // Show empty state for local songs when no permission
    if (selectedTab === 'local' && localSongs.length === 0 && permissionStatus === 'denied') {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyStateTitle}>No Local Music</Text>
          <Text style={styles.emptyStateDescription}>
            Permission required to access music files on your device.
          </Text>
          <Button
            title="Request Permission"
            onPress={requestPermissionAndLoad}
            style={styles.retryButton}
            icon="refresh"
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
        onRefresh={checkPermissionsAndLoad}
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
    backgroundColor: 'transparent',
    marginBottom: 12,
    marginHorizontal: 4,
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
  permissionCard: {
    backgroundColor: colors.backgroundSecondary,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionIconContainer: {
    backgroundColor: colors.primary + '20',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionDescription: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButtons: {
    width: '100%',
  },
  permissionButton: {
    marginBottom: 12,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    ...typography.styles.labelMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 160,
  },
});

export default LibraryScreen;