// src/services/localMusicService.js
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

class LocalMusicService {
  // Request permissions for media library
  async requestPermissions() {
    try {
      console.log('Requesting media library permissions...');
      
      // Request both read and write permissions for better compatibility
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      
      console.log('Permission request result:', status);
      
      if (status === 'granted') {
        console.log('✅ Media library permissions granted');
        return true;
      } else {
        console.warn('❌ Media library permissions denied:', status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return false;
    }
  }

  // Scan local music from device
  async scanLocalMusic() {
    try {
      console.log('=== LOCAL MUSIC SCAN START ===');
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('❌ Permission not granted for media library');
        throw new Error('Media library permission not granted');
      }

      console.log('✅ Permissions granted, scanning device for local music files...');
      
      // Get audio assets from device
      console.log('📱 Requesting audio assets from MediaLibrary...');
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 1000, // Limit to first 1000 songs to avoid performance issues
        sortBy: ['creationTime'],
      });
      
      console.log(`📊 MediaLibrary returned ${media.assets.length} audio assets`);
      
      if (media.assets.length === 0) {
        console.log('❌ No audio files found on device');
        throw new Error('No audio files found on device');
      }

      const localSongs = await Promise.all(
        media.assets.map(async (asset, index) => {
          try {
            // Get asset info including metadata
            const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
            
            // Determine the best URI to use for playback
            let playbackUri = assetInfo.localUri || assetInfo.uri || asset.uri;
            
            // Ensure we have a proper file:// URI for local files
            if (playbackUri && !playbackUri.startsWith('file://') && !playbackUri.startsWith('content://')) {
              if (playbackUri.startsWith('/')) {
                playbackUri = 'file://' + playbackUri;
              }
            }
            
            const songData = {
              id: `local_${asset.id}`,
              title: asset.filename.replace(/\.[^/.]+$/, '') || 'Unknown Title', // Remove file extension
              artist: assetInfo.artist || 'Unknown Artist',
              album: assetInfo.album || 'Unknown Album',
              duration: Math.floor(asset.duration) || 0,
              artwork: null, // Local files typically don't have artwork in MediaLibrary
              url: playbackUri,
              localUri: assetInfo.localUri,
              uri: assetInfo.uri || asset.uri,
              isLocal: true,
              isFavorite: false,
              fileSize: assetInfo.fileSize,
              creationTime: asset.creationTime,
              genre: assetInfo.genre || 'Unknown',
            };
            
            console.log(`Local song processed: ${songData.title}`, {
              hasUrl: !!songData.url,
              hasLocalUri: !!songData.localUri,
              hasUri: !!songData.uri,
              url: songData.url,
              urlType: songData.url ? (songData.url.startsWith('file://') ? 'file_url' : songData.url.startsWith('content://') ? 'content_url' : 'other') : 'none'
            });
            
            // Validate that we have a working URL
            if (!songData.url && !songData.localUri && !songData.uri) {
              console.warn(`No valid URL found for local song: ${songData.title}`);
              return null;
            }
            
            return songData;
          } catch (error) {
            console.warn(`Error processing local song ${asset.filename}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed songs
      const validSongs = localSongs.filter(song => song !== null);
      console.log(`Found ${validSongs.length} local music files`);
      
      return validSongs;
    } catch (error) {
      console.error('Error scanning local music:', error);
      // Return empty array instead of mock data on error
      return [];
    }
  }

  // Get albums from local songs
  async getLocalAlbums() {
    try {
      const songs = await this.scanLocalMusic();
      const albumMap = new Map();
      
      songs.forEach(song => {
        const albumKey = `${song.artist}_${song.album}`;
        if (!albumMap.has(albumKey)) {
          albumMap.set(albumKey, {
            id: `album_${albumKey}`,
            name: song.album,
            artist: song.artist,
            songs: [],
            artwork: null,
            isLocal: true,
          });
        }
        albumMap.get(albumKey).songs.push(song);
      });
      
      return Array.from(albumMap.values());
    } catch (error) {
      console.error('Error getting local albums:', error);
      return [];
    }
  }

  // Get artists from local songs
  async getLocalArtists() {
    try {
      const songs = await this.scanLocalMusic();
      const artistMap = new Map();
      
      songs.forEach(song => {
        if (!artistMap.has(song.artist)) {
          artistMap.set(song.artist, {
            id: `artist_${song.artist}`,
            name: song.artist,
            songs: [],
            albums: new Set(),
            isLocal: true,
          });
        }
        const artist = artistMap.get(song.artist);
        artist.songs.push(song);
        artist.albums.add(song.album);
      });
      
      // Convert albums Set to Array
      const artists = Array.from(artistMap.values());
      artists.forEach(artist => {
        artist.albums = Array.from(artist.albums);
      });
      
      return artists;
    } catch (error) {
      console.error('Error getting local artists:', error);
      return [];
    }
  }

  async getLocalPlaylists() {
    // Return empty array - playlists will be user-created
    // This could be extended to read .m3u or other playlist files from device
    return [];
  }
}

export const localMusicService = new LocalMusicService();
