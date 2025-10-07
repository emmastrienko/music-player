// src/services/localMusicService.js
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { artworkStorageService } from './artworkStorageService';
import { defaultArtworkService } from './defaultArtworkService';

class LocalMusicService {
  // Check current permission status without requesting
  async checkPermissions() {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      console.log('Current permission status:', status);
      return status === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  // Get detailed permission info for debugging
  async getPermissionDetails() {
    try {
      const result = await MediaLibrary.getPermissionsAsync();
      console.log('📋 Detailed permission info:', {
        status: result.status,
        canAskAgain: result.canAskAgain,
        granted: result.granted,
        expires: result.expires
      });
      return result;
    } catch (error) {
      console.error('Error getting permission details:', error);
      return null;
    }
  }

  // Force permission request - ignores current state
  async forceRequestPermissions() {
    try {
      console.log('🔄 Force requesting permissions...');
      
      // Get current state for logging
      const before = await MediaLibrary.getPermissionsAsync();
      console.log('State before force request:', before);
      
      // Force request regardless of current state
      const result = await MediaLibrary.requestPermissionsAsync(false);
      console.log('Force request result:', result);
      
      if (result.status !== 'granted' && result.canAskAgain !== false) {
        console.log('🔄 Trying with write permissions...');
        const writeResult = await MediaLibrary.requestPermissionsAsync(true);
        console.log('Write permission force result:', writeResult);
        return writeResult.status === 'granted';
      }
      
      return result.status === 'granted';
    } catch (error) {
      console.error('Error in force request:', error);
      return false;
    }
  }

  // Request permissions for media library
  async requestPermissions() {
    try {
      console.log('🔍 Checking media library permissions...');
      
      // Check current status first
      const currentStatus = await MediaLibrary.getPermissionsAsync();
      console.log('Current permission details:', {
        status: currentStatus.status,
        canAskAgain: currentStatus.canAskAgain,
        granted: currentStatus.granted
      });
      
      if (currentStatus.status === 'granted') {
        console.log('✅ Media library permissions already granted');
        return true;
      }

      // If status is undetermined, we should be able to ask
      if (currentStatus.status === 'undetermined' || currentStatus.canAskAgain !== false) {
        console.log('📋 Requesting media library permissions...');
        
        // Try requesting with read-only first (less intrusive)
        let result = await MediaLibrary.requestPermissionsAsync(false);
        console.log('Read permission result:', result);
        
        if (result.status === 'granted') {
          console.log('✅ Media library permissions granted (read-only)');
          return true;
        }
        
        // If read-only failed but we can still ask, try with write permissions
        if (result.canAskAgain !== false) {
          console.log('📋 Trying with write permissions...');
          result = await MediaLibrary.requestPermissionsAsync(true);
          console.log('Write permission result:', result);
          
          if (result.status === 'granted') {
            console.log('✅ Media library permissions granted (read-write)');
            return true;
          }
        }
        
        console.warn('❌ Media library permissions denied:', result.status);
        if (result.canAskAgain === false) {
          console.warn('❌ Permission permanently denied - user must enable manually');
        }
        return false;
      } else {
        console.warn('❌ Permission permanently denied - cannot ask again');
        console.log('User must manually enable permission in device settings');
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
              artwork: null, // Will be populated below with custom artwork
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
      
      // Load custom artwork for all songs
      if (validSongs.length > 0) {
        const songIds = validSongs.map(song => song.id);
        const customArtwork = await artworkStorageService.getBulkArtwork(songIds);
        
        // Apply custom artwork to songs and generate default artwork
        validSongs.forEach(song => {
          if (customArtwork[song.id]) {
            song.artwork = customArtwork[song.id];
          }
          // Always add default artwork data for fallback
          song.defaultArtwork = defaultArtworkService.generateGradientForSongInfo(
            song.title, 
            song.artist, 
            song.id
          );
        });
        
        console.log(`Loaded custom artwork for ${Object.keys(customArtwork).length} songs`);
      }
      
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

  // Custom artwork management methods
  async setCustomArtwork(songId, imageUri) {
    try {
      const artworkUri = await artworkStorageService.saveArtwork(songId, imageUri);
      console.log(`Set custom artwork for song ${songId}: ${artworkUri}`);
      return artworkUri;
    } catch (error) {
      console.error('Error setting custom artwork:', error);
      throw error;
    }
  }

  async getCustomArtwork(songId) {
    try {
      return await artworkStorageService.getArtwork(songId);
    } catch (error) {
      console.error('Error getting custom artwork:', error);
      return null;
    }
  }

  async removeCustomArtwork(songId) {
    try {
      await artworkStorageService.removeArtwork(songId);
      console.log(`Removed custom artwork for song ${songId}`);
    } catch (error) {
      console.error('Error removing custom artwork:', error);
      throw error;
    }
  }

  async getArtworkStorageStats() {
    try {
      return await artworkStorageService.getStorageStats();
    } catch (error) {
      console.error('Error getting artwork storage stats:', error);
      return { songCount: 0, totalSize: 0, totalSizeMB: '0.00' };
    }
  }

  // Get a single local song by ID (useful for refreshing after artwork change)
  async getLocalSongById(songId) {
    try {
      const songs = await this.scanLocalMusic();
      return songs.find(song => song.id === songId) || null;
    } catch (error) {
      console.error('Error getting local song by ID:', error);
      return null;
    }
  }
}

export const localMusicService = new LocalMusicService();
