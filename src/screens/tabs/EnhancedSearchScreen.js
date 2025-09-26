// src/screens/tabs/EnhancedSearchScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  setCurrentTrack,
  setQueue,
  setCurrentIndex,
  setIsPlaying,
} from '../../redux/slices/playerSlice';
import { addToRecentlyPlayed } from '../../redux/slices/musicSlice';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';

const EnhancedSearchScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, songs, albums, artists

  const { popularSongs } = useSelector(state => state.music);
  const { currentTrack, isPlaying } = useSelector(state => state.player);

  // Mock search function - replace with actual API call
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter from popular songs for demo
    const results = popularSongs.filter(song => 
      song.title?.toLowerCase().includes(query.toLowerCase()) ||
      song.artist?.toLowerCase().includes(query.toLowerCase()) ||
      song.album?.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(false);
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const handlePlaySong = (song) => {
    dispatch(setCurrentTrack(song));
    dispatch(setQueue([song]));
    dispatch(setCurrentIndex(0));
    dispatch(setIsPlaying(true));
    dispatch(addToRecentlyPlayed(song));
  };

  const renderSearchResult = ({ item, index }) => {
    const isCurrentSong = currentTrack?.id === item.id;
    
    return (
      <TouchableOpacity 
        style={[styles.resultItem, isCurrentSong && styles.currentSongItem]}
        onPress={() => handlePlaySong(item)}
      >
        <LinearGradient
          colors={isCurrentSong ? [colors.primary + '20', colors.background] : ['transparent', 'transparent']}
          style={styles.resultGradient}
        >
          {/* Album Artwork */}
          <View style={styles.artworkContainer}>
            <Image
              source={{
                uri: item.artwork || 'https://via.placeholder.com/60x60?text=♪'
              }}
              style={styles.resultArtwork}
              resizeMode="cover"
            />
            
            {/* Play Overlay - Always Visible */}
            <TouchableOpacity 
              style={styles.playOverlay}
              onPress={() => handlePlaySong(item)}
              activeOpacity={0.8}
            >
              <View style={styles.playButton}>
                <Ionicons
                  name={isCurrentSong && isPlaying ? 'pause' : 'play'}
                  size={16}
                  color={colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Song Info */}
          <View style={styles.songInfo}>
            <Text 
              style={[styles.songTitle, isCurrentSong && styles.currentSongTitle]} 
              numberOfLines={1}
            >
              {item.title || 'Unknown Title'}
            </Text>
            <Text 
              style={[styles.songArtist, isCurrentSong && styles.currentSongArtist]} 
              numberOfLines={1}
            >
              {item.artist || 'Unknown Artist'}
            </Text>
            {item.album && (
              <Text style={styles.songAlbum} numberOfLines={1}>
                {item.album}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.songActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderTabButton = (tab, label) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={80} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No results found' : 'Search for music'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `Try searching for something else` 
          : 'Find your favorite songs, artists, and albums'
        }
      </Text>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Search</Text>
      <View style={styles.quickActionButtons}>
        {['Pop', 'Rock', 'Jazz', 'Classical', 'Hip Hop', 'Electronic'].map((genre) => (
          <TouchableOpacity
            key={genre}
            style={styles.quickActionButton}
            onPress={() => setSearchQuery(genre)}
          >
            <Text style={styles.quickActionText}>{genre}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[globalStyles.container, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists, albums..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      {searchQuery.length > 0 && (
        <View style={styles.tabContainer}>
          {renderTabButton('all', 'All')}
          {renderTabButton('songs', 'Songs')}
          {renderTabButton('albums', 'Albums')}
          {renderTabButton('artists', 'Artists')}
        </View>
      )}

      {/* Content */}
      {searchQuery.length === 0 ? (
        <View style={styles.content}>
          {renderQuickActions()}
          {renderEmptyState()}
        </View>
      ) : (
        <View style={styles.content}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              ListEmptyComponent={renderEmptyState}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  headerTitle: {
    ...typography.styles.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  
  searchInput: {
    flex: 1,
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    padding: 0,
  },
  
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  
  activeTab: {
    backgroundColor: colors.primary,
  },
  
  tabText: {
    ...typography.styles.labelMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  activeTabText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  content: {
    flex: 1,
  },
  
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  
  sectionTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
  },
  
  quickActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  quickActionButton: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  quickActionText: {
    ...typography.styles.labelMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  emptyTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  
  loadingText: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
  },
  
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  
  resultItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  currentSongItem: {
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  
  resultGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  
  artworkContainer: {
    position: 'relative',
    marginRight: 12,
  },
  
  resultArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  
  playOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  playButton: {
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  songInfo: {
    flex: 1,
    gap: 4,
  },
  
  songTitle: {
    ...typography.styles.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  currentSongTitle: {
    color: colors.primary,
  },
  
  songArtist: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
  },
  
  currentSongArtist: {
    color: colors.primary + 'CC',
  },
  
  songAlbum: {
    ...typography.styles.bodySmall,
    color: colors.textMuted,
  },
  
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  actionButton: {
    padding: 8,
  },
});

export default EnhancedSearchScreen;