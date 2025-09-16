// src/screens/tabs/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {updateProfile} from '../../redux/slices/userSlice';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {globalStyles} from '../../styles/globalStyles';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {profile, stats} = useSelector(state => state.user);
  const {favorites, playlists, recentlyPlayed} = useSelector(state => state.music);

  const formatListeningTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const statsCards = [
    {
      title: 'Songs Played',
      value: stats.songsPlayed.toString(),
      icon: 'musical-notes',
      color: colors.primary,
    },
    {
      title: 'Listening Time',
      value: formatListeningTime(stats.totalListeningTime),
      icon: 'time',
      color: colors.accentSecondary,
    },
    {
      title: 'Favorites',
      value: favorites.length.toString(),
      icon: 'heart',
      color: colors.error,
    },
    {
      title: 'Playlists',
      value: playlists.length.toString(),
      icon: 'list',
      color: colors.info,
    },
  ];

  const menuItems = [
    {
      title: 'Recently Played',
      subtitle: `${recentlyPlayed.length} songs`,
      icon: 'time-outline',
      onPress: () => {},
    },
    {
      title: 'Downloaded Music',
      subtitle: 'Manage offline songs',
      icon: 'download-outline',
      onPress: () => {},
    },
    {
      title: 'Settings',
      subtitle: 'App preferences',
      icon: 'settings-outline',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: 'About',
      subtitle: 'App info and support',
      icon: 'information-circle-outline',
      onPress: () => {},
    },
  ];

  const renderStatsCard = (stat, index) => (
    <View key={index} style={styles.statsCard}>
      <View style={[styles.statsIcon, {backgroundColor: stat.color}]}>
        <Ionicons name={stat.icon} size={24} color={colors.textPrimary} />
      </View>
      <Text style={styles.statsValue}>{stat.value}</Text>
      <Text style={styles.statsTitle}>{stat.title}</Text>
    </View>
  );

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.8}>
      
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={item.icon} size={24} color={colors.textSecondary} />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <Header title="Profile" />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <LinearGradient
          colors={[colors.primary, colors.background]}
          style={styles.profileHeader}>
          
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {profile.avatar ? (
                <Image source={{uri: profile.avatar}} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={colors.textSecondary} />
                </View>
              )}
            </View>
            
            <Text style={styles.profileName}>{profile.name}</Text>
            
            {profile.premium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
          
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => {}}
            style={styles.editButton}
          />
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {statsCards.map(renderStatsCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="heart" size={24} color={colors.error} />
            <Text style={styles.quickActionText}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="download" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Downloads</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="time" size={24} color={colors.info} />
            <Text style={styles.quickActionText}>Recent</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    ...typography.styles.headingLarge,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  premiumText: {
    ...typography.styles.labelSmall,
    color: colors.warning,
    marginLeft: 4,
    fontWeight: '600',
  },
  editButton: {
    minWidth: 120,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsValue: {
    ...typography.styles.headingMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsTitle: {
    ...typography.styles.labelSmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionText: {
    ...typography.styles.labelSmall,
    color: colors.textSecondary,
    marginTop: 8,
  },
  menuSection: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuSubtitle: {
    ...typography.styles.bodySmall,
    color: colors.textSecondary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileScreen;