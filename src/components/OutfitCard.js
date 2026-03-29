// ─────────────────────────────────────────────
// OutfitCard Component
// Displays a single outfit as a 2x2 grid of
// clothing pieces with action buttons.
//
// Layout (matches Figma spec):
//   [jacket]  [bottom]
//   [top]     [shoes]
// ─────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const CARD_WIDTH  = Dimensions.get('window').width - SPACING.lg * 2;
const CELL_SIZE   = (CARD_WIDTH - SPACING.sm * 3) / 2;   // two columns with a gap

export default function OutfitCard({
  outfit,          // outfit object with itemIds and tags
  items,           // full item list so we can look up images
  onSave,          // () => void  – bookmark pressed
  onEdit,          // () => void  – pencil pressed
  isSaved = false,
}) {
  // Find item objects by category for fixed-position layout
  const jacket = items.find(i => outfit.itemIds.includes(i.id) && i.category === 'jacket');
  const top    = items.find(i => outfit.itemIds.includes(i.id) && i.category === 'top');
  const bottom = items.find(i => outfit.itemIds.includes(i.id) && i.category === 'bottom');
  const shoes  = items.find(i => outfit.itemIds.includes(i.id) && i.category === 'shoes');

  return (
    <View style={styles.card}>

      {/* ── Style tags ─────────────────────── */}
      <View style={styles.tagsRow}>
        {outfit.tags?.map(tag => (
          <View key={tag} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      {/* ── 2×2 clothing grid ──────────────── */}
      <View style={styles.grid}>
        {/* Top-left: jacket (or empty placeholder) */}
        <ClothingCell item={jacket} size={CELL_SIZE} />

        {/* Top-right: bottom (skirt / trousers) */}
        <ClothingCell item={bottom} size={CELL_SIZE} />

        {/* Bottom-left: top (shirt / tee) */}
        <ClothingCell item={top} size={CELL_SIZE} />

        {/* Bottom-right: shoes */}
        <ClothingCell item={shoes} size={CELL_SIZE} />
      </View>

      {/* ── Action icons (save / edit) ─────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSave}
          accessibilityLabel="Save outfit"
        >
          <Text style={[styles.actionIcon, isSaved && { color: COLORS.primary }]}>
            {isSaved ? '🔖' : '🔖'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onEdit}
          accessibilityLabel="Edit outfit"
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Small helper: one grid cell ───────────────
function ClothingCell({ item, size }) {
  return (
    <View style={[styles.cell, { width: size, height: size }]}>
      {item ? (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.cellImage}
          resizeMode="cover"
        />
      ) : (
        // Empty placeholder when category is not in this outfit
        <View style={styles.emptyCell} />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: CARD_WIDTH,
    ...SHADOW.small,
  },

  tagsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },

  tagPill: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },

  tagText: {
    fontSize: FONTS.sizeSM,
    color: COLORS.textDark,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },

  cell: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.inputBackground,
  },

  cellImage: {
    width: '100%',
    height: '100%',
  },

  emptyCell: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  iconButton: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.small,
  },

  actionIcon: {
    fontSize: 18,
  },
});
