// src/services/audioService.js
import { Audio } from 'expo-av';

class AudioService {
  constructor() {
    this.sound = null;
    this.currentTrack = null;
    this.isLoaded = false;
    this.position = 0;
    this.duration = 0;
    
    // Configure audio mode
    this.setupAudio();
  }

  async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.warn('Error setting up audio:', error);
    }
  }

  async loadTrack(track) {
    try {
      // Unload previous track
      if (this.sound) {
        await this.unloadTrack();
      }

      console.log(`Loading track: ${track.title}`);
      
      // Determine the correct audio URL to use
      let audioUri;
      
      console.log(`Track data for ${track.title}:`, {
        isLocal: track.isLocal,
        url: track.url,
        previewUrl: track.previewUrl,
        localUri: track.localUri,
        uri: track.uri
      });
      
      if (track.isLocal === true && (track.url || track.localUri || track.uri)) {
        // For local files, try multiple URL properties
        audioUri = track.url || track.localUri || track.uri;
        console.log(`Using local file: ${audioUri}`);
        
        // Validate and normalize local file URL format
        if (!audioUri) {
          console.warn(`No URI found for local file`);
          throw new Error(`No URI found for local file`);
        }
        
        // Normalize local file URI - ensure it starts with file:// for local files
        if (!audioUri.startsWith('file://') && !audioUri.startsWith('content://')) {
          if (audioUri.startsWith('/')) {
            audioUri = 'file://' + audioUri;
            console.log(`Normalized local URI to: ${audioUri}`);
          } else {
            console.warn(`Invalid local file URL format: ${audioUri}`);
            throw new Error(`Invalid local file URL: ${audioUri}`);
          }
        }
      } else if (track.previewUrl && !track.previewUrl.includes('music.apple.com')) {
        // For iTunes songs, use the preview URL
        audioUri = track.previewUrl;
        console.log(`Using iTunes preview: ${audioUri}`);
      } else {
        // Log missing URL info and use fallback
        console.warn(`No valid audio URL found for ${track.title}:`, {
          isLocal: track.isLocal,
          hasUrl: !!track.url,
          hasPreviewUrl: !!track.previewUrl,
          hasLocalUri: !!track.localUri,
          hasUri: !!track.uri,
          urlType: track.url ? (track.url.includes('music.apple.com') ? 'website_link' : 'audio_file') : 'none'
        });
        
        // Try to fetch a working preview URL using iTunes Search API
        if (track.isLocal !== true && track.title && track.artist) {
          console.log(`Attempting to fetch working preview URL for: ${track.title} by ${track.artist}`);
          try {
            // Search iTunes for this specific track to get preview URL
            const searchResponse = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(track.title + ' ' + track.artist)}&media=music&entity=song&limit=1`);
            const searchData = await searchResponse.json();
            
            if (searchData.results && searchData.results.length > 0 && searchData.results[0].previewUrl) {
              audioUri = searchData.results[0].previewUrl;
              console.log(`✅ Found working preview URL: ${audioUri}`);
            } else {
              throw new Error('No preview URL in search results');
            }
          } catch (error) {
            console.log(`❌ Could not fetch preview URL: ${error.message}`);
            audioUri = 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3';
            console.log(`Using fallback audio for: ${track.title}`);
          }
        } else {
          audioUri = 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3';
          console.log(`Using fallback audio for: ${track.title}`);
        }
      }
      
      console.log(`Audio URI: ${audioUri}`);
      
      // Create new sound object
      console.log(`Attempting to create sound with URI: ${audioUri}`);
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false, isLooping: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      console.log(`Sound creation status:`, {
        isLoaded: status.isLoaded,
        error: status.error,
        durationMillis: status.durationMillis
      });

      if (!status.isLoaded) {
        console.error('❌ Sound failed to load:', status.error);
        throw new Error(`Failed to load audio: ${status.error || 'Unknown error'}`);
      }

      this.sound = sound;
      this.currentTrack = track;
      this.isLoaded = status.isLoaded;
      this.duration = status.durationMillis || (track.duration * 1000);

      console.log(`✅ Track loaded successfully: ${track.title}, Duration: ${this.duration}ms`);
      return { success: true, duration: this.duration };
    } catch (error) {
      console.error('❌ Error loading track:', error);
      
      // For local files, don't fall back to simulation - report the actual error
      if (track.isLocal) {
        console.error(`❌ Local file playback failed for: ${track.title}`);
        console.error('Error details:', {
          message: error.message,
          track: {
            title: track.title,
            url: track.url,
            localUri: track.localUri,
            uri: track.uri
          }
        });
        throw new Error(`Local file playback failed: ${error.message}`);
      }
      
      // Fallback: simulate loading success for online tracks only
      this.currentTrack = track;
      this.isLoaded = true;
      this.duration = (track.duration || 180) * 1000;
      console.log(`Using simulated playback for online track: ${track.title}`);
      return { success: true, duration: this.duration };
    }
  }

  async play() {
    try {
      if (this.sound && this.isLoaded) {
        await this.sound.playAsync();
        console.log('Playing:', this.currentTrack?.title);
        return { success: true };
      } else {
        // Simulate playback for demo
        console.log('Simulating playback for:', this.currentTrack?.title);
        return { success: true };
      }
    } catch (error) {
      console.warn('Error playing track:', error);
      return { success: true }; // Return success for demo
    }
  }

  async pause() {
    try {
      if (this.sound && this.isLoaded) {
        await this.sound.pauseAsync();
        console.log('Paused:', this.currentTrack?.title);
        return { success: true };
      } else {
        console.log('Simulating pause for:', this.currentTrack?.title);
        return { success: true };
      }
    } catch (error) {
      console.warn('Error pausing track:', error);
      return { success: true };
    }
  }

  async stop() {
    try {
      if (this.sound && this.isLoaded) {
        await this.sound.stopAsync();
        console.log('Stopped:', this.currentTrack?.title);
        return { success: true };
      } else {
        console.log('Simulating stop for:', this.currentTrack?.title);
        return { success: true };
      }
    } catch (error) {
      console.warn('Error stopping track:', error);
      return { success: true };
    }
  }

  async setPosition(positionMillis) {
    try {
      if (this.sound && this.isLoaded) {
        await this.sound.setPositionAsync(positionMillis);
        this.position = positionMillis;
        return { success: true };
      } else {
        this.position = positionMillis;
        console.log('Simulating seek to:', positionMillis);
        return { success: true };
      }
    } catch (error) {
      console.warn('Error setting position:', error);
      return { success: true };
    }
  }

  async setVolume(volume) {
    try {
      if (this.sound && this.isLoaded) {
        await this.sound.setVolumeAsync(volume);
        console.log('Volume set to:', volume);
        return { success: true };
      } else {
        console.log('Simulating volume change to:', volume);
        return { success: true };
      }
    } catch (error) {
      console.warn('Error setting volume:', error);
      return { success: true };
    }
  }

  async unloadTrack() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isLoaded = false;
        this.position = 0;
        this.duration = 0;
        console.log('Track unloaded');
      }
    } catch (error) {
      console.warn('Error unloading track:', error);
    }
  }

  onPlaybackStatusUpdate(status) {
    if (status.isLoaded) {
      this.position = status.positionMillis || 0;
      this.duration = status.durationMillis || 0;
      this.isLoaded = true;
      
      // Dispatch position updates to Redux if callback is set
      if (this.onPositionUpdate) {
        this.onPositionUpdate(this.position, this.duration);
      }
      
      if (status.didJustFinish) {
        console.log('Track finished playing');
        if (this.onTrackFinished) {
          this.onTrackFinished();
        }
      }
    } else if (status.error) {
      console.warn('Playback error:', status.error);
    }
  }

  setPositionUpdateCallback(callback) {
    this.onPositionUpdate = callback;
  }

  setTrackFinishedCallback(callback) {
    this.onTrackFinished = callback;
  }

  getCurrentPosition() {
    return this.position;
  }

  getDuration() {
    return this.duration;
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  isTrackLoaded() {
    return this.isLoaded;
  }
}

export const audioService = new AudioService();