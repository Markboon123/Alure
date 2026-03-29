// ─────────────────────────────────────────────
// OutfitsScreen  (third tab)
// Shows saved outfit collections:
//   Favorites tab  – outfits the user bookmarked
//   Previously Worn tab – outfits with wornDates
//
// If Favorites is empty, defaults to Previously Worn.
// Tapping an outfit → OutfitDetailScreen
// ─────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { getAllOutfits, getAllItems } from '../services/storageService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH   = SCREEN_WIDTH - SPACING.lg * 2;

export default function OutfitsScreen({ navigation }) {
  const [outfits,    setOutfits]    = useState([]);
  const [items,      setItems]      = useState([]);
  const [activeTab,  setActiveTab]  = useState('favorites');  // 'favorites' | 'worn'

  // ── Reload on focus ───────────────────────────
  useFocusEffect(
    useCallback(() => {
      Promise.all([getAllOutfits(), getAllItems()]).then(([o, i]) => {
        setOutfits(o);
        setItems(i);

        // If no favorites, default to Previously Worn tab
        const hasFavorites = o.some(outfit => outfit.isFavorite);
        if (!hasFavorites) setActiveTab('worn');
      });
    }, [])
  );

  // ── Filter by active tab ──────────────────────
  const displayedOutfits = activeTab === 'favorites'
    ? outfits.filter(o => o.isFavorite)
    : outfits.filter(o => o.wornDates && o.wornDates.length > 0)
        .sort((a, b) => new Date(b.wornDates[0]) - new Date(a.wornDates[0]));

  // ── Get images for the 2×2 thumbnail grid ────
  function getOutfitImages(outfit) {
    if (!outfit?.itemIds) return [];
    return outfit.itemIds
      .map(id => items.find(i => i.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }

  // ── Format last worn ──────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ── Render one outfit card ────────────────────
  function renderOutfit({ item: outfit }) {
    const outfitItems = getOutfitImages(outfit);

    return (
      <TouchableOpacity
        style={styles.outfitCard}
        onPress={() => navigation.navigate('OutfitDetail', { outfitId: outfit.id })}
        accessibilityLabel={`View outfit: ${outfit.name}`}
      >
        {/* 2×2 thumbnail grid */}
        <View style={styles.thumbnailGrid}>
          {[0, 1, 2, 3].map(idx => (
            <View key={idx} style={styles.thumbnailCell}>
              {outfitItems[idx] ? (
                <Image
                  source={{ uri: outfitItems[idx].imageUri }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailEmpty} />
              )}
            </View>
          ))}
        </View>

        {/* Outfit info */}
        <View style={styles.outfitInfo}>
          <Text style={styles.outfitName}>{outfit.name}</Text>

          {/* Style tags */}
          <View style={styles.tagsRow}>
            {outfit.tags?.slice(0, 3).map(tag => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Worn date (shown on Previously Worn tab) */}
          {activeTab === 'worn' && outfit.wornDates?.[0] && (
            <Text style={styles.wornDate}>
              Last worn {formatDate(outfit.wornDates[0])}
            </Text>
          )}
        </View>

        {/* Favorite heart */}
        {outfit.isFavorite && (
          <Text style={styles.favoriteHeart}>♥</Text>
        )}

        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ───────────────────────────── */}
      <Text style={styles.headerTitle}>OUTFITS</Text>

      {/* ── Tab bar ──────────────────────────── */}
      <View style={styles.tabBar}>
        {[
          { key: 'favorites', label: '♥ Favorites' },
          { key: 'worn',      label: '🕐 Previously Worn' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabBtnText,
              activeTab === tab.key && styles.tabBtnTextActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Outfit list ──────────────────────── */}
      <FlatList
        data={displayedOutfits}
        keyExtractor={o => o.id}
        renderItem={renderOutfit}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'favorites'
              ? 'No saved outfits yet.\nHeart an outfit on the Discover tab!'
              : 'You haven\'t logged any outfits yet.\nTap "I\'ll wear it" on the Discover tab!'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  headerTitle: {
    fontSize:       FONTS.size2XL,
    fontWeight:     '800',
    color:          COLORS.textDark,
    letterSpacing:  2,
    paddingHorizontal: SPACING.lg,
    paddingTop:     SPACING.md,
    paddingBottom:  SPACING.sm,
  },

  tabBar: {
    flexDirection:     'row',
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.sm,
    marginBottom:      SPACING.md,
  },

  tabBtn: {
    flex:              1,
    paddingVertical:   SPACING.sm,
    borderRadius:      RADIUS.full,
    backgroundColor:   COLORS.cardBackground,
    alignItems:        'center',
  },

  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },

  tabBtnText: {
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    fontWeight: '600',
  },

  tabBtnTextActive: {
    color: COLORS.white,
  },

  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.xxl,
    gap:               SPACING.md,
  },

  outfitCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             SPACING.md,
    ...SHADOW.small,
  },

  thumbnailGrid: {
    width:        100,
    height:       100,
    flexDirection:'row',
    flexWrap:     'wrap',
    borderRadius: RADIUS.md,
    overflow:     'hidden',
  },

  thumbnailCell: {
    width:  50,
    height: 50,
    backgroundColor: COLORS.inputBackground,
  },

  thumbnailImage: {
    width:  '100%',
    height: '100%',
  },

  thumbnailEmpty: {
    flex:            1,
    backgroundColor: COLORS.inputBackground,
  },

  outfitInfo: {
    flex: 1,
    gap:  SPACING.xs,
  },

  outfitName: {
    fontSize:   FONTS.sizeMD,
    fontWeight: '700',
    color:      COLORS.textDark,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.xs,
  },

  tagPill: {
    backgroundColor:   COLORS.white,
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical:   2,
  },

  tagText: {
    fontSize:  FONTS.sizeXS,
    color:     COLORS.textMedium,
    fontWeight: '500',
  },

  wornDate: {
    fontSize:  FONTS.sizeXS,
    color:     COLORS.textLight,
    fontStyle: 'italic',
  },

  favoriteHeart: {
    fontSize:  FONTS.sizeLG,
    color:     COLORS.primary,
    marginRight: SPACING.xs,
  },

  arrowIcon: {
    fontSize:  FONTS.sizeXL,
    color:     COLORS.textLight,
  },

  emptyText: {
    textAlign:  'center',
    color:      COLORS.textLight,
    fontSize:   FONTS.sizeMD,
    lineHeight: FONTS.sizeMD * 1.6,
    marginTop:  SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
});
