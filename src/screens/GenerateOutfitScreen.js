// ─────────────────────────────────────────────
// GenerateOutfitScreen
// AI prompt-based outfit generator.
// User types a description (e.g. "formal blue cold day"),
// Gemini generates matching outfits, then navigates back
// to DiscoverScreen with the results.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { getAllItems } from '../services/storageService';
import { generateOutfitFromPrompt } from '../services/geminiService';
import { MOCK_OUTFITS } from '../data/mockData';

const EXAMPLE_PROMPTS = [
  'Casual coffee date',
  'Cold weather formal',
  'Bold colorful brunch',
  'Smart casual work day',
];

export default function GenerateOutfitScreen({ navigation }) {
  const [prompt,    setPrompt]    = useState('');
  const [loading,   setLoading]   = useState(false);

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const items = await getAllItems();

      const aiOutfits = await generateOutfitFromPrompt({
        items,
        prompt: trimmed,
        outfitCount: 3,
      });

      let resolvedOutfits;
      if (aiOutfits && aiOutfits.length > 0) {
        resolvedOutfits = aiOutfits.map((suggestion, idx) => ({
          id:         `gen_outfit_${Date.now()}_${idx}`,
          name:       suggestion.name,
          tags:       suggestion.tags,
          itemIds:    suggestion.itemIds,
          style:      suggestion.style,
          isFavorite: false,
          wornDates:  [],
          aiScore:    0.9,
          reason:     suggestion.reason,
        }));
      } else {
        // Fallback to mock outfits if API unavailable
        resolvedOutfits = MOCK_OUTFITS.slice(0, 3);
      }

      // Format the theme: take user's prompt, uppercase it
      const theme = trimmed.toUpperCase() + ' OUTFITS';

      navigation.navigate('DiscoverHome', {
        generatedOutfits: resolvedOutfits,
        theme,
      });
    } catch (err) {
      console.error('handleGenerate error:', err);
      navigation.navigate('DiscoverHome', {
        generatedOutfits: MOCK_OUTFITS.slice(0, 3),
        theme: prompt.trim().toUpperCase() + ' OUTFITS',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.brandName}>ALURÉ</Text>
          <View style={styles.topBarIcon} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Headline ── */}
          <View style={styles.headlineRow}>
            <Ionicons name="sparkles" size={28} color={COLORS.primary} />
            <Text style={styles.headlineText}>AI STYLIST</Text>
          </View>
          <Text style={styles.subText}>
            Describe the vibe, occasion, or look you want and we'll pull outfits from your wardrobe.
          </Text>

          {/* ── Prompt Input ── */}
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="e.g. formal blue for a cold camping day..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="done"
              blurOnSubmit
            />
          </View>

          {/* ── Example prompts ── */}
          <Text style={styles.examplesLabel}>TRY THESE</Text>
          <View style={styles.examplesRow}>
            {EXAMPLE_PROMPTS.map(ex => (
              <TouchableOpacity
                key={ex}
                style={styles.exampleChip}
                onPress={() => setPrompt(ex)}
              >
                <Text style={styles.exampleChipText}>{ex}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Generate Button ── */}
          <TouchableOpacity
            style={[styles.generateButton, (!prompt.trim() || loading) && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={!prompt.trim() || loading}
            accessibilityLabel="Generate outfit"
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color={COLORS.white} />
                <Text style={styles.generateButtonText}>GENERATE OUTFIT</Text>
              </>
            )}
          </TouchableOpacity>

          {loading && (
            <Text style={styles.loadingHint}>Styling your look...</Text>
          )}
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

  // ── Top bar ──
  topBar: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryLight,
  },

  backButton: {
    width:           36,
    height:          36,
    alignItems:      'center',
    justifyContent:  'center',
  },

  topBarIcon: {
    width:  36,
    height: 36,
  },

  brandName: {
    fontFamily:    FONTS.brand,
    fontSize:      FONTS.sizeXL,
    color:         COLORS.textDark,
    letterSpacing: 3,
  },

  // ── Content ──
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xl,
    paddingBottom:     SPACING.xxl,
  },

  headlineRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
    marginBottom:  SPACING.sm,
  },

  headlineText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.size2XL,
    color:         COLORS.textDark,
    letterSpacing: 2,
  },

  subText: {
    fontFamily:   FONTS.regular,
    fontSize:     FONTS.sizeMD,
    color:        COLORS.textMedium,
    lineHeight:   22,
    marginBottom: SPACING.xl,
  },

  // ── Input ──
  inputCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.lg,
    minHeight:       120,
    ...SHADOW.small,
  },

  input: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
    lineHeight: 22,
    flex:       1,
  },

  // ── Example chips ──
  examplesLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    color:         COLORS.textLight,
    letterSpacing: 1.5,
    marginBottom:  SPACING.sm,
  },

  examplesRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
    marginBottom:  SPACING.xl,
  },

  exampleChip: {
    backgroundColor:   COLORS.white,
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    ...SHADOW.small,
  },

  exampleChipText: {
    fontFamily: FONTS.medium,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textDark,
  },

  // ── Generate button ──
  generateButton: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.lg,
    paddingVertical: SPACING.md,
    ...SHADOW.medium,
  },

  generateButtonDisabled: {
    opacity: 0.5,
  },

  generateButtonText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeMD,
    color:         COLORS.white,
    letterSpacing: 1,
  },

  loadingHint: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    fontStyle:  'italic',
    textAlign:  'center',
    marginTop:  SPACING.md,
  },
});
