// ─────────────────────────────────────────────
// OutfitDetailScreen
// Shows a full view of a single outfit with:
//   - 2×2 clothing grid
//   - Style tags
//   - Pieces list (images + names)
//   - Favorite toggle
//   - Worn dates history
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
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
import { getAllItems, getAllOutfits, toggleOutfitFavorite } from '../services/storageService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_SIZE    = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2;

export default function OutfitDetailScreen({ route, navigation }) {
  const { outfitId } = route.params;

  const [outfit,    setOutfit]    = useState(null);
  const [items,     setItems]     = useState([]);

  // ── Load outfit + items ───────────────────────
  useEffect(() => {
    async function load() {
      const [allOutfits, allItems] = await Promise.all([
        getAllOutfits(),
        getAllItems(),
      ]);
      const found = allOutfits.find(o => o.id === outfitId);
      setOutfit(found || null);
      setItems(allItems);
    }
    load();
  }, [outfitId]);

  if (!outfit) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Outfit not found.</Text>
      </SafeAreaView>
    );
  }

  // ── Resolve item objects ──────────────────────
  const outfitItems = outfit.itemIds
    ?.map(id => items.find(i => i.id === id))
    .filter(Boolean) || [];

  const jacket = outfitItems.find(i => i.category === 'jacket');
  const top    = outfitItems.find(i => i.category === 'top');
  const bottom = outfitItems.find(i => i.category === 'bottom');
  const shoes  = outfitItems.find(i => i.category === 'shoes');
  const grid   = [jacket, bottom, top, shoes];

  // ── Toggle favorite ───────────────────────────
  async function handleToggleFavorite() {
    await toggleOutfitFavorite(outfit.id);
    setOutfit(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  }

  // ── Format worn date ──────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Back ─────────────────────────────── */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Outfit name ──────────────────────── */}
        <View style={styles.titleRow}>
          <Text style={styles.outfitName}>{outfit.name}</Text>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Text style={[styles.heartBtn, outfit.isFavorite && styles.heartActive]}>
              {outfit.isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Style tags ────────────────────────── */}
        <View style={styles.tagsRow}>
          {outfit.tags?.map(tag => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {/* ── 2×2 grid ─────────────────────────── */}
        <View style={styles.grid}>
          {grid.map((item, idx) => (
            <View
              key={idx}
              style={[styles.gridCell, { width: GRID_SIZE, height: GRID_SIZE }]}
            >
              {item ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.gridEmpty} />
              )}
            </View>
          ))}
        </View>

        {/* ── Pieces list ──────────────────────── */}
        <Text style={styles.sectionLabel}>PIECES</Text>
        {outfitItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.pieceRow}
            onPress={() => navigation.navigate('ItemDetail', { item })}
          >
            <Image
              source={{ uri: item.imageUri }}
              style={styles.pieceThumb}
              resizeMode="cover"
            />
            <View style={styles.pieceInfo}>
              <Text style={styles.pieceName}>{item.name}</Text>
              <Text style={styles.pieceCategory}>{item.category}</Text>
            </View>
            <Text style={styles.pieceArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* ── Worn dates ───────────────────────── */}
        {outfit.wornDates && outfit.wornDates.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>
              WORN DATES
            </Text>
            {outfit.wornDates.map((date, idx) => (
              <Text key={idx} style={styles.wornDate}>
                {idx === 0 ? '• Most recently: ' : '• '}{formatDate(date)}
              </Text>
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  backBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
  },

  backText: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.primary,
    fontWeight: '600',
  },

  scrollContent: {
    padding:       SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  titleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.sm,
  },

  outfitName: {
    fontSize:   FONTS.sizeXL,
    fontWeight: '800',
    color:      COLORS.textDark,
    flex:       1,
  },

  heartBtn: {
    fontSize:  32,
    color:     COLORS.textLight,
  },

  heartActive: {
    color: COLORS.primary,
  },

  tagsRow: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            SPACING.sm,
    marginBottom:   SPACING.lg,
  },

  tagPill: {
    backgroundColor:   COLORS.cardBackground,
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
  },

  tagText: {
    fontSize:    FONTS.sizeSM,
    color:       COLORS.textMedium,
    fontWeight:  '600',
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            SPACING.sm,
    justifyContent: 'center',
    marginBottom:   SPACING.xl,
  },

  gridCell: {
    borderRadius:    RADIUS.md,
    overflow:        'hidden',
    backgroundColor: COLORS.cardBackground,
  },

  gridImage: {
    width:  '100%',
    height: '100%',
  },

  gridEmpty: {
    flex:            1,
    backgroundColor: COLORS.inputBackground,
  },

  sectionLabel: {
    fontSize:    FONTS.sizeSM,
    color:       COLORS.textMedium,
    fontWeight:  '700',
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },

  pieceRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBackground,
  },

  pieceThumb: {
    width:        60,
    height:       60,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cardBackground,
  },

  pieceInfo: {
    flex: 1,
  },

  pieceName: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.textDark,
    fontWeight: '600',
  },

  pieceCategory: {
    fontSize:       FONTS.sizeSM,
    color:          COLORS.textLight,
    textTransform:  'capitalize',
  },

  pieceArrow: {
    fontSize: FONTS.sizeLG,
    color:    COLORS.textLight,
  },

  wornDate: {
    fontSize:     FONTS.sizeSM,
    color:        COLORS.textMedium,
    paddingVertical: SPACING.xs,
  },

  notFound: {
    textAlign: 'center',
    fontSize:  FONTS.sizeMD,
    color:     COLORS.textLight,
    marginTop: SPACING.xxl,
  },
});
