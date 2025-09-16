// src/screens/tabs/HomeScreen.js
import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {fetchPopularSongs} from '../../redux/actions/musicActions';
import SongCard from '../../components/music/SongCard';
import AlbumCard from '../../components/music/AlbumCard';
import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {globalStyles} from '../../styles/globalStyles';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const {
    popularSongs,
    recentlyPlayed,
    favorites,
    loading,
  } = useSelector(state => state.music);
  const {profile} = useSelector(state => state.user);

  useEffect(() => {
    if (popularSongs.length === 0) {
      dispatch(fetchPopularSongs());
    }
  }, [dispatch, popularSongs.length]);

  const handleRefresh = () => {
    dispatch(fetchPopularSongs());
  };

  const renderGreeting = () => {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    return (
      <Text style={styles.greeting}>
        {greeting}, {profile.name}!
      </Text>
    );
  };

  const renderSection = (title, data, renderItem, onSeeAll) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  if (loading && popularSongs.length === 0) {
    return <Loading />;
  }

  return (
    <View style={globalStyles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.background]}
        style={styles.gradientHeader}>
        <Header title="Home" showProfile />
        {renderGreeting()}
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }>
        
        {/* Quick Access */}
        <View style={styles.quickAccess}>
          <TouchableOpacity
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate('Library')}>
            <Text style={styles.quickAccessText}>Liked Songs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate('Library')}>
            <Text style={styles.quickAccessText}>Recently Played</Text>
          </TouchableOpacity>
        </View>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 &&
          renderSection(
            'Recently Played',
            recentlyPlayed.slice(0, 10),
            ({item}) => <SongCard song={item} />,
          )}

        {/* Popular Songs */}
        {renderSection(
          'Popular Right Now',
          popularSongs.slice(0, 10),
          ({item}) => <SongCard song={item} />,
          () => navigation.navigate('Search'),
        )}

        {/* Your Favorites */}
        {favorites.length > 0 &&
          renderSection(
            'Your Favorites',
            favorites.slice(0, 10),
            ({item}) => <SongCard song={item} />,
            () => navigation.navigate('Library'),
          )}

        {/* Recommended Albums */}
        {renderSection(
          'Recommended Albums',
          popularSongs.slice(0, 8).map((song, index) => ({
            id: `album_${index}`,
            name: song.album || 'Unknown Album',
            artist: song.artist,
            artwork: song.artwork,
            songs: [song],
          })),
          ({item}) => <AlbumCard album={item} />,
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  greeting: {
    ...typography.styles.headingLarge,
    color: colors.textPrimary,
    marginHorizontal: 20,
    marginTop: 20,
  },
  content: {
    flex: 1,
  },
  quickAccess: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  quickAccessItem: {
    flex: 1,
    backgroundColor: colors.backgroundTertiary,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAccessText: {
    ...typography.styles.labelMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  seeAllText: {
    ...typography.styles.labelMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen;