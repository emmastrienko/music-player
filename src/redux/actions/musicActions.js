// src/redux/actions/musicActions.js
import {createAsyncThunk} from '@reduxjs/toolkit';
import {musicService} from '../../services/musicService';

export const fetchPopularSongs = createAsyncThunk(
  'music/fetchPopularSongs',
  async (_, {rejectWithValue}) => {
    try {
      const response = await musicService.getPopularSongs();
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
  async (artistId, {rejectWithValue}) => {
    try {
      const response = await musicService.getArtistSongs(artistId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch artist songs');
    }
  },
);