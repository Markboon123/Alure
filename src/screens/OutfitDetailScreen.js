// ─────────────────────────────────────────────
// OutfitDetailScreen — redesigned to match Figma
// Fonts loaded globally in App.js
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import {
  getAllItems,
  getAllOutfits,
  toggleOutfitFavorite,
  markOutfitWorn,
  deleteOutfit,
} from '../services/storageService';

// ── Derive a "Curated for" label from tags ─────
function getCuratedFor(tags = []) {
  const lower = tags.map(t => t.toLowerCase());
  if (lower.some(t => ['evening', 'formal', 'elegant', 'dinner', 'gala'].includes(t)))
    return 'Evening Events';
  if (lower.some(t => ['night', 'nightlife', 'party', 'club'].includes(t)))
    return 'Night Out';
  if (lower.some(t => ['work', 'business', 'office', 'professional'].includes(t)))
    return 'Work & Business';
  if (lower.some(t => ['active', 'sport', 'gym', 'athletic'].includes(t)))
    return 'Active Days';
  if (lower.some(t => ['streetwear', 'urban', 'bold', 'edgy'].includes(t)))
    return 'Street Style Moments';
  if (lower.some(t => ['modern', 'minimal', 'sleek', 'classic'].includes(t)))
    return 'Everyday Sophistication';
  if (lower.some(t => ['casual', 'comfy', 'weekend', 'relaxed'].includes(t)))
    return 'Casual Outings';
  return 'Any Occasion';
}

// ── Format last-worn date ─────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function OutfitDetailScreen({ route, navigation }) {
  const { outfitId } = route.params;

  const [outfit, setOutfit] = useState(null);
  const [items,  setItems]  = useState([]);

  useEffect(() => {
    async function load() {
      const [allOutfits, allItems] = await Promise.all([getAllOutfits(), getAllItems()]);
      setOutfit(allOutfits.find(o => o.id === outfitId) || null);
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

  const outfitItems = (outfit.itemIds || [])
    .map(id => items.find(i => i.id === id))
    .filter(Boolean);

  const lastWorn   = outfit.wornDates?.[0] || null;
  const wearCount  = outfit.wornDates?.length || 0;
  const curatedFor = getCuratedFor(outfit.tags);

  async function handleToggleFavorite() {
    await toggleOutfitFavorite(outfit.id);
    setOutfit(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  }

  async function handleWearIt() {
    await markOutfitWorn(outfit.id);
    setOutfit(prev => ({
      ...prev,
      wornDates: [new Date().toISOString(), ...(prev.wornDates || [])],
    }));
    Alert.alert('Outfit logged! 🎉', 'Your pieces have been marked as worn today.');
  }

  async function handleRemove() {
    Alert.alert(
      'Remove Outfit',
      `Remove "${outfit.name}" from your outfits?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteOutfit(outfit.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Outfit Details</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleToggleFavorite}
          accessibilityLabel="Save outfit"
        >
          <Ionicons
            name={outfit.isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={outfit.isFavorite ? COLORS.primary : COLORS.textDark}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Tags ── */}
        <View style={styles.tagsRow}>
          {outfit.tags?.map(tag => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {/* ── Outfit name + curated subtitle ── */}
        <Text style={styles.outfitName}>{outfit.name}</Text>
        <Text style={styles.curatedLabel}>Curated for {curatedFor}</Text>

        <View style={styles.divider} />

        {/* ── Articles list ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>ARTICLES</Text>
          <Text style={styles.sectionCount}>{outfitItems.length} TOTAL</Text>
        </View>

        {outfitItems.map(item => {
          const meta = [item.brand, item.color].filter(Boolean).join(' · ');
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.articleRow}
              onPress={() => navigation.navigate('ItemDetail', { item })}
            >
              <Image
                source={{ uri: item.imageUri }}
                style={styles.articleThumb}
                resizeMode="contain"
              />
              <View style={styles.articleInfo}>
                <Text style={styles.articleName}>{item.name}</Text>
                <Text style={styles.articleMeta}>
                  {meta || item.category}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        {/* ── Previously worn stats ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>PREVIOUSLY WORN</Text>
          {/* Prominent wear count badge */}
          <View style={styles.wearCountBadge}>
            <Text style={styles.wearCountNumber}>{wearCount}</Text>
            <Text style={styles.wearCountUnit}>
              {wearCount === 1 ? 'wear' : 'wears'}
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textMedium} />
          <Text style={styles.statKey}>Last worn</Text>
          <Text style={styles.statValue}>{formatDate(lastWorn)}</Text>
        </View>

        <View style={styles.statRow}>
          <Ionicons name="repeat-outline" size={16} color={COLORS.textMedium} />
          <Text style={styles.statKey}>Total wear count</Text>
          <Text style={styles.statValue}>
            {wearCount} {wearCount === 1 ? 'time' : 'times'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Primary CTA ── */}
        <TouchableOpacity style={styles.wearBtn} onPress={handleWearIt}>
          <Ionicons name="heart-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.wearBtnText}>I'M WEARING THIS</Text>
        </TouchableOpacity>

        {/* ── Wear again (shown only after first wear) ── */}
        {wearCount > 0 && (
          <TouchableOpacity style={styles.wearAgainBtn} onPress={handleWearIt}>
            <Ionicons name="refresh-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.wearAgainBtnText}>I'M WEARING THIS AGAIN</Text>
          </TouchableOpacity>
        )}

        {/* ── Delete outfit ── */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleRemove}>
          <Ionicons name="trash-outline" size={15} color={COLORS.negative} style={{ marginRight: 6 }} />
          <Text style={styles.deleteBtnText}>DELETE THIS OUTFIT</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  notFound: {
    fontFamily: FONTS.regular,
    textAlign:  'center',
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textLight,
    marginTop:  SPACING.xxl,
  },

  // ── Header ───────────────────────────────────
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
  },

  headerBtn: {
    width:  32,
    height: 32,
    alignItems:     'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontFamily: FONTS.medium,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
    letterSpacing: 0.3,
  },

  // ── Scroll content ───────────────────────────
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.xxl,
  },

  // ── Tags ─────────────────────────────────────
  tagsRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.xs,
    marginBottom:  SPACING.md,
  },

  tagPill: {
    backgroundColor:   COLORS.cardBackground,
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   5,
  },

  tagText: {
    fontFamily:    FONTS.medium,
    fontSize:      10,
    color:         COLORS.textMedium,
    letterSpacing: 0.8,
  },

  // ── Outfit identity ──────────────────────────
  outfitName: {
    fontFamily:   FONTS.bold,
    fontSize:     28,
    color:        COLORS.textDark,
    lineHeight:   34,
    marginBottom: SPACING.xs,
  },

  curatedLabel: {
    fontFamily:   FONTS.regular,
    fontSize:     FONTS.sizeSM,
    color:        COLORS.textMedium,
    fontStyle:    'italic',
    marginBottom: SPACING.lg,
  },

  // ── Divider ──────────────────────────────────
  divider: {
    height:          1,
    backgroundColor: COLORS.cardBackground,
    marginVertical:  SPACING.lg,
  },

  // ── Section header ───────────────────────────
  sectionRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.md,
  },

  sectionLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    color:         COLORS.textMedium,
    letterSpacing: 2,
  },

  sectionCount: {
    fontFamily:    FONTS.regular,
    fontSize:      FONTS.sizeXS,
    color:         COLORS.textLight,
    letterSpacing: 1,
  },

  // ── Article row ──────────────────────────────
  articleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBackground,
  },

  articleThumb: {
    width:           56,
    height:          56,
    borderRadius:    RADIUS.sm,
    backgroundColor: COLORS.cardBackground,
  },

  articleInfo: {
    flex: 1,
  },

  articleName: {
    fontFamily:   FONTS.bold,
    fontSize:     FONTS.sizeMD,
    color:        COLORS.textDark,
    marginBottom: 2,
  },

  articleMeta: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textLight,
  },

  // ── Wear stats ───────────────────────────────
  statRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            SPACING.sm,
    paddingVertical: SPACING.sm,
  },

  statKey: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    flex:       1,
  },

  statValue: {
    fontFamily: FONTS.medium,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textDark,
  },

  // ── Buttons ──────────────────────────────────
  // ── Wear count badge ─────────────────────────
  wearCountBadge: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   4,
    flexDirection:   'row',
    alignItems:      'baseline',
    gap:             3,
  },

  wearCountNumber: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.white,
  },

  wearCountUnit: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeXS,
    color:      'rgba(255,255,255,0.8)',
  },

  // ── Buttons ──────────────────────────────────
  wearBtn: {
    backgroundColor: COLORS.textDark,
    borderRadius:    RADIUS.full,
    paddingVertical: SPACING.md + 2,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.sm,
    ...SHADOW.small,
  },

  wearBtnText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeMD,
    color:         COLORS.white,
    letterSpacing: 1.5,
  },

  wearAgainBtn: {
    borderWidth:     1.5,
    borderColor:     COLORS.primary,
    borderRadius:    RADIUS.full,
    paddingVertical: SPACING.md,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.sm,
  },

  wearAgainBtnText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeSM,
    color:         COLORS.primary,
    letterSpacing: 1,
  },

  deleteBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: SPACING.sm,
    marginTop:       SPACING.xs,
  },

  deleteBtnText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeSM,
    color:         COLORS.negative,
    letterSpacing: 1,
  },
});
