// ─────────────────────────────────────────────
// App.js  –  Aluré entry point
//
// Responsibilities:
//   1. Initialize local storage with seed data
//   2. Set up gesture handler (required by react-navigation)
//   3. Render the navigation tree
// ─────────────────────────────────────────────

import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator          from './src/navigation/AppNavigator';
import { initializeStorage } from './src/services/storageService';
import { COLORS }            from './src/constants/theme';

export default function App() {
  const [ready, setReady] = useState(false);

  // ── Seed AsyncStorage on first launch ────────
  useEffect(() => {
    initializeStorage()
      .then(() => setReady(true))
      .catch(() => setReady(true));   // proceed even if seeding fails
  }, []);

  // ── Loading splash while storage seeds ───────
  if (!ready) {
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
