// src/navigation/EnhancedTabNavigator.js
import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EnhancedHomeScreen from '../screens/tabs/EnhancedHomeScreen';
import LibraryScreen from '../screens/tabs/LibraryScreen';
import SearchScreen from '../screens/tabs/SearchScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';
import EnhancedMiniPlayer from '../components/player/EnhancedMiniPlayer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { modernDesign } from '../styles/modernDesign';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentTrack } = useSelector(state => state.player);
  
  // Animation for active tab indicator
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    // Animate indicator to active tab position
    Animated.spring(indicatorAnim, {
      toValue: state.index,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Scale animation for active tab
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: state.index === index ? 1.2 : 1,
        useNativeDriver: true,
        tension: 150,
        friction: 10,
      }).start();
    });
  }, [state.index]);

  const tabWidth = 100 / state.routes.length;
  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: state.routes.map((_, i) => i),
    outputRange: state.routes.map((_, i) => `${i * tabWidth}%`),
  });

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      {/* Background blur effect */}
      <BlurView intensity={80} style={styles.tabBarBlur}>
        <LinearGradient
          colors={[
            'rgba(31, 41, 55, 0.95)',
            'rgba(17, 24, 39, 0.98)',
          ]}
          style={styles.tabBarGradient}
        >
          {/* Active tab indicator */}
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                width: `${tabWidth}%`,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          >
            <LinearGradient
              colors={modernDesign.gradients.button}
              style={styles.indicatorGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* Tab buttons */}
          <View style={styles.tabButtonsContainer}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label = options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              const getIconName = (routeName, focused) => {
                switch (routeName) {
                  case 'Home':
                    return focused ? 'home' : 'home-outline';
                  case 'Search':
                    return focused ? 'search' : 'search-outline';
                  case 'Library':
                    return focused ? 'library' : 'library-outline';
                  case 'Profile':
                    return focused ? 'person' : 'person-outline';
                  default:
                    return 'circle';
                }
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabButton}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.tabContent,
                      {
                        transform: [{ scale: scaleAnims[index] }],
                      },
                    ]}
                  >
                    {/* Icon container with glow effect */}
                    <View style={[
                      styles.iconContainer,
                      isFocused && styles.activeIconContainer,
                    ]}>
                      <Ionicons
                        name={getIconName(route.name, isFocused)}
                        size={isFocused ? 26 : 24}
                        color={isFocused ? colors.textPrimary : colors.textMuted}
                      />
                      
                      {/* Notification badge for specific tabs */}
                      {route.name === 'Library' && (
                        <View style={styles.notificationBadge}>
                          <Text style={styles.badgeText}>3</Text>
                        </View>
                      )}
                    </View>

                    {/* Label with smooth transition */}
                    <Animated.Text
                      style={[
                        styles.tabLabel,
                        {
                          color: isFocused ? colors.textPrimary : colors.textMuted,
                          fontWeight: isFocused ? '600' : '400',
                        },
                      ]}
                    >
                      {label}
                    </Animated.Text>

                    {/* Active state glow */}
                    {isFocused && (
                      <View style={styles.activeGlow}>
                        <LinearGradient
                          colors={[colors.primary + '40', 'transparent']}
                          style={styles.glowGradient}
                        />
                      </View>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const EnhancedTabNavigator = () => {
  const { currentTrack } = useSelector(state => state.player);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={EnhancedHomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarAccessibilityLabel: 'Home Tab',
          }}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchScreen}
          options={{
            tabBarLabel: 'Search',
            tabBarAccessibilityLabel: 'Search Tab',
          }}
        />
        <Tab.Screen 
          name="Library" 
          component={LibraryScreen}
          options={{
            tabBarLabel: 'Library',
            tabBarAccessibilityLabel: 'Library Tab',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarAccessibilityLabel: 'Profile Tab',
          }}
        />
      </Tab.Navigator>
      
      {/* Enhanced Mini Player */}
      {currentTrack && <EnhancedMiniPlayer />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },

  tabBarBlur: {
    borderTopLeftRadius: modernDesign.layout.borderRadius.large,
    borderTopRightRadius: modernDesign.layout.borderRadius.large,
    overflow: 'hidden',
  },

  tabBarGradient: {
    paddingTop: 12,
    paddingHorizontal: 8,
    position: 'relative',
    minHeight: 80,
  },

  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },

  indicatorGradient: {
    flex: 1,
    borderRadius: 2,
  },

  tabButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  iconContainer: {
    position: 'relative',
    marginBottom: 4,
    padding: 4,
  },

  activeIconContainer: {
    ...modernDesign.shadows.glow,
  },

  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  badgeText: {
    ...typography.styles.labelSmall,
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
  },

  tabLabel: {
    ...typography.styles.labelSmall,
    fontSize: 11,
    textAlign: 'center',
  },

  activeGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 20,
    zIndex: -1,
  },

  glowGradient: {
    flex: 1,
    borderRadius: 20,
  },
});

export default EnhancedTabNavigator;