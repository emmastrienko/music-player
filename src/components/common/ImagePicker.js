// src/components/common/ImagePicker.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const CustomImagePicker = ({ 
  onImageSelected, 
  currentImage = null, 
  title = "Select Image",
  size = 150 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(currentImage);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant permission to access your photo library to add custom artwork.'
      );
      return false;
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for album art
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        onImageSelected(imageUri);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permission to take a photo.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        onImageSelected(imageUri);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    onImageSelected(null);
    setModalVisible(false);
  };

  const renderImagePreview = () => {
    if (selectedImage) {
      return (
        <Image
          source={{ uri: selectedImage }}
          style={[styles.imagePreview, { width: size, height: size }]}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={[styles.placeholder, { width: size, height: size }]}>
        <Ionicons name="image-outline" size={size * 0.4} color={colors.textMuted} />
        <Text style={styles.placeholderText}>No Image</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        {renderImagePreview()}
        <View style={styles.editOverlay}>
          <Ionicons name="camera" size={20} color={colors.textPrimary} />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.option}
                onPress={pickImageFromLibrary}
              >
                <Ionicons name="images" size={24} color={colors.primary} />
                <Text style={styles.optionText}>Choose from Library</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={takePhoto}
              >
                <Ionicons name="camera" size={24} color={colors.primary} />
                <Text style={styles.optionText}>Take Photo</Text>
              </TouchableOpacity>

              {selectedImage && (
                <TouchableOpacity
                  style={[styles.option, styles.removeOption]}
                  onPress={removeImage}
                >
                  <Ionicons name="trash" size={24} color={colors.error} />
                  <Text style={[styles.optionText, { color: colors.error }]}>
                    Remove Image
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
  },
  placeholderText: {
    ...typography.styles.bodySmall,
    color: colors.textMuted,
    marginTop: 8,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    gap: 16,
  },
  removeOption: {
    backgroundColor: colors.errorBackground,
  },
  optionText: {
    ...typography.styles.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.styles.bodyLarge,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default CustomImagePicker;