// src/services/artworkStorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

class ArtworkStorageService {
  constructor() {
    this.ARTWORK_STORAGE_KEY = '@music_player_custom_artwork';
    this.ARTWORK_DIRECTORY = FileSystem.documentDirectory + 'artwork/';
    this.initializeDirectory();
  }

  // Initialize artwork directory
  async initializeDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.ARTWORK_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.ARTWORK_DIRECTORY, { intermediates: true });
        console.log('Created artwork directory');
      }
    } catch (error) {
      console.error('Error initializing artwork directory:', error);
    }
  }

  // Save custom artwork for a song
  async saveArtwork(songId, imageUri) {
    try {
      if (!imageUri || !songId) {
        throw new Error('Song ID and image URI are required');
      }

      // Generate filename for the artwork
      const filename = `artwork_${songId.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      const destinationUri = this.ARTWORK_DIRECTORY + filename;

      // Copy the image to our artwork directory
      await FileSystem.copyAsync({
        from: imageUri,
        to: destinationUri,
      });

      // Get existing artwork mappings
      const existingArtwork = await this.getAllArtwork();
      
      // Add/update the mapping
      existingArtwork[songId] = destinationUri;

      // Save updated mappings
      await AsyncStorage.setItem(
        this.ARTWORK_STORAGE_KEY,
        JSON.stringify(existingArtwork)
      );

      console.log(`Saved artwork for song ${songId}: ${destinationUri}`);
      return destinationUri;
    } catch (error) {
      console.error('Error saving artwork:', error);
      throw error;
    }
  }

  // Get artwork URI for a specific song
  async getArtwork(songId) {
    try {
      if (!songId) return null;

      const artworkMappings = await this.getAllArtwork();
      const artworkUri = artworkMappings[songId];

      if (!artworkUri) return null;

      // Check if file still exists
      const fileInfo = await FileSystem.getInfoAsync(artworkUri);
      if (!fileInfo.exists) {
        // File doesn't exist, remove from mappings
        await this.removeArtwork(songId);
        return null;
      }

      return artworkUri;
    } catch (error) {
      console.error('Error getting artwork:', error);
      return null;
    }
  }

  // Get all artwork mappings
  async getAllArtwork() {
    try {
      const artworkData = await AsyncStorage.getItem(this.ARTWORK_STORAGE_KEY);
      return artworkData ? JSON.parse(artworkData) : {};
    } catch (error) {
      console.error('Error getting all artwork:', error);
      return {};
    }
  }

  // Remove artwork for a specific song
  async removeArtwork(songId) {
    try {
      if (!songId) return;

      const artworkMappings = await this.getAllArtwork();
      const artworkUri = artworkMappings[songId];

      // Delete the file if it exists
      if (artworkUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(artworkUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(artworkUri);
          }
        } catch (fileError) {
          console.warn('Error deleting artwork file:', fileError);
        }
      }

      // Remove from mappings
      delete artworkMappings[songId];

      // Save updated mappings
      await AsyncStorage.setItem(
        this.ARTWORK_STORAGE_KEY,
        JSON.stringify(artworkMappings)
      );

      console.log(`Removed artwork for song ${songId}`);
    } catch (error) {
      console.error('Error removing artwork:', error);
    }
  }

  // Get artwork for multiple songs (bulk operation)
  async getBulkArtwork(songIds) {
    try {
      const artworkMappings = await this.getAllArtwork();
      const result = {};

      for (const songId of songIds) {
        const artworkUri = artworkMappings[songId];
        if (artworkUri) {
          // Check if file exists
          try {
            const fileInfo = await FileSystem.getInfoAsync(artworkUri);
            if (fileInfo.exists) {
              result[songId] = artworkUri;
            } else {
              // File doesn't exist, remove from mappings
              delete artworkMappings[songId];
            }
          } catch (fileError) {
            console.warn(`Error checking artwork file for ${songId}:`, fileError);
          }
        }
      }

      // Save cleaned mappings if any files were missing
      await AsyncStorage.setItem(
        this.ARTWORK_STORAGE_KEY,
        JSON.stringify(artworkMappings)
      );

      return result;
    } catch (error) {
      console.error('Error getting bulk artwork:', error);
      return {};
    }
  }

  // Clear all artwork (useful for debugging/reset)
  async clearAllArtwork() {
    try {
      // Delete all files in artwork directory
      const dirInfo = await FileSystem.getInfoAsync(this.ARTWORK_DIRECTORY);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.ARTWORK_DIRECTORY, { idempotent: true });
        await FileSystem.makeDirectoryAsync(this.ARTWORK_DIRECTORY, { intermediates: true });
      }

      // Clear storage mappings
      await AsyncStorage.removeItem(this.ARTWORK_STORAGE_KEY);

      console.log('Cleared all custom artwork');
    } catch (error) {
      console.error('Error clearing artwork:', error);
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const artworkMappings = await this.getAllArtwork();
      const songCount = Object.keys(artworkMappings).length;
      
      let totalSize = 0;
      const dirInfo = await FileSystem.getInfoAsync(this.ARTWORK_DIRECTORY);
      
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(this.ARTWORK_DIRECTORY);
        
        for (const filename of files) {
          try {
            const filePath = this.ARTWORK_DIRECTORY + filename;
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            if (fileInfo.exists && fileInfo.size) {
              totalSize += fileInfo.size;
            }
          } catch (fileError) {
            console.warn(`Error getting size for ${filename}:`, fileError);
          }
        }
      }

      return {
        songCount,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        directory: this.ARTWORK_DIRECTORY,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { songCount: 0, totalSize: 0, totalSizeMB: '0.00' };
    }
  }
}

export const artworkStorageService = new ArtworkStorageService();