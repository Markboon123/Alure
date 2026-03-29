// ─────────────────────────────────────────────
// DiscoverScreen  (first tab)
// Fonts loaded globally in App.js
// ─────────────────────────────────────────────

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import OutfitCard from '../components/OutfitCard';
import EditOutfitModal from '../components/EditOutfitModal';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { getAllItems, getAllOutfits, saveOutfit, markOutfitWorn } from '../services/storageService';
import { suggestOutfits, fetchWeather } from '../services/geminiService';
import { MOCK_OUTFITS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DiscoverScreen({ navigation, route }) {
  const { user } = useAuth();
  const userName = user?.name || 'there';
  const [weather,          setWeather]          = useState('57°F');
  const [items,            setItems]            = useState([]);
  const [outfits,          setOutfits]          = useState([]);
  const [activeIndex,      setActiveIndex]      = useState(0);
  const [loading,          setLoading]          = useState(true);
  const [editOutfit,       setEditOutfit]       = useState(null);
  const [savedIds,         setSavedIds]         = useState(new Set());
  const [thumbsDownActive, setThumbsDownActive] = useState(false);
  const [thumbsUpActive,   setThumbsUpActive]   = useState(false);
  const [feedbackLiked,    setFeedbackLiked]    = useState([]);
  const [feedbackDisliked, setFeedbackDisliked] = useState([]);
  const flatListRef = useRef(null);
  const hasLoaded   = useRef(false);

  // Generated theme from AI prompt screen (replaces "TODAY'S OUTFITS" + weather)
  const generatedTheme    = route.params?.theme;
  const generatedOutfits  = route.params?.generatedOutfits;

  useFocusEffect(
    useCallback(() => {
      // Only reload if: first load, or new generated outfits arrived from another screen
      if (!hasLoaded.current || generatedOutfits) {
        hasLoaded.current = true;
        loadData();
      }
    }, [route.params?.generatedOutfits])
  );

  async function loadData(likedStyles = [], dislikedStyles = []) {
    setLoading(true);
    // Reset carousel position
    setActiveIndex(0);
    setThumbsDownActive(false);
    setThumbsUpActive(false);
    try {
      const [loadedItems, loadedOutfits] = await Promise.all([
        getAllItems(),
        getAllOutfits(),
      ]);
      setItems(loadedItems);

      // If we have AI-prompt-generated outfits from GenerateOutfitScreen, use them
      if (generatedOutfits && generatedOutfits.length > 0) {
        setOutfits(generatedOutfits);
      } else {
        const favoriteOutfits = loadedOutfits
          .filter(o => o.isFavorite)
          .map(o => ({ name: o.name, tags: o.tags || [] }));

        const userPrefs = user?.styles?.length > 0 ? user.styles : ['Casual', 'Comfy'];

        // Normal flow: ask Gemini for today's suggestions
        const aiOutfits = await suggestOutfits({
          items: loadedItems,
          weather: weather,
          preferences: userPrefs,
          outfitCount: 3,
          likedStyles,
          dislikedStyles,
          favoriteOutfits,
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
    if (newIndex !== activeIndex) {
      setThumbsUpActive(false);
      setThumbsDownActive(false);
    }
    setActiveIndex(newIndex);
  }

  function handleThumbsDown() {
    const outfit = outfits[activeIndex];
    const newDisliked = outfit?.tags ? [...feedbackDisliked, ...outfit.tags] : feedbackDisliked;
    setFeedbackDisliked(newDisliked);
    setThumbsDownActive(true);
    setThumbsUpActive(false);

    const nextIndex = activeIndex + 1;
    if (nextIndex < outfits.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      // Regenerate with accumulated feedback
      loadData(feedbackLiked, newDisliked);
    }
  }

  async function handleWearIt() {
    const outfit = outfits[activeIndex];
    if (!outfit) return;
    try {
      await markOutfitWorn(outfit.id);
      Alert.alert('Outfit logged!', 'Your pieces have been marked as worn today.');
    } catch (err) {
      console.error('handleWearIt error:', err);
    }
  }

  function handleThumbsUp() {
    const outfit = outfits[activeIndex];
    if (thumbsUpActive) {
      const tagsToRemove = new Set(outfit?.tags || []);
      setFeedbackLiked(prev => prev.filter(t => !tagsToRemove.has(t)));
      setThumbsUpActive(false);
    } else {
      const newLiked = outfit?.tags ? [...feedbackLiked, ...outfit.tags] : feedbackLiked;
      setFeedbackLiked(newLiked);
      setThumbsUpActive(true);
      setThumbsDownActive(false);
    }
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
      <View style={{ width: SCREEN_WIDTH, paddingHorizontal: SPACING.lg, flex: 1 }}>
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

      {/* ── Top Nav Bar — matches ClosetScreen ── */}
      <View style={styles.topBar}>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Settings" onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.brandName}>ALURÉ</Text>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Help" onPress={() => navigation.navigate('Help')}>
          <Ionicons name="help-circle-outline" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        {generatedTheme ? (
          /* Generated theme: text grows downward, button stays anchored top-right */
          <View style={styles.headerBottomRow}>
            <Text style={styles.themeText}>{generatedTheme}</Text>
            <TouchableOpacity
              style={styles.sparkleButton}
              onPress={() => navigation.navigate('GenerateOutfit')}
              accessibilityLabel="Generate outfit with AI"
            >
              <Ionicons name="sparkles" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Row 1: greeting alone */}
            <Text style={styles.hiText}>Hi, {userName}</Text>

            {/* Row 2: TODAY'S + weather (left)  |  sparkle (right) */}
            <View style={styles.todaysRow}>
              <View style={styles.todaysLeft}>
                <Text style={styles.headlineText}>TODAY'S</Text>
                <View style={styles.weatherBadge}>
                  <Ionicons name="sunny-outline" size={18} color={COLORS.textMedium} />
                  <Text style={styles.weatherText}>{weather}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.sparkleButton}
                onPress={() => navigation.navigate('GenerateOutfit')}
                accessibilityLabel="Generate outfit with AI"
              >
                <Ionicons name="sparkles" size={26} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Row 3: OUTFITS alone */}
            <Text style={styles.headlineText}>OUTFITS</Text>
          </>
        )}
      </View>

      {/* ── Carousel + Dots ── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Styling your day...</Text>
        </View>
      ) : (
        <View style={styles.carouselArea}>
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
        </View>
      )}

      {/* ── Feedback buttons ── */}
      {!loading && (
        <View style={styles.feedbackRow}>
          <TouchableOpacity
            style={[styles.feedbackSide, thumbsDownActive && styles.feedbackSideActive]}
            onPress={handleThumbsDown}
            accessibilityLabel="Skip outfit"
          >
            <Ionicons
              name="thumbs-down"
              size={22}
              color={thumbsDownActive ? COLORS.white : COLORS.textMedium}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.wearItButton}
            onPress={handleWearIt}
            accessibilityLabel="I'll wear this outfit"
          >
            <Ionicons name="heart" size={18} color={COLORS.white} style={{ marginBottom: 4 }} />
            <Text style={styles.wearItText}>I'LL WEAR IT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.feedbackSide, thumbsUpActive && styles.feedbackSideActive]}
            onPress={handleThumbsUp}
            accessibilityLabel="Like outfit"
          >
            <Ionicons
              name="thumbs-up"
              size={22}
              color={thumbsUpActive ? COLORS.white : COLORS.textMedium}
            />
          </TouchableOpacity>
        </View>
      )}

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

  // ── Top bar — mirrors ClosetScreen exactly ──
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

  // ── Header ──
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xs,
    paddingBottom:     SPACING.md,
  },

  headerBottomRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
  },

  themeText: {
    flex:          1,
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.size2XL,
    color:         COLORS.textDark,
    lineHeight:    FONTS.size2XL * 1.1,
    letterSpacing: 1,
    marginRight:   SPACING.sm,
    paddingTop:    4,
  },

  hiText: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textMedium,
  },

  // Row 1: greeting + sparkle
  greetingRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },

  // Row 2: TODAY'S + weather + sparkle
  todaysRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },

  todaysLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
  },

  headlineText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.size2XL,
    color:         COLORS.textDark,
    lineHeight:    FONTS.size2XL * 1.1,
    letterSpacing: 1,
  },

  sparkleButton: {
    width:           48,
    height:          48,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    alignItems:      'center',
    justifyContent:  'center',
    ...SHADOW.small,
  },

  weatherBadge: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },

  weatherText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeLG,
    color:      COLORS.textMedium,
  },

  // ── Loading ──
  loadingContainer: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.md,
  },

  loadingText: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textMedium,
    fontStyle:  'italic',
  },

  // ── Carousel ──
  carouselArea: {
    flex: 1,
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
    flex: 1,
  },

  // ── Feedback row ──
  feedbackRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xs,
    paddingBottom:     SPACING.sm,
  },

  feedbackSide: {
    width:           52,
    height:          52,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems:      'center',
    justifyContent:  'center',
    ...SHADOW.small,
  },

  feedbackSideActive: {
    backgroundColor: COLORS.primary,
  },

  wearItButton: {
    width:           84,
    height:          84,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
    ...SHADOW.medium,
  },

  wearItText: {
    fontFamily:    FONTS.bold,
    fontSize:      9,
    color:         COLORS.white,
    letterSpacing: 0.5,
    textAlign:     'center',
  },
});
