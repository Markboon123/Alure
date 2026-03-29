// ─────────────────────────────────────────────
// FilterModal Component
// Bottom-sheet style modal for sorting and
// filtering the closet grid.
//
// Sort options:  Newest Added | Most Worn | Least Worn
// Filter options: by tag (collected from all items)
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const SORT_OPTIONS = [
  { key: 'newest',    label: 'Newest Added' },
  { key: 'mostWorn',  label: 'Most Worn' },
  { key: 'leastWorn', label: 'Least Worn' },
];

export default function FilterModal({
  visible,
  onClose,
  sortBy,
  onSortChange,
  activeTags,
  onTagsChange,
  allItems = [],
}) {
  // Collect unique tags from all items
  const allTags = [...new Set(allItems.flatMap(i => i.tags || []))].sort();

  function toggleTag(tag) {
    if (activeTags.includes(tag)) {
      onTagsChange(activeTags.filter(t => t !== tag));
    } else {
      onTagsChange([...activeTags, tag]);
    }
  }

  function handleReset() {
    onSortChange('newest');
    onTagsChange([]);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* ── Backdrop ────────────────────────── */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* ── Sheet ───────────────────────────── */}
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sort & Filter</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>

          {/* ── Sort ─────────────────────────── */}
          <Text style={styles.sectionLabel}>SORT BY</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={styles.sortRow}
              onPress={() => onSortChange(opt.key)}
            >
              <Text style={styles.sortLabel}>{opt.label}</Text>
              <View style={[
                styles.radio,
                sortBy === opt.key && styles.radioSelected,
              ]}>
                {sortBy === opt.key && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* ── Tags ─────────────────────────── */}
          <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>
            FILTER BY TAGS
          </Text>
          <View style={styles.tagsWrap}>
            {allTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagPill,
                  activeTags.includes(tag) && styles.tagPillActive,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  activeTags.includes(tag) && styles.tagTextActive,
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  sheet: {
    backgroundColor:  COLORS.background,
    borderTopLeftRadius:  RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight:        '75%',
    paddingBottom:    SPACING.xxl,
  },

  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryLight,
  },

  headerTitle: {
    fontSize:   FONTS.sizeLG,
    fontWeight: '700',
    color:      COLORS.textDark,
  },

  resetText: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.textMedium,
  },

  doneText: {
    fontSize:   FONTS.sizeMD,
    color:      COLORS.primary,
    fontWeight: '700',
  },

  content: {
    padding: SPACING.lg,
  },

  sectionLabel: {
    fontSize:    FONTS.sizeSM,
    color:       COLORS.textMedium,
    fontWeight:  '700',
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },

  sortRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBackground,
  },

  sortLabel: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.textDark,
  },

  radio: {
    width:        22,
    height:       22,
    borderRadius: RADIUS.full,
    borderWidth:  2,
    borderColor:  COLORS.primaryLight,
    alignItems:   'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioDot: {
    width:           10,
    height:          10,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.primary,
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
  },

  tagPill: {
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    backgroundColor:   COLORS.cardBackground,
    borderWidth:       1,
    borderColor:       COLORS.primaryLight,
  },

  tagPillActive: {
    backgroundColor: COLORS.primary,
    borderColor:     COLORS.primary,
  },

  tagText: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.textMedium,
    fontWeight: '500',
  },

  tagTextActive: {
    color: COLORS.white,
  },
});
