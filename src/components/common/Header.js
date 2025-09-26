// src/components/common/Header.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {colors} from '../../styles/colors';
import {typography} from '../../styles/typography';

const Header = ({title, showBack, showProfile, rightComponent}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}

      <Text style={styles.title}>{title}</Text>

      {rightComponent ? (
        rightComponent
      ) : showProfile ? (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 5, // Reduced padding
    backgroundColor: 'transparent',
  },
  title: {
    ...typography.styles.labelLarge, // Even smaller title
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 18, // Explicit smaller font size
  },
  iconButton: {
    width: 36, // Smaller icon buttons
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;