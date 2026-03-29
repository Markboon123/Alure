// ─────────────────────────────────────────────
// LoginScreen
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleLogin() {
    if (!email.trim()) return;
    setLoading(true);
    // No backend — store locally and mark as logged in
    const name = email.split('@')[0];
    await login({ name, email: email.trim() });
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Brand ── */}
          <View style={styles.brandRow}>
            <Text style={styles.brand}>ALURÉ</Text>
            <Text style={styles.tagline}>Your personal style assistant</Text>
          </View>

          {/* ── Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to your wardrobe</Text>

            {/* Email */}
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginBtn, (!email.trim() || loading) && { opacity: 0.5 }]}
              onPress={handleLogin}
              disabled={!email.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.loginBtnText}>SIGN IN</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Sign up link ── */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to ALURÉ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerLink}>Create account</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flexGrow:          1,
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.xxl,
    justifyContent:    'center',
  },

  // ── Brand ──
  brandRow: {
    alignItems:   'center',
    marginBottom: SPACING.xl,
    marginTop:    SPACING.xxl,
  },

  brand: {
    fontFamily:    FONTS.brand,
    fontSize:      40,
    letterSpacing: 8,
    color:         COLORS.primary,
    marginBottom:  SPACING.xs,
  },

  tagline: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    fontStyle:  'italic',
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.lg,
    ...SHADOW.medium,
    marginBottom:    SPACING.xl,
  },

  cardTitle: {
    fontFamily:   FONTS.bold,
    fontSize:     FONTS.sizeXL,
    color:        COLORS.textDark,
    marginBottom: SPACING.xs,
  },

  cardSub: {
    fontFamily:   FONTS.regular,
    fontSize:     FONTS.sizeSM,
    color:        COLORS.textMedium,
    marginBottom: SPACING.lg,
  },

  // ── Field ──
  fieldLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    color:         COLORS.textMedium,
    letterSpacing: 1.5,
    marginBottom:  SPACING.xs,
  },

  inputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   COLORS.inputBackground,
    borderRadius:      RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm + 2,
    gap:               SPACING.sm,
    marginBottom:      SPACING.md,
  },

  input: {
    flex:       1,
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
  },

  // ── Login button ──
  loginBtn: {
    backgroundColor: COLORS.textDark,
    borderRadius:    RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems:      'center',
    marginTop:       SPACING.sm,
    ...SHADOW.small,
  },

  loginBtnText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeMD,
    color:         COLORS.white,
    letterSpacing: 1.5,
  },

  // ── Footer ──
  footerRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
  },

  footerText: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
  },

  footerLink: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.primary,
  },
});
