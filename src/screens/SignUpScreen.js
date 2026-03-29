// ─────────────────────────────────────────────
// SignUpScreen
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

export default function SignUpScreen({ navigation }) {
  const { login } = useAuth();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const canSubmit = name.trim() && email.trim() && !loading;

  async function handleSignUp() {
    if (!canSubmit) return;
    setLoading(true);
    await login({ name: name.trim(), email: email.trim(), isNewUser: true });
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

          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.brand}>ALURÉ</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* ── Headline ── */}
          <Text style={styles.headline}>Create{'\n'}your closet</Text>
          <Text style={styles.sub}>Set up your ALURÉ account to get started</Text>

          {/* ── Fields ── */}
          <View style={styles.form}>

            <Text style={styles.fieldLabel}>YOUR NAME</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Alex"
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

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
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.createBtn, !canSubmit && { opacity: 0.5 }]}
              onPress={handleSignUp}
              disabled={!canSubmit}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.createBtnText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Login link ── */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Sign in</Text>
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
  },

  // ── Top bar ──
  topBar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingTop:     SPACING.md,
    marginBottom:   SPACING.xl,
  },

  brand: {
    fontFamily:    FONTS.brand,
    fontSize:      22,
    letterSpacing: 5,
    color:         COLORS.textDark,
  },

  // ── Headline ──
  headline: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.size3XL,
    color:         COLORS.textDark,
    lineHeight:    FONTS.size3XL * 1.1,
    letterSpacing: 1,
    marginBottom:  SPACING.sm,
  },

  sub: {
    fontFamily:   FONTS.regular,
    fontSize:     FONTS.sizeMD,
    color:        COLORS.textMedium,
    marginBottom: SPACING.xl,
  },

  // ── Form ──
  form: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.lg,
    ...SHADOW.medium,
    marginBottom:    SPACING.xl,
  },

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

  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems:      'center',
    marginTop:       SPACING.sm,
    ...SHADOW.small,
  },

  createBtnText: {
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
