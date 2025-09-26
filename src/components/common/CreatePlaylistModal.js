// src/components/common/CreatePlaylistModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const CreatePlaylistModal = ({ visible, onClose, onCreatePlaylist }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!playlistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    const newPlaylist = {
      id: Date.now().toString(),
      name: playlistName.trim(),
      description: description.trim(),
      songs: [],
      createdAt: new Date().toISOString(),
      artwork: null,
    };

    onCreatePlaylist(newPlaylist);
    setPlaylistName('');
    setDescription('');
    onClose();
  };

  const handleCancel = () => {
    setPlaylistName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <BlurView intensity={50} style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[colors.backgroundSecondary, colors.backgroundTertiary]}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>Create Playlist</Text>
              
              <TouchableOpacity onPress={handleCreate} style={styles.createButton}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>

            {/* Playlist Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.playlistIcon}>
                <Ionicons name="musical-notes" size={40} color={colors.primary} />
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Playlist Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter playlist name"
                  placeholderTextColor={colors.textMuted}
                  value={playlistName}
                  onChangeText={setPlaylistName}
                  maxLength={50}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add a description"
                  placeholderTextColor={colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  maxLength={200}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]} 
                onPress={handleCreate}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Create Playlist</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  
  modalContent: {
    padding: 24,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  closeButton: {
    padding: 8,
  },
  
  headerTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  
  createButton: {
    padding: 8,
  },
  
  createButtonText: {
    ...typography.styles.labelLarge,
    color: colors.primary,
    fontWeight: '600',
  },
  
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  
  playlistIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  
  form: {
    gap: 20,
    marginBottom: 32,
  },
  
  inputContainer: {
    gap: 8,
  },
  
  inputLabel: {
    ...typography.styles.labelMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  
  input: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cancelButton: {
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  
  cancelButtonText: {
    ...typography.styles.labelLarge,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  
  primaryButton: {
    overflow: 'hidden',
  },
  
  primaryButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  
  primaryButtonText: {
    ...typography.styles.labelLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default CreatePlaylistModal;