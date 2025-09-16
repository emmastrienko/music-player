// src/services/musicService.js
import api from './api';

class MusicService {
  // Return mock data for demo purposes - iTunes API often has CORS issues
  async getPopularSongs(limit = 50) {
    try {
      console.log('Loading popular songs from mock data');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return {data: this.getMockSongs()};
    } catch (error) {
      console.error('Error fetching popular songs:', error);
      return {data: this.getMockSongs()};
    }
  }

  async searchSongs(query, limit = 30) {
    try {
      console.log(`Searching for: ${query}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter mock songs based on query
      const allSongs = this.getMockSongs();
      const filteredSongs = allSongs.filter(song => 
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.album.toLowerCase().includes(query.toLowerCase())
      );
      
      return {data: filteredSongs.slice(0, limit)};
    } catch (error) {
      console.error('Error searching songs:', error);
      return {data: []};
    }
  }

  async getSongsByGenre(genre, limit = 30) {
    try {
      console.log(`Loading songs for genre: ${genre}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter mock songs by genre
      const allSongs = this.getMockSongs();
      const filteredSongs = allSongs.filter(song => 
        song.genre.toLowerCase().includes(genre.toLowerCase())
      );
      
      return {data: filteredSongs.slice(0, limit)};
    } catch (error) {
      console.error('Error fetching songs by genre:', error);
      return {data: []};
    }
  }

  async getArtistSongs(artistName, limit = 30) {
    try {
      console.log(`Loading songs for artist: ${artistName}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter mock songs by artist
      const allSongs = this.getMockSongs();
      const filteredSongs = allSongs.filter(song => 
        song.artist.toLowerCase().includes(artistName.toLowerCase())
      );
      
      return {data: filteredSongs.slice(0, limit)};
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      return {data: []};
    }
  }

  // Mock data for offline mode or API failures
  getMockSongs() {
    return [
      {
        id: 'mock_1',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200,
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        previewUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
        genre: 'Pop',
        releaseDate: '2020-03-20',
        isLocal: false,
        isFavorite: false,
      },
      {
        id: 'mock_2',
        title: 'Watermelon Sugar',
        artist: 'Harry Styles',
        album: 'Fine Line',
        duration: 174,
        artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        previewUrl: 'https://codeskulptor-demos.commondatastorage.googleapis.com/descent/background%20music.mp3',
        genre: 'Pop',
        releaseDate: '2020-05-15',
        isLocal: false,
        isFavorite: false,
      },
      {
        id: 'mock_3',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: 203,
        artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
        previewUrl: 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3',
        genre: 'Pop',
        releaseDate: '2020-03-27',
        isLocal: false,
        isFavorite: false,
      },
      {
        id: 'mock_4',
        title: 'Stay',
        artist: 'The Kid LAROI, Justin Bieber',
        album: 'F*CK LOVE 3',
        duration: 141,
        artwork: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        previewUrl: null,
        genre: 'Pop',
        releaseDate: '2021-07-09',
        isLocal: false,
        isFavorite: false,
      },
      {
        id: 'mock_5',
        title: 'Good 4 U',
        artist: 'Olivia Rodrigo',
        album: 'SOUR',
        duration: 178,
        artwork: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
        previewUrl: null,
        genre: 'Pop',
        releaseDate: '2021-05-14',
        isLocal: false,
        isFavorite: false,
      },
      {
        id: 'mock_6',
        title: 'Heat Waves',
        artist: 'Glass Animals',
        album: 'Dreamland',
        duration: 238,
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&sat=2',
        previewUrl: null,
        genre: 'Alternative',
        releaseDate: '2020-06-29',
        isLocal: false,
        isFavorite: false,
      },
      {
        id: 'mock_7',
        title: 'As It Was',
        artist: 'Harry Styles',
        album: 'Harrys House',
        duration: 167,
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&hue=180',
        previewUrl: null,
        genre: 'Pop',
        releaseDate: '2022-04-01',
        isLocal: false,
        isFavorite: false,
      },
      {
        id: 'mock_8',
        title: 'Industry Baby',
        artist: 'Lil Nas X, Jack Harlow',
        album: 'MONTERO',
        duration: 212,
        artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&hue=60',
        previewUrl: null,
        genre: 'Hip-Hop',
        releaseDate: '2021-07-23',
        isLocal: false,
        isFavorite: false,
      },
      {
        id: 'mock_9',
        title: 'Bad Habits',
        artist: 'Ed Sheeran',
        album: '=',
        duration: 231,
        artwork: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&hue=120',
        previewUrl: null,
        genre: 'Pop',
        releaseDate: '2021-06-25',
        isLocal: false,
        isFavorite: false,
      },
      {
        id: 'mock_10',
        title: 'Peaches',
        artist: 'Justin Bieber ft. Daniel Caesar, Giveon',
        album: 'Justice',
        duration: 198,
        artwork: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop&hue=240',
        previewUrl: null,
        genre: 'R&B',
        releaseDate: '2021-03-19',
        isLocal: false,
        isFavorite: false,
      },
    ];
  }
}

export const musicService = new MusicService();