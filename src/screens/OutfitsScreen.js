// ─────────────────────────────────────────────
// OutfitsScreen  (third tab)
// 2-column grid layout matching Figma spec
// Fonts loaded globally in App.js
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
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { getAllOutfits, getAllItems } from '../services/storageService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP     = 12;
const CARD_WIDTH   = (SCREEN_WIDTH - SPACING.lg * 2 - CARD_GAP) / 2;
const CARD_HEIGHT  = CARD_WIDTH * 1.3;

export default function OutfitsScreen({ navigation }) {
  const [outfits,   setOutfits]   = useState([]);
  const [items,     setItems]     = useState([]);
  const [activeTab, setActiveTab] = useState('favorites');

  useFocusEffect(
    useCallback(() => {
      Promise.all([getAllOutfits(), getAllItems()]).then(([o, i]) => {
        setOutfits(o);
        setItems(i);
        if (!o.some(outfit => outfit.isFavorite)) setActiveTab('worn');
      });
    }, [])
  );

  const displayedOutfits = activeTab === 'favorites'
    ? outfits.filter(o => o.isFavorite)
    : outfits
        .filter(o => o.wornDates && o.wornDates.length > 0)
        .sort((a, b) => new Date(b.wornDates[0]) - new Date(a.wornDates[0]));

  // Get up to 4 item images for the outfit card
  function getOutfitItems(outfit) {
    if (!outfit?.itemIds) return [];
    return outfit.itemIds
      .map(id => items.find(i => i.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }

  function renderOutfit({ item: outfit, index }) {
    const outfitItems = getOutfitItems(outfit);
    const tags = outfit.tags?.slice(0, 2) || [];

    return (
      <TouchableOpacity
        style={[
          styles.card,
          // offset right column slightly for visual rhythm
          index % 2 === 0 ? { marginRight: CARD_GAP / 2 } : { marginLeft: CARD_GAP / 2 },
        ]}
        onPress={() => navigation.navigate('OutfitDetail', { outfitId: outfit.id })}
        accessibilityLabel={`View outfit: ${outfit.name}`}
      >
        {/* Tags row at top of card */}
        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map(tag => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Outfit image — 2×2 grid of pieces */}
        <View style={styles.imageGrid}>
          {[0, 1, 2, 3].map(idx => (
            <View key={idx} style={styles.imageCell}>
              {outfitItems[idx] ? (
                <Image
                  source={{ uri: outfitItems[idx].imageUri }}
                  style={styles.cellImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.cellEmpty} />
              )}
            </View>
          ))}
        </View>
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
          onPress={() => navigation.navigate('Help')}
        >
          <Ionicons name="help-circle-outline" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {/* ── Page title ── */}
      <Text style={styles.headerTitle}>Outfits</Text>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {[
          { key: 'favorites', label: 'Favorites' },
          { key: 'worn',      label: 'Previously Worn' },
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
              {tab.label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── 2-column outfit grid ── */}
      <FlatList
        data={displayedOutfits}
        keyExtractor={o => o.id}
        renderItem={renderOutfit}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'favorites'
              ? 'No saved outfits yet.\nHeart an outfit on the Discover tab!'
              : "You haven't logged any outfits yet.\nTap \"I'll wear it\" on the Discover tab!"}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  // ── Top nav bar ──────────────────────────────
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

  // ── Title ────────────────────────────────────
  headerTitle: {
    fontFamily:        FONTS.medium,
    fontSize:          34,
    color:             COLORS.textDark,
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.md,
  },

  // ── Tab bar ──────────────────────────────────
  tabBar: {
    flexDirection:     'row',
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.sm,
    marginBottom:      SPACING.md,
  },

  tabBtn: {
    paddingVertical:   8,
    paddingHorizontal: SPACING.md,
    borderRadius:      RADIUS.full,
    backgroundColor:   COLORS.cardBackground,
  },

  tabBtnActive: {
    backgroundColor: COLORS.textDark,
  },

  tabBtnText: {
    fontFamily:    FONTS.bold,
    fontSize:      11,
    color:         COLORS.textMedium,
    letterSpacing: 0.8,
  },

  tabBtnTextActive: {
    color: COLORS.white,
  },

  // ── Grid ─────────────────────────────────────
  list: {
    flex: 1,
  },

  grid: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     80,
  },

  // ── Outfit card ──────────────────────────────
  card: {
    width:           CARD_WIDTH,
    height:          CARD_HEIGHT,
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    overflow:        'hidden',
    marginBottom:    CARD_GAP,
    ...SHADOW.small,
  },

  tagsRow: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    gap:               6,
    paddingHorizontal: SPACING.sm,
    paddingTop:        SPACING.sm,
    paddingBottom:     4,
  },

  tagPill: {
    backgroundColor:   'rgba(255,255,255,0.9)',
    borderRadius:      RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },

  tagText: {
    fontFamily:    FONTS.medium,
    fontSize:      9,
    color:         COLORS.textDark,
    letterSpacing: 0.6,
  },

  // 2×2 image grid fills remaining card space
  imageGrid: {
    flex:          1,
    flexDirection: 'row',
    flexWrap:      'wrap',
  },

  imageCell: {
    width:           '50%',
    height:          '50%',
    backgroundColor: COLORS.cardBackground,
  },

  cellImage: {
    width:  '100%',
    height: '100%',
  },

  cellEmpty: {
    flex:            1,
    backgroundColor: COLORS.inputBackground,
  },

  emptyText: {
    textAlign:         'center',
    fontFamily:        FONTS.regular,
    color:             COLORS.textLight,
    fontSize:          14,
    lineHeight:        22,
    marginTop:         SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
});
