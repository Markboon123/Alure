// ─────────────────────────────────────────────
// App.js  –  Aluré entry point
// Loads custom fonts once, seeds storage, then
// renders the navigation tree.
// ─────────────────────────────────────────────

import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
} from '@expo-google-fonts/jost';

import AppNavigator          from './src/navigation/AppNavigator';
import { initializeStorage } from './src/services/storageService';
import { COLORS }            from './src/constants/theme';

export default function App() {
  const [storageReady, setStorageReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_600SemiBold,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
  });

  useEffect(() => {
    initializeStorage()
      .then(() => setStorageReady(true))
      .catch(() => setStorageReady(true));
  }, []);

  // Allow app to open even if fonts fail to load
  if (!storageReady || (!fontsLoaded && !fontError)) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    flex:            1,
    backgroundColor: COLORS.background,
    alignItems:      'center',
    justifyContent:  'center',
  },
});
