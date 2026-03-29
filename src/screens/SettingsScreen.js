// ─────────────────────────────────────────────
// SettingsScreen
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const STYLE_TAGS = ['Bold', 'Colorful', 'Comfy', 'Smart', 'Casual', 'Formal'];

export default function SettingsScreen({ navigation }) {
  const { user, login, logout } = useAuth();

  const [name,           setName]           = useState(user?.name  || '');
  const [email,          setEmail]          = useState(user?.email || '');
  const [selectedStyles, setSelectedStyles] = useState(user?.styles || []);
  const [saved,          setSaved]          = useState(false);

  function toggleStyle(tag) {
    setSelectedStyles(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setSaved(false);
  }

  async function handleSave() {
    await login({ ...user, name: name.trim(), email: email.trim(), styles: selectedStyles });
    setSaved(true);
  }

  function handleLogout() {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: logout },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Profile ── */}
        <Text style={styles.sectionLabel}>PROFILE</Text>
        <View style={styles.card}>

          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {(name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.avatarName}>{name || 'Your Name'}</Text>
              <Text style={styles.avatarEmail}>{email || 'your@email.com'}</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>NAME</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={t => { setName(t); setSaved(false); }}
              placeholder="Your name"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.fieldLabel}>EMAIL</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={16} color={COLORS.textLight} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={t => { setEmail(t); setSaved(false); }}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* ── Style Preferences ── */}
        <Text style={styles.sectionLabel}>STYLE PREFERENCES</Text>
        <View style={styles.card}>
          <Text style={styles.cardSub}>
            These are used to personalise your outfit suggestions.
          </Text>
          <View style={styles.tagsWrap}>
            {STYLE_TAGS.map(tag => {
              const active = selectedStyles.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, active && styles.tagActive]}
                  onPress={() => toggleStyle(tag)}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Save button ── */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          {saved ? (
            <>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
              <Text style={styles.saveBtnText}>SAVED</Text>
            </>
          ) : (
            <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
          )}
        </TouchableOpacity>

        {/* ── App info ── */}
        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.textMedium} />
            <Text style={styles.infoText}>ALURÉ — Version 1.0.0</Text>
          </View>
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => navigation.navigate('Help')}
          >
            <Ionicons name="help-circle-outline" size={18} color={COLORS.textMedium} />
            <Text style={styles.infoText}>Help & FAQ</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.negative} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  // ── Header ──
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
  },

  headerTitle: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeLG,
    color:         COLORS.textDark,
    letterSpacing: 2,
  },

  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.xxl,
  },

  // ── Section label ──
  sectionLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    color:         COLORS.textMedium,
    letterSpacing: 1.5,
    marginBottom:  SPACING.sm,
    marginTop:     SPACING.md,
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    ...SHADOW.small,
    marginBottom:    SPACING.sm,
  },

  cardSub: {
    fontFamily:   FONTS.regular,
    fontSize:     FONTS.sizeSM,
    color:        COLORS.textMedium,
    marginBottom: SPACING.md,
  },

  // ── Avatar ──
  avatarRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.md,
    marginBottom:  SPACING.lg,
  },

  avatar: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },

  avatarInitial: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeXL,
    color:      COLORS.white,
  },

  avatarName: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
  },

  avatarEmail: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
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

  // ── Style tags ──
  tagsWrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
  },

  tag: {
    borderWidth:       1.5,
    borderColor:       COLORS.primaryLight,
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
  },

  tagActive: {
    backgroundColor: COLORS.primary,
    borderColor:     COLORS.primary,
  },

  tagText: {
    fontFamily: FONTS.medium,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
  },

  tagTextActive: {
    color: COLORS.white,
  },

  // ── Save button ──
  saveBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING.sm,
    backgroundColor: COLORS.textDark,
    borderRadius:    RADIUS.full,
    paddingVertical: SPACING.md,
    marginTop:       SPACING.sm,
    marginBottom:    SPACING.md,
    ...SHADOW.small,
  },

  saveBtnText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeMD,
    color:         COLORS.white,
    letterSpacing: 1,
  },

  // ── Info rows ──
  infoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
    paddingVertical: SPACING.sm,
  },

  infoText: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
  },

  // ── Logout ──
  logoutBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               SPACING.sm,
    borderWidth:       1.5,
    borderColor:       COLORS.negative,
    borderRadius:      RADIUS.full,
    paddingVertical:   SPACING.md,
    marginTop:         SPACING.sm,
  },

  logoutText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.negative,
    letterSpacing: 0.5,
  },
});
