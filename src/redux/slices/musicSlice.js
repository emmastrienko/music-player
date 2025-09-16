// src/redux/slices/musicSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fetchPopularSongs, searchSongs} from '../actions/musicActions';

const initialState = {
  localSongs: [],
  onlineSongs: [],
  popularSongs: [],
  searchResults: [],
  playlists: [],
  favorites: [],
  recentlyPlayed: [],
  loading: false,
  error: null,
  searchLoading: false,
  searchQuery: '',
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setLocalSongs: (state, action) => {
      state.localSongs = action.payload;
    },
    addToFavorites: (state, action) => {
      const exists = state.favorites.find(song => song.id === action.payload.id);
      if (!exists) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action) => {
      state.favorites = state.favorites.filter(song => song.id !== action.payload);
    },
    addToRecentlyPlayed: (state, action) => {
      const exists = state.recentlyPlayed.find(song => song.id === action.payload.id);
      if (exists) {
        state.recentlyPlayed = state.recentlyPlayed.filter(song => song.id !== action.payload.id);
      }
      state.recentlyPlayed.unshift(action.payload);
      if (state.recentlyPlayed.length > 50) {
        state.recentlyPlayed = state.recentlyPlayed.slice(0, 50);
      }
    },
    createPlaylist: (state, action) => {
      const newPlaylist = {
        id: Date.now().toString(),
        name: action.payload.name,
        songs: [],
        createdAt: new Date().toISOString(),
      };
      state.playlists.push(newPlaylist);
    },
    addSongToPlaylist: (state, action) => {
      const {playlistId, song} = action.payload;
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist) {
        const exists = playlist.songs.find(s => s.id === song.id);
        if (!exists) {
          playlist.songs.push(song);
        }
      }
    },
    removeSongFromPlaylist: (state, action) => {
      const {playlistId, songId} = action.payload;
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist) {
        playlist.songs = playlist.songs.filter(song => song.id !== songId);
      }
    },
    deletePlaylist: (state, action) => {
      state.playlists = state.playlists.filter(p => p.id !== action.payload);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopularSongs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.popularSongs = action.payload;
        state.onlineSongs = [...state.onlineSongs, ...action.payload];
      })
      .addCase(fetchPopularSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchSongs.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchSongs.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchSongs.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setLocalSongs,
  addToFavorites,
  removeFromFavorites,
  addToRecentlyPlayed,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  setSearchQuery,
  clearSearchResults,
  setError,
  clearError,
} = musicSlice.actions;

export default musicSlice.reducer;