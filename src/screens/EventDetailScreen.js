// ─────────────────────────────────────────────
// EventDetailScreen
// Fonts loaded globally in App.js
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

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Image
          source={{ uri: event.imageUri }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.contentCard}>
          <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.text }]}>
              {event.category.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventMeta}>{event.dateLabel} · {event.location}</Text>

          <View style={styles.divider} />

          <Text style={styles.description}>{event.description}</Text>

          {event.dressCode && (
            <View style={styles.dressCodeBox}>
              <Text style={styles.dressCodeLabel}>👔 DRESS CODE</Text>
              <Text style={styles.dressCodeValue}>{event.dressCode}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaBtnText}>I'll Go (Coming Soon)</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

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
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.white,
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
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    letterSpacing: 0.5,
  },

  eventName: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.size2XL,
    color:      COLORS.textDark,
  },

  eventMeta: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
  },

  divider: {
    height:          1,
    backgroundColor: COLORS.cardBackground,
    marginVertical:  SPACING.sm,
  },

  description: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textMedium,
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
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    color:         COLORS.textMedium,
    letterSpacing: 1,
  },

  dressCodeValue: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
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
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.white,
  },
});
