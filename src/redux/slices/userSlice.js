// src/redux/slices/userSlice.js
import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  profile: {
    name: 'Music Lover',
    avatar: null,
    premium: false,
  },
  preferences: {
    theme: 'dark',
    audioQuality: 'high',
    autoplay: true,
    downloadOnWifi: true,
    notifications: true,
  },
  stats: {
    totalListeningTime: 0,
    songsPlayed: 0,
    favoriteGenre: '',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      state.profile = {...state.profile, ...action.payload};
    },
    updatePreferences: (state, action) => {
      state.preferences = {...state.preferences, ...action.payload};
    },
    updateStats: (state, action) => {
      state.stats = {...state.stats, ...action.payload};
    },
    incrementSongsPlayed: (state) => {
      state.stats.songsPlayed += 1;
    },
    addListeningTime: (state, action) => {
      state.stats.totalListeningTime += action.payload;
    },
  },
});

export const {
  updateProfile,
  updatePreferences,
  updateStats,
  incrementSongsPlayed,
  addListeningTime,
} = userSlice.actions;

export default userSlice.reducer;