// ─────────────────────────────────────────────
// HelpScreen — FAQ & Getting Started
// Fonts loaded globally in App.js
// ─────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      {
        q: 'What is ALURÉ?',
        a: 'ALURÉ is your personal style assistant. It helps you:\n• Organize your closet\n• Create outfits instantly\n• Discover event-based outfit ideas\n• Track what you\'ve worn',
      },
      {
        q: 'How do I add clothes to My Closet?',
        a: '1. Go to Closet\n2. Tap the + button\n3. Upload or take a photo\n4. Add tags (color, type, style)\n5. Save\n\n💡 Tip: Use clear backgrounds for better outfit suggestions.',
      },
      {
        q: 'How does "Today\'s Outfits" work?',
        a: 'We generate outfits based on:\n• Your saved clothes\n• Style filters (Bold, Colorful, Comfy)\n• Weather conditions',
      },
    ],
  },
  {
    title: 'Closet & Organization',
    items: [
      {
        q: 'Can I categorize my clothes?',
        a: 'Yes — items are automatically sorted into:\n• Tops\n• Bottoms\n• Jackets\n• Suits\n\nYou can also filter by color or style.',
      },
      {
        q: 'Can I edit or delete items?',
        a: 'Yes:\n• Tap on any item\n• Select Edit or Delete',
      },
    ],
  },
  {
    title: 'Outfits',
    items: [
      {
        q: 'How do I create an outfit?',
        a: '1. Go to Outfits\n2. Tap Create / +\n3. Select items from your closet\n4. Save it as a favorite',
      },
      {
        q: 'What are "Favorites" and "Previously Worn"?',
        a: '• Favorites → Your saved go-to outfits\n• Previously Worn → Tracks outfits you\'ve already used',
      },
      {
        q: 'Can I reuse outfits?',
        a: 'Yes — just tap any saved outfit and wear it again.',
      },
    ],
  },
  {
    title: 'Events Feature',
    items: [
      {
        q: 'What is "Events Near You"?',
        a: 'This feature shows:\n• Local events (parties, exhibitions, socials)\n• Time & location\n• Suggested outfit inspiration',
      },
      {
        q: 'How are events personalized?',
        a: 'We use:\n• Your location\n• Your style preferences',
      },
    ],
  },
  {
    title: 'Recommendations & Styling',
    items: [
      {
        q: 'How are outfit suggestions generated?',
        a: 'Outfits are based on:\n• Color matching\n• Style compatibility\n• Weather conditions\n• Your past choices',
      },
      {
        q: 'Can I control my style preferences?',
        a: 'Yes — use filters like:\n• Bold\n• Colorful\n• Comfy',
      },
    ],
  },
  {
    title: 'Account & Settings',
    items: [
      {
        q: 'Do I need an account?',
        a: 'Yes, to:\n• Save your closet\n• Sync outfits\n• Get personalized recommendations',
      },
      {
        q: 'Will my data be saved?',
        a: 'Yes — securely stored and synced across your device.',
      },
    ],
  },
  {
    title: 'Troubleshooting',
    items: [
      {
        q: 'Outfits not generating properly?',
        a: 'Try:\n• Adding more clothing items\n• Using clearer photos\n• Checking your filters',
      },
      {
        q: 'Images not uploading?',
        a: '• Check internet connection\n• Try a smaller image size',
      },
      {
        q: 'App running slow?',
        a: '• Restart the app\n• Update to latest version',
      },
    ],
  },
];

export default function HelpScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close help"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Intro ── */}
        <Text style={styles.brand}>ALURÉ</Text>
        <Text style={styles.tagline}>Your Style, Simplified</Text>

        <View style={styles.divider} />

        {/* ── Sections ── */}
        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            {section.items.map((item, idx) => (
              <View key={idx} style={styles.faqItem}>
                <Text style={styles.question}>{item.q}</Text>
                <Text style={styles.answer}>{item.a}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
  },

  closeBtn: {
    width:          32,
    height:         32,
    alignItems:     'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontFamily:    FONTS.medium,
    fontSize:      FONTS.sizeMD,
    color:         COLORS.textDark,
    letterSpacing: 0.3,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.xxl,
  },

  brand: {
    fontFamily:    FONTS.brand,
    fontSize:      32,
    letterSpacing: 6,
    color:         COLORS.primary,
    textAlign:     'center',
    marginTop:     SPACING.md,
  },

  tagline: {
    fontFamily:   FONTS.regular,
    fontSize:     FONTS.sizeSM,
    color:        COLORS.textMedium,
    textAlign:    'center',
    fontStyle:    'italic',
    marginTop:    SPACING.xs,
    marginBottom: SPACING.lg,
  },

  divider: {
    height:          1,
    backgroundColor: COLORS.cardBackground,
    marginBottom:    SPACING.lg,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  sectionTitle: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    color:         COLORS.primary,
    letterSpacing: 2,
    marginBottom:  SPACING.md,
  },

  faqItem: {
    backgroundColor:   COLORS.cardBackground,
    borderRadius:      RADIUS.md,
    padding:           SPACING.md,
    marginBottom:      SPACING.sm,
  },

  question: {
    fontFamily:   FONTS.bold,
    fontSize:     FONTS.sizeMD,
    color:        COLORS.textDark,
    marginBottom: SPACING.xs,
  },

  answer: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    lineHeight: 20,
  },
});
