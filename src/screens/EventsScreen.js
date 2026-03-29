// ─────────────────────────────────────────────
// EventsScreen  (fourth tab)
// Fonts loaded globally in App.js
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { MOCK_EVENTS } from '../data/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORY_STYLE = {
  Culture:   { bg: COLORS.cultureBadge,   text: COLORS.cultureText },
  Nightlife: { bg: COLORS.nightlifeBadge, text: COLORS.nightlifeText },
  Social:    { bg: COLORS.socialBadge,    text: COLORS.socialText },
  Casual:    { bg: COLORS.casualBadge,    text: COLORS.casualText },
};

const BUCKETS = [
  { key: 'tonight', label: 'Tonight' },
  { key: 'weekend', label: 'This Weekend' },
  { key: 'week',    label: 'This Week' },
];

export default function EventsScreen({ navigation }) {
  const [activeBucket, setActiveBucket] = useState(null);

  const events = MOCK_EVENTS;

  function renderSection(bucket) {
    const sectionEvents = events.filter(e => e.bucket === bucket.key);
    if (sectionEvents.length === 0) return null;

    return (
      <View key={bucket.key} style={styles.section}>
        <Text style={styles.sectionLabel}>{bucket.label.toUpperCase()}</Text>
        {sectionEvents.map(event => renderEventCard(event))}
      </View>
    );
  }

  function renderEventCard(event) {
    const catStyle = CATEGORY_STYLE[event.category] || CATEGORY_STYLE.Casual;

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetail', { event })}
        accessibilityLabel={`View event: ${event.name}`}
      >
        <Image
          source={{ uri: event.imageUri }}
          style={styles.eventThumb}
          resizeMode="cover"
        />

        <View style={styles.eventContent}>
          <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.text }]}>
              {event.category.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventMeta}>{event.dateLabel}</Text>
          <Text style={styles.eventLocation}>{event.location}</Text>
        </View>

        <Text style={styles.eventArrow}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Hero header ── */}
      <View style={styles.heroHeader}>
        <Text style={styles.heroTitle}>EVENTS{'\n'}NEAR YOU</Text>
      </View>

      {/* ── Bucket filter tabs ── */}
      <View style={styles.bucketRow}>
        <TouchableOpacity
          style={[styles.bucketTab, !activeBucket && styles.bucketTabActive]}
          onPress={() => setActiveBucket(null)}
        >
          <Text style={[styles.bucketTabText, !activeBucket && styles.bucketTabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {BUCKETS.map(b => (
          <TouchableOpacity
            key={b.key}
            style={[styles.bucketTab, activeBucket === b.key && styles.bucketTabActive]}
            onPress={() => setActiveBucket(prev => prev === b.key ? null : b.key)}
          >
            <Text style={[
              styles.bucketTabText,
              activeBucket === b.key && styles.bucketTabTextActive,
            ]}>
              {b.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Events list ── */}
      <FlatList
        data={activeBucket ? [activeBucket] : BUCKETS.map(b => b.key)}
        keyExtractor={k => k}
        renderItem={({ item: bucketKey }) => {
          if (activeBucket) {
            return (
              <View style={styles.flatSection}>
                {events.filter(e => e.bucket === bucketKey).map(renderEventCard)}
              </View>
            );
          }
          const bucket = BUCKETS.find(b => b.key === bucketKey);
          return bucket ? renderSection(bucket) : null;
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.black,
  },

  heroHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.lg,
    paddingBottom:     SPACING.md,
  },

  heroTitle: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.size3XL * 1.1,
    color:         COLORS.white,
    lineHeight:    FONTS.size3XL * 1.2,
    letterSpacing: 1,
  },

  bucketRow: {
    flexDirection:     'row',
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.sm,
    marginBottom:      SPACING.md,
    flexWrap:          'wrap',
  },

  bucketTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    borderRadius:      RADIUS.full,
    backgroundColor:   'rgba(255,255,255,0.1)',
  },

  bucketTabActive: {
    backgroundColor: COLORS.white,
  },

  bucketTabText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeSM,
    color:      'rgba(255,255,255,0.7)',
  },

  bucketTabTextActive: {
    color: COLORS.black,
  },

  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.xxl,
  },

  section: {
    marginBottom: SPACING.lg,
  },

  flatSection: {
    gap: SPACING.sm,
  },

  sectionLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeSM,
    color:         'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom:  SPACING.sm,
  },

  eventCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.white,
    borderRadius:    RADIUS.md,
    overflow:        'hidden',
    marginBottom:    SPACING.sm,
    ...SHADOW.small,
  },

  eventThumb: {
    width:  100,
    height: 90,
  },

  eventContent: {
    flex:    1,
    padding: SPACING.sm,
    gap:     SPACING.xs,
  },

  categoryBadge: {
    alignSelf:         'flex-start',
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical:   2,
  },

  categoryText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    letterSpacing: 0.5,
  },

  eventName: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
  },

  eventMeta: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
  },

  eventLocation: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textLight,
  },

  eventArrow: {
    fontSize:     FONTS.sizeXL,
    color:        COLORS.textLight,
    paddingRight: SPACING.sm,
  },
});
