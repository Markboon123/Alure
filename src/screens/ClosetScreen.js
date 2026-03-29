// ─────────────────────────────────────────────
// Closet Screen  (second tab)
// Displays all wardrobe items in a grid.
// Features:
//   - Category filter scroll bar (All/Jackets/Tops/…)
//   - Sort & filter button (opens FilterModal)
//   - Tap item → ItemDetailScreen
//   - + button → AddItemScreen
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import FilterModal from '../components/FilterModal';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { getAllItems } from '../services/storageService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_COLUMNS = 2;
const ITEM_SIZE    = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / GRID_COLUMNS;

// Categories shown in the horizontal scroll bar
const CATEGORIES = ['All', 'Jackets', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];

// Maps display label → item.category value
const CATEGORY_MAP = {
  'All':         null,
  'Jackets':     'jacket',
  'Tops':        'top',
  'Bottoms':     'bottom',
  'Shoes':       'shoes',
  'Accessories': 'accessory',
};

export default function ClosetScreen({ navigation }) {
  const [items,           setItems]           = useState([]);
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [filterVisible,   setFilterVisible]   = useState(false);
  const [sortBy,          setSortBy]          = useState('newest');  // newest|mostWorn|leastWorn
  const [activeTags,      setActiveTags]      = useState([]);

  // ── Reload items when the tab gains focus ────
  useFocusEffect(
    useCallback(() => {
      getAllItems().then(setItems);
    }, [])
  );

  // ── Filter by category ────────────────────────
  function filteredItems() {
    let result = [...items];

    // Category filter
    const categoryValue = CATEGORY_MAP[activeCategory];
    if (categoryValue) {
      result = result.filter(i => i.category === categoryValue);
    }

    // Tag filter
    if (activeTags.length > 0) {
      result = result.filter(item =>
        activeTags.some(tag => item.tags?.includes(tag))
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    } else if (sortBy === 'mostWorn') {
      result.sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0));
    } else if (sortBy === 'leastWorn') {
      result.sort((a, b) => (a.timesWorn || 0) - (b.timesWorn || 0));
    }

    return result;
  }

  // ── Render one grid item ──────────────────────
  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={[styles.gridCell, { width: ITEM_SIZE, height: ITEM_SIZE }]}
        onPress={() => navigation.navigate('ItemDetail', { item })}
        accessibilityLabel={`View ${item.name}`}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={styles.gridImage}
          resizeMode="cover"
        />

        {/* Wear count badge */}
        <View style={styles.wearBadge}>
          <Text style={styles.wearBadgeText}>×{item.timesWorn || 0}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Top header ───────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MY CLOSET</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
          accessibilityLabel="Sort and filter"
        >
          <Text style={styles.filterButtonText}>⚙ Sort & Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ── Category scroll bar ────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryPill,
              activeCategory === cat && styles.categoryPillActive,
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === cat && styles.categoryPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Items grid ───────────────────────── */}
      <FlatList
        data={filteredItems()}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No items yet. Tap + to add your first piece!
          </Text>
        }
      />

      {/* ── Add item FAB ──────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddItem')}
        accessibilityLabel="Add new clothing item"
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* ── Filter modal ─────────────────────── */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        activeTags={activeTags}
        onTagsChange={setActiveTags}
        allItems={items}
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

  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingHorizontal: SPACING.lg,
    paddingTop:     SPACING.md,
    paddingBottom:  SPACING.sm,
  },

  headerTitle: {
    fontSize:   FONTS.size2XL,
    fontWeight: '800',
    color:      COLORS.textDark,
    letterSpacing: 2,
  },

  filterButton: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    ...SHADOW.small,
  },

  filterButtonText: {
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    fontWeight: '600',
  },

  categoryScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
    gap:               SPACING.sm,
  },

  categoryPill: {
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    backgroundColor:   COLORS.cardBackground,
    marginRight:       SPACING.sm,
  },

  categoryPillActive: {
    backgroundColor: COLORS.primary,
  },

  categoryPillText: {
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    fontWeight: '600',
  },

  categoryPillTextActive: {
    color: COLORS.white,
  },

  grid: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.xxl,
  },

  gridRow: {
    gap:           SPACING.sm,
    marginBottom:  SPACING.sm,
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

  wearBadge: {
    position:        'absolute',
    bottom:          SPACING.xs,
    right:           SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius:    RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical:   2,
  },

  wearBadgeText: {
    fontSize:   FONTS.sizeXS,
    color:      COLORS.white,
    fontWeight: '600',
  },

  emptyText: {
    textAlign:  'center',
    color:      COLORS.textLight,
    fontSize:   FONTS.sizeMD,
    marginTop:  SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },

  fab: {
    position:        'absolute',
    bottom:          SPACING.xl,
    right:           SPACING.lg,
    width:           56,
    height:          56,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
    ...SHADOW.medium,
  },

  fabText: {
    fontSize:   28,
    color:      COLORS.white,
    lineHeight: 34,
  },
});
