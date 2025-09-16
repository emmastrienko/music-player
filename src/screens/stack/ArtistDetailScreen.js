// src/screens/stack/ArtistDetailScreen.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Header from '../../components/common/Header';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';
import {globalStyles} from '../../styles/globalStyles';

const ArtistDetailScreen = ({route}) => {
  const {artist} = route.params;

  return (
    <View style={globalStyles.container}>
      <Header title={artist?.name || 'Artist'} showBack />
      <View style={styles.centerContainer}>
        <Text style={styles.comingSoon}>Artist Detail Coming Soon</Text>
        <Text style={styles.subtitle}>
          This feature will show artist information, albums, and top songs
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  comingSoon: {
    ...typography.styles.headingMedium,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ArtistDetailScreen;