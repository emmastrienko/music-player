// src/redux/slices/playerSlice.js
import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: false,
  isPaused: false,
  duration: 0,
  position: 0,
  volume: 1,
  repeatMode: 'off', // off, track, queue
  shuffleMode: false,
  queue: [],
  currentIndex: 0,
  loading: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
      state.isPaused = !action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setPosition: (state, action) => {
      state.position = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setRepeatMode: (state, action) => {
      state.repeatMode = action.payload;
    },
    setShuffleMode: (state, action) => {
      state.shuffleMode = action.payload;
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
    },
    addToQueue: (state, action) => {
      state.queue.push(action.payload);
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter((_, index) => index !== action.payload);
    },
    setCurrentIndex: (state, action) => {
      state.currentIndex = action.payload;
    },
    nextTrack: (state) => {
      if (state.currentIndex < state.queue.length - 1) {
        state.currentIndex += 1;
        state.currentTrack = state.queue[state.currentIndex];
      } else if (state.repeatMode === 'queue') {
        state.currentIndex = 0;
        state.currentTrack = state.queue[0];
      }
    },
    previousTrack: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.currentTrack = state.queue[state.currentIndex];
      } else if (state.repeatMode === 'queue') {
        state.currentIndex = state.queue.length - 1;
        state.currentTrack = state.queue[state.currentIndex];
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetPlayer: (state) => {
      return initialState;
    },
    updateSongInQueue: (state, action) => {
      const updatedSong = action.payload;
      // Update song in queue if it exists
      const queueIndex = state.queue.findIndex(song => song.id === updatedSong.id);
      if (queueIndex !== -1) {
        state.queue[queueIndex] = updatedSong;
      }
      // Update current track if it's the same song
      if (state.currentTrack?.id === updatedSong.id) {
        state.currentTrack = updatedSong;
      }
    },
  },
});

export const {
  setCurrentTrack,
  setIsPlaying,
  setDuration,
  setPosition,
  setVolume,
  setRepeatMode,
  setShuffleMode,
  setQueue,
  addToQueue,
  removeFromQueue,
  setCurrentIndex,
  nextTrack,
  previousTrack,
  setLoading,
  resetPlayer,
  updateSongInQueue,
} = playerSlice.actions;

export default playerSlice.reducer;