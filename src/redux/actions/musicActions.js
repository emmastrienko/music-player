// src/redux/actions/musicActions.js
import {createAsyncThunk} from '@reduxjs/toolkit';
import {musicService} from '../../services/musicService';

export const fetchPopularSongs = createAsyncThunk(
  'music/fetchPopularSongs',
  async (_, {rejectWithValue}) => {
    try {
      // Try trending songs first (more reliable), fallback to search
      let response = await musicService.getTrendingSongs();
      if (!response.data || response.data.length === 0) {
        console.log('No trending songs found, trying search API');
        response = await musicService.getPopularSongs();
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular songs');
    }
  },
);

export const searchSongs = createAsyncThunk(
  'music/searchSongs',
  async (query, {rejectWithValue}) => {
    try {
      const response = await musicService.searchSongs(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search songs');
    }
  },
);

export const fetchSongsByGenre = createAsyncThunk(
  'music/fetchSongsByGenre',
  async (genre, {rejectWithValue}) => {
    try {
      const response = await musicService.getSongsByGenre(genre);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch songs by genre');
    }
  },
);

export const fetchArtistSongs = createAsyncThunk(
  'music/fetchArtistSongs',
  async (artistName, {rejectWithValue}) => {
    try {
      const response = await musicService.getArtistSongs(artistName);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch artist songs');
    }
  },
);

// Add action for loading local music
export const loadLocalMusic = createAsyncThunk(
  'music/loadLocalMusic',
  async (_, {rejectWithValue}) => {
    try {
      const {localMusicService} = await import('../../services/localMusicService');
      const localSongs = await localMusicService.scanLocalMusic();
      return localSongs;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load local music');
    }
  },
);