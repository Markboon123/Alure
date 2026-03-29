// ─────────────────────────────────────────────
// OutfitsScreen  (third tab)
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { getAllOutfits, getAllItems } from '../services/storageService';

export default function OutfitsScreen({ navigation }) {
  const [outfits,   setOutfits]   = useState([]);
  const [items,     setItems]     = useState([]);
  const [activeTab, setActiveTab] = useState('favorites');

  useFocusEffect(
    useCallback(() => {
      Promise.all([getAllOutfits(), getAllItems()]).then(([o, i]) => {
        setOutfits(o);
        setItems(i);
        const hasFavorites = o.some(outfit => outfit.isFavorite);
        if (!hasFavorites) setActiveTab('worn');
      });
    }, [])
  );

  const displayedOutfits = activeTab === 'favorites'
    ? outfits.filter(o => o.isFavorite)
    : outfits.filter(o => o.wornDates && o.wornDates.length > 0)
        .sort((a, b) => new Date(b.wornDates[0]) - new Date(a.wornDates[0]));

  function getOutfitImages(outfit) {
    if (!outfit?.itemIds) return [];
    return outfit.itemIds
      .map(id => items.find(i => i.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function renderOutfit({ item: outfit }) {
    const outfitItems = getOutfitImages(outfit);

    return (
      <TouchableOpacity
        style={styles.outfitCard}
        onPress={() => navigation.navigate('OutfitDetail', { outfitId: outfit.id })}
        accessibilityLabel={`View outfit: ${outfit.name}`}
      >
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

        <View style={styles.outfitInfo}>
          <Text style={styles.outfitName}>{outfit.name}</Text>

          <View style={styles.tagsRow}>
            {outfit.tags?.slice(0, 3).map(tag => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
              </View>
            ))}
          </View>

          {activeTab === 'worn' && outfit.wornDates?.[0] && (
            <Text style={styles.wornDate}>
              Last worn {formatDate(outfit.wornDates[0])}
            </Text>
          )}
        </View>

        {outfit.isFavorite && (
          <Ionicons name="heart" size={18} color={COLORS.primary} style={styles.heartIcon} />
        )}

        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
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

      {/* ── Page title ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Outfits</Text>
      </View>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {[
          { key: 'favorites', label: 'Favorites',       icon: 'heart-outline' },
          { key: 'worn',      label: 'Previously Worn', icon: 'time-outline'  },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={activeTab === tab.key ? COLORS.white : COLORS.textMedium}
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabBtnText,
              activeTab === tab.key && styles.tabBtnTextActive,
            ]}>
              {tab.label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Outfit list ── */}
      <FlatList
        data={displayedOutfits}
        keyExtractor={o => o.id}
        renderItem={renderOutfit}
        style={styles.list}
        contentContainerStyle={styles.listContent}
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

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xs,
    paddingBottom:     SPACING.md,
  },

  headerTitle: {
    fontFamily: FONTS.medium,
    fontSize:   34,
    color:      COLORS.textDark,
  },

  tabBar: {
    flexDirection:     'row',
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.sm,
    marginBottom:      SPACING.md,
  },

  tabBtn: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: SPACING.sm,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    gap:             4,
  },

  tabBtnActive: {
    backgroundColor: COLORS.textDark,
  },

  tabIcon: {
    marginRight: 2,
  },

  tabBtnText: {
    fontFamily:    FONTS.bold,
    fontSize:      10,
    color:         COLORS.textMedium,
    letterSpacing: 0.8,
  },

  tabBtnTextActive: {
    color: COLORS.white,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     80,
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
    width:         90,
    height:        90,
    flexDirection: 'row',
    flexWrap:      'wrap',
    borderRadius:  RADIUS.md,
    overflow:      'hidden',
  },

  thumbnailCell: {
    width:           45,
    height:          45,
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
    fontFamily: FONTS.medium,
    fontSize:   15,
    color:      COLORS.textDark,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.xs,
  },

  tagPill: {
    backgroundColor:   COLORS.background,
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical:   3,
  },

  tagText: {
    fontFamily:    FONTS.regular,
    fontSize:      9,
    color:         COLORS.textMedium,
    letterSpacing: 0.6,
  },

  wornDate: {
    fontFamily: FONTS.regular,
    fontSize:   11,
    color:      COLORS.textLight,
    fontStyle:  'italic',
  },

  heartIcon: {
    marginRight: 2,
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
