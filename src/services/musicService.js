// src/services/musicService.js
import api from './api';

class MusicService {
  // Fetch real music from iTunes API with multiple search terms for better results
  async getPopularSongs(limit = 50) {
    try {
      console.log('Fetching popular songs from iTunes API');
      
      // Try multiple search terms to get diverse popular music
      const searchTerms = [
        'pop music 2024',
        'trending songs',
        'billboard hits',
        'top charts',
        'popular music'
      ];
      
      let allSongs = [];
      const songsPerTerm = Math.ceil(limit / searchTerms.length);
      
      for (const term of searchTerms) {
        try {
          const response = await api.get('https://itunes.apple.com/search', {
            params: {
              term: term,
              country: 'US',
              media: 'music',
              entity: 'song',
              limit: songsPerTerm,
            },
          });

          const songs = response.data.results.map((song, index) => {
            const trackData = {
              id: song.trackId || `itunes_${term}_${index}`,
              title: song.trackName,
              artist: song.artistName,
              album: song.collectionName,
              duration: Math.floor(song.trackTimeMillis / 1000) || 180,
              artwork: song.artworkUrl100?.replace('100x100', '600x600') || song.artworkUrl60?.replace('60x60', '600x600') || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center',
              previewUrl: song.previewUrl, // 30-second preview from iTunes
              genre: song.primaryGenreName,
              releaseDate: song.releaseDate,
              price: song.trackPrice,
              currency: song.currency,
              isLocal: false,
              isFavorite: false,
            };
            
            console.log(`iTunes song processed: ${trackData.title}`, {
              hasPreviewUrl: !!trackData.previewUrl,
              previewUrl: trackData.previewUrl
            });
            
            return trackData;
          });

          allSongs = [...allSongs, ...songs];
        } catch (termError) {
          console.warn(`Failed to fetch songs for term "${term}":`, termError.message);
        }
      }

      // Remove duplicates based on trackId
      const uniqueSongs = allSongs.filter((song, index, self) => 
        index === self.findIndex(s => s.id === song.id)
      );

      // Limit to requested number
      const finalSongs = uniqueSongs.slice(0, limit);
      
      console.log(`Loaded ${finalSongs.length} real songs from iTunes`);
      return {data: finalSongs};
    } catch (error) {
      console.error('Error fetching from iTunes API:', error);
      // Return empty array instead of mock data - let user know API is unavailable
      return {data: []};
    }
  }

  async searchSongs(query, limit = 30) {
    try {
      console.log(`Searching iTunes for: ${query}`);
      
      const response = await api.get('https://itunes.apple.com/search', {
        params: {
          term: query,
          country: 'US',
          media: 'music',
          entity: 'song',
          limit: limit,
        },
      });

      const songs = response.data.results.map((song, index) => ({
        id: song.trackId || `search_${index}`,
        title: song.trackName,
        artist: song.artistName,
        album: song.collectionName,
        duration: Math.floor(song.trackTimeMillis / 1000) || 180,
        artwork: song.artworkUrl100?.replace('100x100', '600x600') || song.artworkUrl60?.replace('60x60', '600x600') || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center',
        previewUrl: song.previewUrl, // Real 30-second previews
        genre: song.primaryGenreName,
        releaseDate: song.releaseDate,
        price: song.trackPrice,
        currency: song.currency,
        isLocal: false,
        isFavorite: false,
      }));

      console.log(`Found ${songs.length} songs for "${query}"`);
      return {data: songs};
    } catch (error) {
      console.error('Error searching iTunes:', error);
      return {data: []};
    }
  }

  async getSongsByGenre(genre, limit = 30) {
    try {
      console.log(`Searching iTunes for genre: ${genre}`);
      
      const response = await api.get('https://itunes.apple.com/search', {
        params: {
          term: `${genre} music`,
          country: 'US',
          media: 'music',
          entity: 'song',
          limit: limit,
        },
      });

      const songs = response.data.results.map((song, index) => ({
        id: song.trackId || `genre_${index}`,
        title: song.trackName,
        artist: song.artistName,
        album: song.collectionName,
        duration: Math.floor(song.trackTimeMillis / 1000) || 180,
        artwork: song.artworkUrl100?.replace('100x100', '600x600') || song.artworkUrl60?.replace('60x60', '600x600') || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center',
        previewUrl: song.previewUrl,
        genre: song.primaryGenreName,
        releaseDate: song.releaseDate,
        price: song.trackPrice,
        currency: song.currency,
        isLocal: false,
        isFavorite: false,
      }));

      console.log(`Found ${songs.length} songs for genre "${genre}"`);
      return {data: songs};
    } catch (error) {
      console.error('Error fetching songs by genre:', error);
      return {data: []};
    }
  }

  async getArtistSongs(artistName, limit = 30) {
    try {
      console.log(`Searching iTunes for artist: ${artistName}`);
      
      const response = await api.get('https://itunes.apple.com/search', {
        params: {
          term: artistName,
          country: 'US',
          media: 'music',
          entity: 'song',
          attribute: 'artistTerm',
          limit: limit,
        },
      });

      const songs = response.data.results.map((song, index) => ({
        id: song.trackId || `artist_${index}`,
        title: song.trackName,
        artist: song.artistName,
        album: song.collectionName,
        duration: Math.floor(song.trackTimeMillis / 1000) || 180,
        artwork: song.artworkUrl100?.replace('100x100', '600x600') || song.artworkUrl60?.replace('60x60', '600x600') || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center',
        previewUrl: song.previewUrl,
        genre: song.primaryGenreName,
        releaseDate: song.releaseDate,
        price: song.trackPrice,
        currency: song.currency,
        isLocal: false,
        isFavorite: false,
      }));

      console.log(`Found ${songs.length} songs for artist "${artistName}"`);
      return {data: songs};
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      return {data: []};
    }
  }

  // Get trending songs from iTunes RSS feeds (more reliable)
  async getTrendingSongs(limit = 50) {
    try {
      console.log('Fetching trending songs from iTunes RSS');
      
      // iTunes RSS feed for top songs
      const response = await api.get('https://rss.applemarketingtools.com/api/v2/us/music/most-played/50/songs.json');
      
      if (response.data && response.data.feed && response.data.feed.results) {
        const songs = response.data.feed.results.slice(0, limit).map((song, index) => {
          const trackData = {
            id: song.id || `trending_${index}`,
            title: song.name,
            artist: song.artistName,
            album: song.collectionName || 'Single',
            duration: 180, // RSS doesn't include duration
            artwork: song.artworkUrl100 || null,
            previewUrl: song.previewUrl || null,
            genre: song.genres?.[0]?.name || 'Music',
            releaseDate: song.releaseDate,
            url: song.url,
            isLocal: false,
            isFavorite: false,
          };
          
          console.log(`RSS song processed: ${trackData.title}`, {
            hasPreviewUrl: !!trackData.previewUrl,
            hasUrl: !!trackData.url,
            previewUrl: trackData.previewUrl
          });
          
          return trackData;
        });

        console.log(`Loaded ${songs.length} trending songs from iTunes RSS`);
        return {data: songs};
      }
      
      throw new Error('Invalid RSS response structure');
    } catch (error) {
      console.error('Error fetching from iTunes RSS:', error);
      // Fallback to search API
      return this.getPopularSongs(limit);
    }
  }
}

export const musicService = new MusicService();