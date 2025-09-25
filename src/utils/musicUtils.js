// src/utils/musicUtils.js
// Utility functions for music app

/**
 * Format duration from seconds to MM:SS format
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format file size from bytes to human readable format
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const threshold = 1024;
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= threshold && unitIndex < units.length - 1) {
    size /= threshold;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * Get a placeholder artwork URL based on genre
 */
export const getPlaceholderArtwork = (genre = 'Music') => {
  const artworkMap = {
    'Pop': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    'Rock': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    'Hip-Hop': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    'Jazz': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    'Classical': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
    'Electronic': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&hue=180',
    'Country': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&hue=60',
    'R&B': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop&hue=240',
    'Alternative': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&sat=2',
  };
  
  return artworkMap[genre] || artworkMap['Pop'];
};

/**
 * Shuffle an array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Group songs by artist or album
 */
export const groupSongsBy = (songs, groupBy = 'artist') => {
  const groups = {};
  
  songs.forEach(song => {
    const key = song[groupBy] || 'Unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(song);
  });
  
  return groups;
};

/**
 * Filter songs by genre
 */
export const filterSongsByGenre = (songs, genre) => {
  if (!genre || genre === 'All') return songs;
  return songs.filter(song => song.genre === genre);
};

/**
 * Search songs by title, artist, or album
 */
export const searchSongs = (songs, query) => {
  if (!query || query.trim().length === 0) return songs;
  
  const searchTerm = query.toLowerCase().trim();
  
  return songs.filter(song => 
    song.title?.toLowerCase().includes(searchTerm) ||
    song.artist?.toLowerCase().includes(searchTerm) ||
    song.album?.toLowerCase().includes(searchTerm)
  );
};

/**
 * Get unique genres from songs array
 */
export const getUniqueGenres = (songs) => {
  const genres = new Set(['All']);
  songs.forEach(song => {
    if (song.genre) {
      genres.add(song.genre);
    }
  });
  return Array.from(genres);
};

/**
 * Validate song object structure
 */
export const isValidSong = (song) => {
  return song && 
         typeof song.id === 'string' && 
         typeof song.title === 'string' && 
         typeof song.artist === 'string' && 
         (song.url || song.previewUrl);
};

/**
 * Clean up song metadata
 */
export const cleanSongMetadata = (song) => {
  return {
    ...song,
    title: song.title?.trim() || 'Unknown Title',
    artist: song.artist?.trim() || 'Unknown Artist',
    album: song.album?.trim() || 'Unknown Album',
    genre: song.genre?.trim() || 'Unknown',
    duration: typeof song.duration === 'number' ? song.duration : 0,
  };
};