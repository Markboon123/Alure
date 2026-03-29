// ─────────────────────────────────────────────
// FilterModal Component
// Fonts loaded globally in App.js
// ─────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

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
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>
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

          <Text style={styles.sectionLabel}>SORT BY</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={styles.sortRow}
              onPress={() => onSortChange(opt.key)}
            >
              <Text style={styles.sortLabel}>{opt.label}</Text>
              <View style={[styles.radio, sortBy === opt.key && styles.radioSelected]}>
                {sortBy === opt.key && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>
            FILTER BY TAGS
          </Text>
          <View style={styles.tagsWrap}>
            {allTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagPill, activeTags.includes(tag) && styles.tagPillActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, activeTags.includes(tag) && styles.tagTextActive]}>
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

const styles = StyleSheet.create({
  backdrop: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  sheet: {
    backgroundColor:      COLORS.background,
    borderTopLeftRadius:  RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight:            '75%',
    paddingBottom:        SPACING.xxl,
  },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryLight,
  },

  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeLG,
    color:      COLORS.textDark,
  },

  resetText: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textMedium,
  },

  doneText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.primary,
  },

  content: {
    padding: SPACING.lg,
  },

  sectionLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeSM,
    color:         COLORS.textMedium,
    letterSpacing: 2,
    marginBottom:  SPACING.sm,
  },

  sortRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingVertical:   SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBackground,
  },

  sortLabel: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
  },

  radio: {
    width:          22,
    height:         22,
    borderRadius:   RADIUS.full,
    borderWidth:    2,
    borderColor:    COLORS.primaryLight,
    alignItems:     'center',
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
    fontFamily: FONTS.medium,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
  },

  tagTextActive: {
    color: COLORS.white,
  },
});
