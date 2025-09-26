// src/screens/tabs/EnhancedHomeScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { fetchPopularSongs } from '../../redux/actions/musicActions';
import SongCard from '../../components/music/SongCard';
import AlbumCard from '../../components/music/AlbumCard';
import Loading from '../../components/common/Loading';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { modernDesign } from '../../styles/modernDesign';

const EnhancedHomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    popularSongs,
    recentlyPlayed,
    favorites,
    loading,
  } = useSelector(state => state.music);
  const { profile } = useSelector(state => state.user);
  const { currentTrack, isPlaying } = useSelector(state => state.player);

  useEffect(() => {
    if (popularSongs.length === 0) {
      dispatch(fetchPopularSongs());
    }
  }, [dispatch, popularSongs.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchPopularSongs());
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { icon: 'heart', label: 'Liked Songs', count: favorites.length },
          { icon: 'time', label: 'Recently Played', count: recentlyPlayed.length },
          { icon: 'shuffle', label: 'Shuffle Play', action: 'shuffle' },
          { icon: 'radio', label: 'Radio', action: 'radio' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.quickActionCard}>
            <LinearGradient
              colors={modernDesign.gradients.card}
              style={styles.quickActionGradient}
            >
              <BlurView intensity={20} style={styles.quickActionBlur}>
                <View style={styles.quickActionContent}>
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.primary }]}>
                    <Ionicons name={item.icon} size={20} color={colors.textPrimary} />
                  </View>
                  <Text style={styles.quickActionLabel}>{item.label}</Text>
                  {item.count !== undefined && (
                    <Text style={styles.quickActionCount}>{item.count}</Text>
                  )}
                </View>
              </BlurView>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedSection = () => {
    const featuredTrack = currentTrack || popularSongs[0];
    if (!featuredTrack) return null;

    return (
      <View style={styles.featuredSection}>
        <ImageBackground
          source={{ uri: featuredTrack.artwork || 'https://via.placeholder.com/400x200' }}
          style={styles.featuredBackground}
          imageStyle={styles.featuredBackgroundImage}
        >
          <LinearGradient
            colors={modernDesign.gradients.overlay}
            style={styles.featuredOverlay}
          >
            <BlurView intensity={40} style={styles.featuredBlur}>
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>NOW PLAYING</Text>
                </View>
                
                <Text style={styles.featuredTitle} numberOfLines={2}>
                  {featuredTrack.title || 'Unknown Title'}
                </Text>
                
                <Text style={styles.featuredArtist} numberOfLines={1}>
                  {featuredTrack.artist || 'Unknown Artist'}
                </Text>

                <View style={styles.featuredControls}>
                  <TouchableOpacity style={styles.featuredPlayButton}>
                    <LinearGradient
                      colors={modernDesign.gradients.button}
                      style={styles.featuredPlayGradient}
                    >
                      <Ionicons 
                        name={isPlaying ? 'pause' : 'play'} 
                        size={24} 
                        color={colors.textPrimary} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.featuredActionButton}>
                    <Ionicons name="heart-outline" size={20} color={colors.textPrimary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.featuredActionButton}>
                    <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  };

  const renderSectionHeader = (title, onSeeAll) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEnhancedSongItem = ({ item, index }) => (
    <View style={styles.songItemContainer}>
      <TouchableOpacity style={styles.enhancedSongCard}>
        <LinearGradient
          colors={modernDesign.gradients.card}
          style={styles.songCardGradient}
        >
          <View style={styles.songCardContent}>
            <View style={styles.songIndex}>
              <Text style={styles.songIndexText}>{index + 1}</Text>
            </View>
            
            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {item.title || 'Unknown Title'}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {item.artist || 'Unknown Artist'}
              </Text>
            </View>

            <View style={styles.songActions}>
              <TouchableOpacity style={styles.songActionButton}>
                <Ionicons name="heart-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.songActionButton}>
                <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderSection = (title, data, renderItem, onSeeAll, horizontal = true) => (
    <View style={styles.section}>
      {renderSectionHeader(title, onSeeAll)}
      {horizontal ? (
        <FlatList
          data={data.slice(0, 10)}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      ) : (
        <View style={styles.verticalList}>
          {data.slice(0, 5).map((item, index) => renderItem({ item, index }))}
        </View>
      )}
    </View>
  );

  // Parallax header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  if (loading && popularSongs.length === 0) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Animated Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }
      ]}>
        <LinearGradient
          colors={modernDesign.gradients.aurora}
          style={styles.headerGradient}
        >
          <BlurView intensity={30} style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>{profile?.name || 'Music Lover'}</Text>
              </View>
              
              <TouchableOpacity style={styles.profileButton}>
                <LinearGradient
                  colors={modernDesign.gradients.button}
                  style={styles.profileGradient}
                >
                  <Ionicons name="person" size={20} color={colors.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.content}>
          {renderQuickActions()}
          {renderFeaturedSection()}
          
          {renderSection(
            'Trending Now',
            popularSongs,
            ({ item }) => <SongCard key={item.id} song={item} />,
            () => navigation.navigate('Search')
          )}
          
          {renderSection(
            'Recently Played',
            recentlyPlayed,
            ({ item }) => <SongCard key={item.id} song={item} />,
            () => navigation.navigate('Library')
          )}
          
          {renderSection(
            'Top Charts',
            popularSongs,
            renderEnhancedSongItem,
            () => navigation.navigate('Search'),
            false
          )}
          
          {renderSection(
            'Recommended Albums',
            [],
            ({ item }) => <AlbumCard key={item.id} album={item} />,
            () => navigation.navigate('Search')
          )}

          {/* Bottom spacing for mini player */}
          <View style={styles.bottomSpacing} />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 50,
  },
  
  headerGradient: {
    borderBottomLeftRadius: modernDesign.layout.borderRadius.large,
    borderBottomRightRadius: modernDesign.layout.borderRadius.large,
  },
  
  headerBlur: {
    borderBottomLeftRadius: modernDesign.layout.borderRadius.large,
    borderBottomRightRadius: modernDesign.layout.borderRadius.large,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  greeting: {
    ...typography.styles.bodyLarge,
    color: colors.textSecondary,
  },
  
  userName: {
    ...typography.styles.headingLarge,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 4,
  },
  
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    ...modernDesign.shadows.glow,
  },
  
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    paddingTop: 120, // Space for header
  },
  
  quickActionsContainer: {
    marginVertical: 20,
  },
  
  quickActionCard: {
    width: 120,
    height: 80,
    marginHorizontal: 8,
    borderRadius: modernDesign.layout.borderRadius.medium,
    overflow: 'hidden',
    ...modernDesign.shadows.floating,
  },
  
  quickActionGradient: {
    flex: 1,
  },
  
  quickActionBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  quickActionContent: {
    alignItems: 'center',
    gap: 8,
  },
  
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  quickActionLabel: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  quickActionCount: {
    ...typography.styles.labelSmall,
    color: colors.textMuted,
  },
  
  featuredSection: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: modernDesign.layout.borderRadius.large,
    overflow: 'hidden',
    ...modernDesign.shadows.floating,
  },
  
  featuredBackground: {
    height: 200,
  },
  
  featuredBackgroundImage: {
    borderRadius: modernDesign.layout.borderRadius.large,
  },
  
  featuredOverlay: {
    flex: 1,
  },
  
  featuredBlur: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  featuredContent: {
    padding: 20,
    gap: 12,
  },
  
  featuredBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: modernDesign.layout.borderRadius.small,
    alignSelf: 'flex-start',
  },
  
  featuredBadgeText: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  featuredTitle: {
    ...typography.styles.headingLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  featuredArtist: {
    ...typography.styles.bodyLarge,
    color: colors.textSecondary,
  },
  
  featuredControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  
  featuredPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    ...modernDesign.shadows.glow,
  },
  
  featuredPlayGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  featuredActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  section: {
    marginVertical: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  
  sectionTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  seeAllText: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  
  horizontalList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  
  verticalList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  
  songItemContainer: {
    marginVertical: 4,
  },
  
  enhancedSongCard: {
    borderRadius: modernDesign.layout.borderRadius.medium,
    overflow: 'hidden',
    ...modernDesign.shadows.floating,
  },
  
  songCardGradient: {
    padding: 16,
  },
  
  songCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  
  songIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  songIndexText: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  songInfo: {
    flex: 1,
  },
  
  songTitle: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  songArtist: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
  },
  
  songActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  songActionButton: {
    padding: 8,
  },
  
  bottomSpacing: {
    height: 160, // Space for mini player + tab bar
  },
});

export default EnhancedHomeScreen;