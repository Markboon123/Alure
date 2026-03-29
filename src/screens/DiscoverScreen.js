// ─────────────────────────────────────────────
// Discover Screen  (first tab)
// Greets the user and shows up to 3 AI-suggested
// outfit cards for the day. Users can:
//   👎 skip (thumbs-down) — trains AI negatively
//   ❤️  wear it          — marks outfit + pieces as worn
//   👍 like              — trains AI positively
//   🔖 save              — adds to favorite outfits
//   ✏️  edit             — opens EditOutfitModal
// ─────────────────────────────────────────────

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import OutfitCard from '../components/OutfitCard';
import EditOutfitModal from '../components/EditOutfitModal';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { getAllItems, getAllOutfits, saveOutfit, markOutfitWorn } from '../services/storageService';
import { suggestOutfits, fetchWeather } from '../services/geminiService';
import { MOCK_OUTFITS } from '../data/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DiscoverScreen({ navigation }) {
  const [userName,    setUserName]    = useState('Swayam');
  const [weather,     setWeather]     = useState('57°F');
  const [items,       setItems]       = useState([]);
  const [outfits,     setOutfits]     = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [editOutfit,  setEditOutfit]  = useState(null);   // outfit being edited
  const [savedIds,    setSavedIds]    = useState(new Set());
  const flatListRef = useRef(null);

  // ── Load data when tab comes into focus ──────
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    setLoading(true);
    try {
      const [loadedItems, loadedOutfits] = await Promise.all([
        getAllItems(),
        getAllOutfits(),
      ]);
      setItems(loadedItems);

      // Try to get AI suggestions; fall back to saved outfits / mock data
      const aiOutfits = await suggestOutfits({
        items: loadedItems,
        weather: weather,
        preferences: ['Bold', 'Colorful', 'Comfy'],
        outfitCount: 3,
      });

      if (aiOutfits && aiOutfits.length > 0) {
        // Map AI suggestions to full outfit objects with item lookups
        const resolved = aiOutfits.map((suggestion, idx) => ({
          id:        `ai_outfit_${Date.now()}_${idx}`,
          name:      suggestion.name,
          tags:      suggestion.tags,
          itemIds:   suggestion.itemIds,
          style:     suggestion.style,
          isFavorite: false,
          wornDates: [],
          aiScore:   0.85,
          reason:    suggestion.reason,
        }));
        setOutfits(resolved);
      } else {
        // Fall back to stored / mock outfits
        const displayOutfits = loadedOutfits.length > 0
          ? loadedOutfits.slice(0, 3)
          : MOCK_OUTFITS.slice(0, 3);
        setOutfits(displayOutfits);
      }

      // Track which are already saved
      const favSet = new Set(loadedOutfits.filter(o => o.isFavorite).map(o => o.id));
      setSavedIds(favSet);
    } catch (err) {
      console.error('loadData error:', err);
      setOutfits(MOCK_OUTFITS.slice(0, 3));
    } finally {
      setLoading(false);
    }
  }

  // ── Load weather on mount ─────────────────
  useEffect(() => {
    fetchWeather().then(w => setWeather(w)).catch(() => {});
  }, []);

  // ── Keep activeIndex in sync with scroll ─────
  function handleScroll(event) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    setActiveIndex(newIndex);
  }

  // ── Feedback actions ──────────────────────────
  function handleThumbsDown() {
    // Skip to next card (trains AI negatively — placeholder for now)
    const nextIndex = activeIndex + 1;
    if (nextIndex < outfits.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      Alert.alert('No more outfits', 'Check back tomorrow for fresh suggestions!');
    }
  }

  async function handleWearIt() {
    const outfit = outfits[activeIndex];
    if (!outfit) return;
    try {
      await markOutfitWorn(outfit.id);
      Alert.alert("Outfit logged! 🎉", "Your pieces have been marked as worn today.");
    } catch (err) {
      console.error('handleWearIt error:', err);
    }
  }

  function handleThumbsUp() {
    // Positive signal — placeholder for future AI training
    Alert.alert('Noted! 👍', "We'll suggest more outfits like this.");
  }

  async function handleSave() {
    const outfit = outfits[activeIndex];
    if (!outfit) return;
    const isCurrentlySaved = savedIds.has(outfit.id);
    const updatedOutfit = { ...outfit, isFavorite: !isCurrentlySaved };
    await saveOutfit(updatedOutfit);

    const newSet = new Set(savedIds);
    if (isCurrentlySaved) {
      newSet.delete(outfit.id);
    } else {
      newSet.add(outfit.id);
    }
    setSavedIds(newSet);
  }

  function handleEdit() {
    setEditOutfit(outfits[activeIndex] || null);
  }

  function handleEditSave(updatedOutfit) {
    setOutfits(prev =>
      prev.map(o => o.id === updatedOutfit.id ? updatedOutfit : o)
    );
    setEditOutfit(null);
    saveOutfit(updatedOutfit);
  }

  // ── Dot indicators ────────────────────────────
  function renderDots() {
    return (
      <View style={styles.dotsRow}>
        {outfits.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    );
  }

  // ── Render each outfit card in the FlatList ──
  function renderCard({ item: outfit }) {
    return (
      <View style={{ width: SCREEN_WIDTH, paddingHorizontal: SPACING.lg }}>
        <OutfitCard
          outfit={outfit}
          items={items}
          onSave={handleSave}
          onEdit={handleEdit}
          isSaved={savedIds.has(outfit.id)}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── Header ─────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hiText}>Hi, {userName}</Text>
            <Text style={styles.headlineText}>TODAY'S{'\n'}OUTFITS</Text>
          </View>
          <View style={styles.weatherBadge}>
            <Text style={styles.weatherIcon}>☀️</Text>
            <Text style={styles.weatherText}>{weather}</Text>
          </View>
        </View>

        {/* ── Outfit cards carousel ─────────── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Styling your day...</Text>
          </View>
        ) : (
          <>
            {renderDots()}

            <FlatList
              ref={flatListRef}
              data={outfits}
              keyExtractor={o => o.id}
              renderItem={renderCard}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.carousel}
            />
          </>
        )}

        {/* ── Feedback buttons ──────────────── */}
        {!loading && (
          <View style={styles.feedbackRow}>
            {/* Thumbs down */}
            <TouchableOpacity
              style={styles.feedbackSide}
              onPress={handleThumbsDown}
              accessibilityLabel="Skip outfit"
            >
              <Text style={styles.feedbackIcon}>👎</Text>
            </TouchableOpacity>

            {/* I'll wear it — primary CTA */}
            <TouchableOpacity
              style={styles.wearItButton}
              onPress={handleWearIt}
              accessibilityLabel="I'll wear this outfit"
            >
              <Text style={styles.wearItHeart}>♥</Text>
              <Text style={styles.wearItText}>I'LL WEAR IT</Text>
            </TouchableOpacity>

            {/* Thumbs up */}
            <TouchableOpacity
              style={styles.feedbackSide}
              onPress={handleThumbsUp}
              accessibilityLabel="Like outfit"
            >
              <Text style={styles.feedbackIcon}>👍</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* ── Edit Outfit Modal ─────────────────── */}
      {editOutfit && (
        <EditOutfitModal
          visible={!!editOutfit}
          outfit={editOutfit}
          items={items}
          onClose={() => setEditOutfit(null)}
          onSave={handleEditSave}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop:     SPACING.md,
    paddingBottom:  SPACING.lg,
  },

  hiText: {
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textMedium,
    marginBottom: SPACING.xs,
  },

  headlineText: {
    fontSize:   FONTS.size3XL,
    fontWeight: '800',
    color:      COLORS.textDark,
    lineHeight: FONTS.size3XL * 1.1,
    letterSpacing: 1,
  },

  weatherBadge: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.xs,
    marginTop:     SPACING.xs,
  },

  weatherIcon: {
    fontSize: FONTS.sizeLG,
  },

  weatherText: {
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textMedium,
    fontWeight: '500',
  },

  loadingContainer: {
    alignItems:  'center',
    paddingTop:  SPACING.xxl,
    gap:         SPACING.md,
  },

  loadingText: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.textMedium,
    fontStyle: 'italic',
  },

  dotsRow: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    gap:            SPACING.xs,
    marginBottom:   SPACING.sm,
  },

  dot: {
    width:        24,
    height:       4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryLight,
  },

  dotActive: {
    backgroundColor: COLORS.primary,
    width:           32,
  },

  carousel: {
    marginBottom: SPACING.lg,
  },

  feedbackRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginTop:      SPACING.sm,
  },

  feedbackSide: {
    width:          56,
    height:         56,
    borderRadius:   RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems:     'center',
    justifyContent: 'center',
    ...SHADOW.small,
  },

  feedbackIcon: {
    fontSize: 22,
  },

  wearItButton: {
    width:           120,
    height:          120,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
    ...SHADOW.medium,
  },

  wearItHeart: {
    fontSize: 24,
    color:    COLORS.white,
    marginBottom: SPACING.xs,
  },

  wearItText: {
    fontSize:    FONTS.sizeSM,
    color:       COLORS.white,
    fontWeight:  '700',
    letterSpacing: 0.5,
    textAlign:   'center',
  },
});
