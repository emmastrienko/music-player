// src/components/common/EditSongModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import CustomImagePicker from './ImagePicker';
import { localMusicService } from '../../services/localMusicService';
import { updateSongInQueue } from '../../redux/slices/playerSlice';
import { updateSongInLibrary } from '../../redux/slices/musicSlice';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const EditSongModal = ({ visible, song, onClose, onSongUpdated }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [currentArtwork, setCurrentArtwork] = useState(null);

  useEffect(() => {
    if (visible && song) {
      setCurrentArtwork(song.artwork);
    }
  }, [visible, song]);

  const handleImageSelected = async (imageUri) => {
    if (!song || !song.isLocal) {
      Alert.alert('Error', 'Only local songs can have custom artwork.');
      return;
    }

    setLoading(true);
    try {
      let artworkUri = null;
      
      if (imageUri) {
        // Save the new artwork
        artworkUri = await localMusicService.setCustomArtwork(song.id, imageUri);
      } else {
        // Remove existing artwork
        await localMusicService.removeCustomArtwork(song.id);
      }

      // Update the current artwork state
      setCurrentArtwork(artworkUri);

      // Create updated song object
      const updatedSong = {
        ...song,
        artwork: artworkUri,
      };

      // Update Redux state
      dispatch(updateSongInQueue(updatedSong));
      dispatch(updateSongInLibrary(updatedSong));

      // Notify parent component
      if (onSongUpdated) {
        onSongUpdated(updatedSong);
      }

      Alert.alert(
        'Success',
        imageUri ? 'Custom artwork has been saved!' : 'Artwork has been removed.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error updating song artwork:', error);
      Alert.alert(
        'Error', 
        'Failed to update artwork. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!song) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <Text style={styles.title}>Edit Song</Text>
            
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Song Info */}
            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={2}>
                {song.title || 'Unknown Title'}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {song.artist || 'Unknown Artist'}
              </Text>
              {song.album && (
                <Text style={styles.songAlbum} numberOfLines={1}>
                  {song.album}
                </Text>
              )}
            </View>

            {/* Local Song Only Notice */}
            {!song.isLocal && (
              <View style={styles.noticeContainer}>
                <Ionicons name="information-circle" size={20} color={colors.warning} />
                <Text style={styles.noticeText}>
                  Custom artwork is only available for local songs.
                </Text>
              </View>
            )}

            {/* Artwork Section */}
            {song.isLocal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Custom Artwork</Text>
                <Text style={styles.sectionDescription}>
                  Choose a custom image for this song. The image will be saved locally and used whenever this song is displayed.
                </Text>
                
                <View style={styles.imagePickerContainer}>
                  <CustomImagePicker
                    onImageSelected={handleImageSelected}
                    currentImage={currentArtwork}
                    title="Select Song Artwork"
                    size={200}
                  />
                </View>

                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Saving artwork...</Text>
                  </View>
                )}
              </View>
            )}

            {/* Storage Info */}
            {song.isLocal && (
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Storage Information</Text>
                <View style={styles.infoItem}>
                  <Ionicons name="folder" size={16} color={colors.textMuted} />
                  <Text style={styles.infoText}>
                    Artwork is stored locally on your device
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="resize" size={16} color={colors.textMuted} />
                  <Text style={styles.infoText}>
                    Images are automatically optimized for display
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  songTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  songArtist: {
    ...typography.styles.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  songAlbum: {
    ...typography.styles.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  noticeText: {
    ...typography.styles.bodyMedium,
    color: colors.warning,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.styles.headingSmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  loadingText: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
  },
  infoSection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoTitle: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    ...typography.styles.bodySmall,
    color: colors.textMuted,
    flex: 1,
  },
});

export default EditSongModal;