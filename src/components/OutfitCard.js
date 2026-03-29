// ─────────────────────────────────────────────
// OutfitCard Component
// Fonts loaded globally in App.js
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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const CARD_WIDTH = Dimensions.get('window').width - SPACING.lg * 2;
const CELL_SIZE  = (CARD_WIDTH - SPACING.sm * 3) / 2 - 10;

export default function OutfitCard({
  outfit,
  items,
  onSave,
  onEdit,
  isSaved = false,
}) {
  const jacket = items.find(i => outfit.itemIds.includes(i.id) && i.category === 'jacket');
  const top    = items.find(i => outfit.itemIds.includes(i.id) && i.category === 'top');
  const bottom = items.find(i => outfit.itemIds.includes(i.id) && i.category === 'bottom');
  const shoes  = items.find(i => outfit.itemIds.includes(i.id) && i.category === 'shoes');

  // Fill empty slots with accessories or any unassigned items
  const assignedIds = new Set([jacket?.id, top?.id, bottom?.id, shoes?.id].filter(Boolean));
  const extras = items.filter(i => outfit.itemIds.includes(i.id) && !assignedIds.has(i.id));
  let extraIdx = 0;
  const [slot1, slot2, slot3, slot4] = [jacket, bottom, top, shoes].map(
    slot => slot ?? (extras[extraIdx++] || null)
  );

  return (
    <View style={styles.card}>

      {/* ── Style tags ── */}
      <View style={styles.tagsRow}>
        {outfit.tags?.map(tag => (
          <View key={tag} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      {/* ── 2×2 clothing grid ── */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <ClothingCell item={slot1} size={CELL_SIZE} />
          <ClothingCell item={slot2} size={CELL_SIZE} />
        </View>
        <View style={styles.gridRow}>
          <ClothingCell item={slot3} size={CELL_SIZE} />
          <ClothingCell item={slot4} size={CELL_SIZE} />
        </View>
      </View>

      {/* ── Action icons ── */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSave}
          accessibilityLabel="Save outfit"
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={19}
            color={isSaved ? COLORS.primary : COLORS.textMedium}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onEdit}
          accessibilityLabel="Edit outfit"
        >
          <Ionicons name="pencil-outline" size={19} color={COLORS.textMedium} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ClothingCell({ item, size }) {
  return (
    <View style={[styles.cell, { width: size }]}>
      {item ? (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.cellImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.emptyCell} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex:            1,
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    width:           CARD_WIDTH,
    ...SHADOW.small,
  },

  tagsRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    marginBottom:  SPACING.sm,
  },

  tagPill: {
    backgroundColor:   COLORS.white,
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
  },

  tagText: {
    fontFamily:    FONTS.medium,
    fontSize:      FONTS.sizeSM,
    color:         COLORS.textDark,
    letterSpacing: 0.5,
  },

  grid: {
    flex: 1,
    gap:  SPACING.sm,
  },

  gridRow: {
    flex:          1,
    flexDirection: 'row',
    gap:           SPACING.sm,
  },

  cell: {
    flex:            1,
    borderRadius:    RADIUS.md,
    overflow:        'hidden',
    backgroundColor: COLORS.inputBackground,
  },

  cellImage: {
    width:  '100%',
    height: '100%',
  },

  emptyCell: {
    flex:            1,
    backgroundColor: COLORS.inputBackground,
  },

  actionRow: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    gap:            SPACING.sm,
    marginTop:      SPACING.sm,
  },

  iconButton: {
    backgroundColor: COLORS.white,
    borderRadius:    RADIUS.full,
    width:           40,
    height:          40,
    alignItems:      'center',
    justifyContent:  'center',
    ...SHADOW.small,
  },

});
