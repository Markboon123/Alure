// ─────────────────────────────────────────────
// EventDetailScreen
// Expanded view of a single event with:
//   - Hero image
//   - Category + name + details
//   - Dress code suggestion
//   - "I'll Go" button (placeholder / future)
// ─────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORY_STYLE = {
  Culture:   { bg: COLORS.cultureBadge,   text: COLORS.cultureText },
  Nightlife: { bg: COLORS.nightlifeBadge, text: COLORS.nightlifeText },
  Social:    { bg: COLORS.socialBadge,    text: COLORS.socialText },
  Casual:    { bg: COLORS.casualBadge,    text: COLORS.casualText },
};

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const catStyle = CATEGORY_STYLE[event.category] || CATEGORY_STYLE.Casual;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Back ─────────────────────────────── */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Hero image ────────────────────── */}
        <Image
          source={{ uri: event.imageUri }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* ── Content card ─────────────────── */}
        <View style={styles.contentCard}>
          {/* Category badge */}
          <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.text }]}>
              {event.category.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventMeta}>{event.dateLabel} · {event.location}</Text>

          <View style={styles.divider} />

          <Text style={styles.description}>{event.description}</Text>

          {/* Dress code */}
          {event.dressCode && (
            <View style={styles.dressCodeBox}>
              <Text style={styles.dressCodeLabel}>👔 DRESS CODE</Text>
              <Text style={styles.dressCodeValue}>{event.dressCode}</Text>
            </View>
          )}
        </View>

        {/* ── CTA (placeholder) ──────────────── */}
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaBtnText}>I'll Go (Coming Soon)</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.black,
  },

  backBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
  },

  backText: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.white,
    fontWeight: '600',
  },

  scrollContent: {
    paddingBottom: SPACING.xxl,
  },

  heroImage: {
    width:        SCREEN_WIDTH,
    height:       250,
    marginBottom: SPACING.md,
  },

  contentCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor:  COLORS.white,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.lg,
    gap:              SPACING.sm,
    ...SHADOW.medium,
    marginBottom:     SPACING.lg,
  },

  categoryBadge: {
    alignSelf:         'flex-start',
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical:   3,
  },

  categoryText: {
    fontSize:  FONTS.sizeXS,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  eventName: {
    fontSize:   FONTS.size2XL,
    fontWeight: '800',
    color:      COLORS.textDark,
  },

  eventMeta: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.textMedium,
  },

  divider: {
    height:          1,
    backgroundColor: COLORS.cardBackground,
    marginVertical:  SPACING.sm,
  },

  description: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.textMedium,
    lineHeight: FONTS.sizeMD * 1.6,
  },

  dressCodeBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    gap:             SPACING.xs,
    marginTop:       SPACING.sm,
  },

  dressCodeLabel: {
    fontSize:    FONTS.sizeXS,
    color:       COLORS.textMedium,
    fontWeight:  '700',
    letterSpacing: 1,
  },

  dressCodeValue: {
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
    fontWeight: '600',
  },

  ctaBtn: {
    marginHorizontal: SPACING.lg,
    backgroundColor:  COLORS.primary,
    borderRadius:     RADIUS.full,
    paddingVertical:  SPACING.md,
    alignItems:       'center',
    ...SHADOW.medium,
  },

  ctaBtnText: {
    fontSize:   FONTS.sizeMD,
    color:      COLORS.white,
    fontWeight: '700',
  },
});
