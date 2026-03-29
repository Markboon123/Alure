// ─────────────────────────────────────────────
// DiscoverScreen  (first tab)
// Fonts loaded globally in App.js
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
  const [editOutfit,  setEditOutfit]  = useState(null);
  const [savedIds,    setSavedIds]    = useState(new Set());
  const flatListRef = useRef(null);

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

      const aiOutfits = await suggestOutfits({
        items: loadedItems,
        weather: weather,
        preferences: ['Bold', 'Colorful', 'Comfy'],
        outfitCount: 3,
      });

      if (aiOutfits && aiOutfits.length > 0) {
        const resolved = aiOutfits.map((suggestion, idx) => ({
          id:         `ai_outfit_${Date.now()}_${idx}`,
          name:       suggestion.name,
          tags:       suggestion.tags,
          itemIds:    suggestion.itemIds,
          style:      suggestion.style,
          isFavorite: false,
          wornDates:  [],
          aiScore:    0.85,
          reason:     suggestion.reason,
        }));
        setOutfits(resolved);
      } else {
        const displayOutfits = loadedOutfits.length > 0
          ? loadedOutfits.slice(0, 3)
          : MOCK_OUTFITS.slice(0, 3);
        setOutfits(displayOutfits);
      }

      const favSet = new Set(loadedOutfits.filter(o => o.isFavorite).map(o => o.id));
      setSavedIds(favSet);
    } catch (err) {
      console.error('loadData error:', err);
      setOutfits(MOCK_OUTFITS.slice(0, 3));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather().then(w => setWeather(w)).catch(() => {});
  }, []);

  function handleScroll(event) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    setActiveIndex(newIndex);
  }

  function handleThumbsDown() {
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
      Alert.alert('Outfit logged! 🎉', 'Your pieces have been marked as worn today.');
    } catch (err) {
      console.error('handleWearIt error:', err);
    }
  }

  function handleThumbsUp() {
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

  function renderDots() {
    return (
      <View style={styles.dotsRow}>
        {outfits.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    );
  }

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
        {/* ── Header ── */}
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

        {/* ── Carousel ── */}
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

        {/* ── Feedback buttons ── */}
        {!loading && (
          <View style={styles.feedbackRow}>
            <TouchableOpacity
              style={styles.feedbackSide}
              onPress={handleThumbsDown}
              accessibilityLabel="Skip outfit"
            >
              <Text style={styles.feedbackIcon}>👎</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.wearItButton}
              onPress={handleWearIt}
              accessibilityLabel="I'll wear this outfit"
            >
              <Text style={styles.wearItHeart}>♥</Text>
              <Text style={styles.wearItText}>I'LL WEAR IT</Text>
            </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.md,
    paddingBottom:     SPACING.lg,
  },

  hiText: {
    fontFamily:   FONTS.regular,
    fontSize:     FONTS.sizeMD,
    color:        COLORS.textMedium,
    marginBottom: SPACING.xs,
  },

  headlineText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.size3XL * 1.1,
    color:         COLORS.textDark,
    lineHeight:    FONTS.size3XL * 1.2,
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
    fontFamily: FONTS.medium,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textMedium,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    gap:        SPACING.md,
  },

  loadingText: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textMedium,
    fontStyle:  'italic',
  },

  dotsRow: {
    flexDirection:     'row',
    justifyContent:    'flex-end',
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.xs,
    marginBottom:      SPACING.sm,
  },

  dot: {
    width:           24,
    height:          4,
    borderRadius:    2,
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
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginTop:         SPACING.sm,
  },

  feedbackSide: {
    width:           56,
    height:          56,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems:      'center',
    justifyContent:  'center',
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
    fontSize:     24,
    color:        COLORS.white,
    marginBottom: SPACING.xs,
  },

  wearItText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeSM,
    color:         COLORS.white,
    letterSpacing: 0.5,
    textAlign:     'center',
  },
});
