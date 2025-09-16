// src/screens/stack/SettingsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {updatePreferences} from '../../redux/slices/userSlice';
import Header from '../../components/common/Header';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {globalStyles} from '../../styles/globalStyles';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const {preferences} = useSelector(state => state.user);

  const settingsItems = [
    {
      title: 'Audio Quality',
      subtitle: preferences.audioQuality,
      onPress: () => {
        // Toggle audio quality
        const qualities = ['low', 'medium', 'high'];
        const currentIndex = qualities.indexOf(preferences.audioQuality);
        const nextQuality = qualities[(currentIndex + 1) % qualities.length];
        dispatch(updatePreferences({audioQuality: nextQuality}));
      },
      icon: 'musical-note',
    },
    {
      title: 'Autoplay',
      subtitle: preferences.autoplay ? 'On' : 'Off',
      onPress: () => {
        dispatch(updatePreferences({autoplay: !preferences.autoplay}));
      },
      icon: 'play-circle',
    },
    {
      title: 'Download on WiFi only',
      subtitle: preferences.downloadOnWifi ? 'On' : 'Off',
      onPress: () => {
        dispatch(updatePreferences({downloadOnWifi: !preferences.downloadOnWifi}));
      },
      icon: 'wifi',
    },
    {
      title: 'Notifications',
      subtitle: preferences.notifications ? 'On' : 'Off',
      onPress: () => {
        dispatch(updatePreferences({notifications: !preferences.notifications}));
      },
      icon: 'notifications',
    },
    {
      title: 'Theme',
      subtitle: preferences.theme === 'dark' ? 'Dark' : 'Light',
      onPress: () => {
        dispatch(updatePreferences({
          theme: preferences.theme === 'dark' ? 'light' : 'dark'
        }));
      },
      icon: 'moon',
    },
  ];

  const renderSettingItem = ({item}) => (
    <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
      <View style={styles.settingInfo}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={24} color={colors.textSecondary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <Header title="Settings" showBack />
      
      <FlatList
        data={settingsItems}
        renderItem={renderSettingItem}
        keyExtractor={item => item.title}
        style={styles.settingsList}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  settingsList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundTertiary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
  },
});

export default SettingsScreen;