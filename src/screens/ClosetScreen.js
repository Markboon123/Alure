// ─────────────────────────────────────────────
// ClosetScreen — redesigned to match Figma spec
//
// Before running, install font packages:
//   npx expo install @expo-google-fonts/cormorant-garamond @expo-google-fonts/jost expo-font
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
} from '@expo-google-fonts/jost';

import FilterModal from '../components/FilterModal';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { getAllItems } from '../services/storageService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_COLUMNS = 2;
const CARD_GAP     = 12;
const CARD_SIZE    = (SCREEN_WIDTH - SPACING.lg * 2 - CARD_GAP) / GRID_COLUMNS;

const CATEGORIES = ['All', 'Tops', 'Suits', 'Bottoms', 'Jackets', 'Shoes', 'Accessories'];

const CATEGORY_MAP = {
  All:         null,
  Tops:        'top',
  Suits:       'suit',
  Bottoms:     'bottom',
  Jackets:     'jacket',
  Shoes:       'shoes',
  Accessories: 'accessory',
};

export default function ClosetScreen({ navigation }) {
  const [items,          setItems]          = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [filterVisible,  setFilterVisible]  = useState(false);
  const [sortBy,         setSortBy]         = useState('newest');
  const [activeTags,     setActiveTags]     = useState([]);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
  });

  useFocusEffect(
    useCallback(() => {
      getAllItems().then(setItems);
    }, [])
  );

  function filteredItems() {
    let result = [...items];

    const categoryValue = CATEGORY_MAP[activeCategory];
    if (categoryValue) {
      result = result.filter(i => i.category === categoryValue);
    }

    if (activeTags.length > 0) {
      result = result.filter(item =>
        activeTags.some(tag => item.tags?.includes(tag))
      );
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    } else if (sortBy === 'mostWorn') {
      result.sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0));
    } else if (sortBy === 'leastWorn') {
      result.sort((a, b) => (a.timesWorn || 0) - (b.timesWorn || 0));
    }

    return result;
  }

  function renderItem({ item }) {
    // Show first tag (style label like Casual / Active / Modern)
    const tag = item.tags?.[0] ?? item.style ?? null;

    return (
      <TouchableOpacity
        style={styles.gridCell}
        onPress={() => navigation.navigate('ItemDetail', { item })}
        accessibilityLabel={`View ${item.name}`}
      >
        {tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>{tag.toUpperCase()}</Text>
          </View>
        )}
        <Image
          source={{ uri: item.imageUri }}
          style={styles.gridImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  }

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Top nav bar: settings | ALURÉ | help ── */}
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

      {/* ── Page title + filter icon ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Closet</Text>
        <TouchableOpacity
          onPress={() => setFilterVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Sort and filter"
        >
          <Ionicons name="options-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {/* ── Category pills ── */}
      <View style={styles.categoryContainer}>
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
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Items grid ── */}
      <FlatList
        data={filteredItems()}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        numColumns={GRID_COLUMNS}
        style={styles.list}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No items yet. Tap + to add your first piece!
          </Text>
        }
      />

      {/* ── Add FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddItem')}
        accessibilityLabel="Add new clothing item"
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* ── Filter modal ── */}
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex:            1,
    backgroundColor: COLORS.background,
    alignItems:      'center',
    justifyContent:  'center',
  },

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
    fontFamily:    'CormorantGaramond_600SemiBold',
    fontSize:      22,
    letterSpacing: 5,
    color:         COLORS.textDark,
  },

  // ── Page title row ───────────────────────────
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xs,
    paddingBottom:     SPACING.sm,
  },

  headerTitle: {
    fontFamily: 'Jost_500Medium',
    fontSize:   34,
    color:      COLORS.textDark,
  },

  // ── Category filter ──────────────────────────
  categoryContainer: {
    height:     44,
    marginBottom: SPACING.sm,
  },

  categoryScroll: {
    paddingHorizontal: SPACING.lg,
    alignItems:        'center',
    flexGrow:          0,
  },

  categoryPill: {
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   7,
    backgroundColor:   COLORS.cardBackground,
    marginRight:       SPACING.sm,
    alignSelf:         'center',
  },

  categoryPillActive: {
    backgroundColor: COLORS.textDark,
  },

  categoryPillText: {
    fontFamily:    'Jost_400Regular',
    fontSize:      11,
    color:         COLORS.textMedium,
    letterSpacing: 0.8,
  },

  categoryPillTextActive: {
    fontFamily: 'Jost_600SemiBold',
    color:      COLORS.white,
  },

  // ── Grid ────────────────────────────────────
  list: {
    flex: 1,
  },

  grid: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     80,
  },

  gridRow: {
    gap:          CARD_GAP,
    marginBottom: CARD_GAP,
  },

  gridCell: {
    width:           CARD_SIZE,
    height:          CARD_SIZE * 1.12,
    borderRadius:    RADIUS.md,
    overflow:        'hidden',
    backgroundColor: COLORS.cardBackground,
    ...SHADOW.small,
  },

  gridImage: {
    width:  '100%',
    height: '100%',
  },

  tagBadge: {
    position:          'absolute',
    top:               SPACING.sm,
    left:              SPACING.sm,
    zIndex:            1,
    backgroundColor:   'rgba(255,255,255,0.88)',
    borderRadius:      RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },

  tagBadgeText: {
    fontFamily:    'Jost_500Medium',
    fontSize:      9,
    color:         COLORS.textDark,
    letterSpacing: 0.8,
  },

  emptyText: {
    textAlign:         'center',
    fontFamily:        'Jost_400Regular',
    color:             COLORS.textLight,
    fontSize:          14,
    marginTop:         SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },

  // ── FAB ─────────────────────────────────────
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
});
