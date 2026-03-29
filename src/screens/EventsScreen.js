// ─────────────────────────────────────────────
// EventsScreen  (fourth tab)
// Fonts loaded globally in App.js
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { MOCK_EVENTS } from '../data/mockData';

const CATEGORY_STYLE = {
  Culture:   { bg: COLORS.cultureBadge,   text: COLORS.cultureText },
  Nightlife: { bg: COLORS.nightlifeBadge, text: COLORS.nightlifeText },
  Social:    { bg: COLORS.socialBadge,    text: COLORS.socialText },
  Casual:    { bg: COLORS.casualBadge,    text: COLORS.casualText },
};

const WEEKEND_TABS = [
  { key: 'weekend', label: 'This Weekend' },
  { key: 'week',    label: 'This Week' },
];

export default function EventsScreen({ navigation }) {
  const [weekendTab, setWeekendTab] = useState('weekend');

  const tonightEvents = MOCK_EVENTS.filter(e => e.bucket === 'tonight');
  const mainEvents    = MOCK_EVENTS.filter(e => e.bucket === weekendTab);

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

        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} style={styles.arrow} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Top nav bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.brandName}>ALURÉ</Text>

        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Help"
        >
          <Ionicons name="help-circle-outline" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero header ── */}
        <Text style={styles.heroTitle}>Events Near You</Text>

        {/* ── Tonight section ── */}
        {tonightEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TONIGHT</Text>
            {tonightEvents.map(renderEventCard)}
          </View>
        )}

        {/* ── Weekend / Week toggle section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            {WEEKEND_TABS.map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setWeekendTab(tab.key)}>
                <Text style={[
                  styles.sectionLabel,
                  weekendTab !== tab.key && styles.sectionLabelInactive,
                ]}>
                  {tab.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {mainEvents.map(renderEventCard)}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.sm,
    paddingBottom:     SPACING.xxl + 40,
  },

  topBar: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm + 2,
  },

  brandName: {
    fontFamily:    FONTS.brand,
    fontSize:      22,
    letterSpacing: 5,
    color:         COLORS.textDark,
  },

  heroTitle: {
    fontFamily:   FONTS.medium,
    fontSize:     34,
    color:        COLORS.textDark,
    marginBottom: SPACING.lg,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    gap:           SPACING.lg,
    marginBottom:  SPACING.sm,
  },

  sectionLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeSM,
    color:         COLORS.textDark,
    letterSpacing: 2,
    marginBottom:  SPACING.sm,
  },

  sectionLabelInactive: {
    color: COLORS.textLight,
  },

  eventCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    overflow:        'hidden',
    marginBottom:    SPACING.sm,
    ...SHADOW.small,
  },

  eventThumb: {
    width:  110,
    height: 95,
  },

  eventContent: {
    flex:    1,
    padding: SPACING.md,
    gap:     3,
  },

  categoryBadge: {
    alignSelf:         'flex-start',
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical:   3,
    marginBottom:      2,
  },

  categoryText: {
    fontFamily:    FONTS.bold,
    fontSize:      9,
    letterSpacing: 0.6,
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

  arrow: {
    paddingRight: SPACING.md,
  },
});
