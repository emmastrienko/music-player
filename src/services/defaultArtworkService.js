// src/services/defaultArtworkService.js
import { colors } from '../styles/colors';

class DefaultArtworkService {
  constructor() {
    // Beautiful gradient combinations for album artwork
    this.gradientCombinations = [
      // Warm gradients
      ['#FF6B6B', '#4ECDC4'], // Coral to Teal
      ['#A8E6CF', '#FFD93D'], // Mint to Yellow
      ['#FFA07A', '#98D8C8'], // Light Salmon to Mint
      ['#F7DC6F', '#BB8FCE'], // Light Yellow to Light Purple
      ['#85C1E9', '#F8C471'], // Light Blue to Peach
      
      // Cool gradients
      ['#667eea', '#764ba2'], // Blue to Purple
      ['#f093fb', '#f5576c'], // Pink to Red
      ['#4facfe', '#00f2fe'], // Blue to Cyan
      ['#43e97b', '#38f9d7'], // Green to Turquoise
      ['#fa709a', '#fee140'], // Pink to Yellow
      
      // Deep gradients
      ['#667db6', '#0082c8'], // Steel Blue to Ocean Blue
      ['#f857a6', '#ff5858'], // Magenta to Red
      ['#30cfd0', '#91a7ff'], // Cyan to Lavender
      ['#a8edea', '#fed6e3'], // Aqua to Pink
      ['#ffecd2', '#fcb69f'], // Cream to Coral
      
      // Vibrant gradients
      ['#ff9a9e', '#fecfef'], // Pink to Light Pink
      ['#a18cd1', '#fbc2eb'], // Purple to Pink
      ['#fad0c4', '#ffd1ff'], // Peach to Lilac
      ['#ffeaa7', '#74b9ff'], // Yellow to Blue
      ['#fd79a8', '#fdcb6e'], // Pink to Orange
      
      // Nature-inspired
      ['#56ab2f', '#a8e6cf'], // Forest Green to Mint
      ['#ee9ca7', '#ffdde1'], // Rose to Blush
      ['#2196f3', '#21cbf3'], // Blue to Light Blue
      ['#b721ff', '#21d4fd'], // Purple to Cyan
      ['#f85032', '#e73827'], // Orange to Red
    ];

    // Music-themed icon names that work well with gradients
    this.musicIcons = [
      'musical-notes',
      'musical-note',
      'headset',
      'disc',
      'radio',
      'volume-high',
      'play-circle',
      'heart',
      'star',
      'flash',
    ];
  }

  // Generate a deterministic random gradient based on song ID
  generateGradientForSong(songId, includeIcon = true) {
    // Create a simple hash from the song ID for consistency
    const hash = this.simpleHash(songId);
    
    // Select gradient combination
    const gradientIndex = hash % this.gradientCombinations.length;
    const [startColor, endColor] = this.gradientCombinations[gradientIndex];
    
    // Select icon
    const iconIndex = Math.floor(hash / this.gradientCombinations.length) % this.musicIcons.length;
    const icon = this.musicIcons[iconIndex];
    
    return {
      type: 'gradient',
      startColor,
      endColor,
      icon: includeIcon ? icon : null,
      iconColor: this.getContrastColor(startColor),
      id: `gradient_${songId}`,
    };
  }

  // Generate artwork for song title/artist combination (for more personalized gradients)
  generateGradientForSongInfo(title, artist, songId) {
    // Combine title and artist for more variety
    const combinedString = `${title || 'Unknown'}_${artist || 'Unknown'}_${songId}`;
    const hash = this.simpleHash(combinedString);
    
    // Select gradient combination
    const gradientIndex = hash % this.gradientCombinations.length;
    const [startColor, endColor] = this.gradientCombinations[gradientIndex];
    
    // Select icon based on title/artist
    const iconIndex = Math.floor(hash / this.gradientCombinations.length) % this.musicIcons.length;
    const icon = this.musicIcons[iconIndex];
    
    // Add some variation based on first letter of title
    const titleFirstChar = (title || 'Unknown').charAt(0).toUpperCase();
    const showLetter = hash % 3 === 0; // Show letter 1/3 of the time
    
    return {
      type: 'gradient',
      startColor,
      endColor,
      icon: showLetter ? null : icon,
      letter: showLetter ? titleFirstChar : null,
      iconColor: this.getContrastColor(startColor),
      textColor: this.getContrastColor(startColor),
      id: `gradient_${songId}`,
    };
  }

  // Simple hash function for consistent randomization
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get contrasting color for text/icons
  getContrastColor(hexColor) {
    // Remove # if present
    const cleanHex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, dark for light backgrounds
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  }

  // Get default artwork for any song
  getDefaultArtwork(song) {
    if (!song) return null;

    // If song already has artwork, return it
    if (song.artwork && song.artwork !== null) {
      return song.artwork;
    }

    // Generate gradient artwork
    return this.generateGradientForSongInfo(song.title, song.artist, song.id);
  }

  // Batch generate artwork for multiple songs
  generateBatchArtwork(songs) {
    return songs.map(song => ({
      ...song,
      defaultArtwork: this.getDefaultArtwork(song),
    }));
  }

  // Get artwork URL or gradient data
  getArtworkSource(song) {
    // If song has custom artwork, use it
    if (song.artwork && typeof song.artwork === 'string') {
      return { uri: song.artwork };
    }

    // If song has default artwork data, return it for gradient rendering
    if (song.defaultArtwork) {
      return song.defaultArtwork;
    }

    // Generate on-the-fly
    return this.getDefaultArtwork(song);
  }

  // Check if artwork source is a gradient
  isGradientArtwork(artworkSource) {
    return artworkSource && artworkSource.type === 'gradient';
  }

  // Get all available gradient combinations (for preview/selection)
  getAllGradients() {
    return this.gradientCombinations.map((gradient, index) => ({
      id: `preset_${index}`,
      startColor: gradient[0],
      endColor: gradient[1],
      type: 'gradient',
    }));
  }
}

export const defaultArtworkService = new DefaultArtworkService();