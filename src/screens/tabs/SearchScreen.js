// src/screens/tabs/SearchScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {searchSongs} from '../../redux/actions/musicActions';
import {setSearchQuery, clearSearchResults} from '../../redux/slices/musicSlice';
import SearchBar from '../../components/common/SearchBar';
import SongCard from '../../components/music/SongCard';
import Loading from '../../components/common/Loading';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {globalStyles} from '../../styles/globalStyles';

const SearchScreen = () => {
  const dispatch = useDispatch();
  const {searchResults, searchLoading, searchQuery, popularSongs} = useSelector(
    state => state.music,
  );

  const [searchText, setSearchText] = useState(searchQuery);
  const [genres] = useState([
    'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B'
  ]);

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim().length > 2) {
      dispatch(setSearchQuery(text));
      dispatch(searchSongs(text));
    } else {
      dispatch(clearSearchResults());
    }
  };

  const handleGenrePress = (genre) => {
    dispatch(searchSongs(genre));
    dispatch(setSearchQuery(genre));
    setSearchText(genre);
  };

  const renderGenreItem = ({item}) => (
    <TouchableOpacity
      style={styles.genreItem}
      onPress={() => handleGenrePress(item)}>
      <Text style={styles.genreText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSongItem = ({item, index}) => (
    <View style={styles.songItem}>
      <SongCard song={item} showArtwork={false} index={index} />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {searchQuery ? (
        <Text style={styles.emptyText}>
          No results found for "{searchQuery}"
        </Text>
      ) : (
        <View>
          <Text style={styles.browseTitle}>Browse by Genre</Text>
          <FlatList
            data={genres}
            renderItem={renderGenreItem}
            keyExtractor={item => item}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.genreGrid}
          />
          
          <Text style={styles.browseTitle}>Popular Songs</Text>
          <FlatList
            data={popularSongs.slice(0, 10)}
            renderItem={renderSongItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.songsList}
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <SearchBar
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Artists, songs, or albums"
        />
      </View>

      {searchLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSongItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    ...typography.styles.headingLarge,
    color: colors.textPrimary,
    marginBottom: 16,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexGrow: 1,
  },
  songItem: {
    marginBottom: 12,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 20,
  },
  emptyText: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  browseTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    marginBottom: 16,
    marginTop: 20,
    fontWeight: '600',
  },
  genreGrid: {
    marginBottom: 20,
  },
  genreItem: {
    flex: 1,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  genreText: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
  songsList: {
    paddingBottom: 100,
  },
});

export default SearchScreen;