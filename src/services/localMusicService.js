// src/services/localMusicService.js
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

class LocalMusicService {
  // Request permissions for media library
  async requestPermissions() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  // Scan local music (mock for now)
  async scanLocalMusic() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Permission not granted for media library');
        return [];
      }

      // Replace this with real MediaLibrary API calls if needed
      return this.getMockLocalSongs();
    } catch (error) {
      console.error('Error scanning local music:', error);
      return [];
    }
  }

  getMockLocalSongs() {
    return [
      {
        id: 'local_1',
        title: 'My Song 1',
        artist: 'Local Artist',
        album: 'Local Album',
        duration: 240,
        artwork: null,
        url: 'file://path/to/song1.mp3',
        isLocal: true,
        isFavorite: false,
      },
      {
        id: 'local_2',
        title: 'My Song 2',
        artist: 'Another Artist',
        album: 'Another Album',
        duration: 180,
        artwork: null,
        url: 'file://path/to/song2.mp3',
        isLocal: true,
        isFavorite: false,
      },
    ];
  }

  async getLocalPlaylists() {
    return [
      {
        id: 'local_playlist_1',
        name: 'My Playlist',
        songs: this.getMockLocalSongs(),
        isLocal: true,
      },
    ];
  }
}

export const localMusicService = new LocalMusicService();
