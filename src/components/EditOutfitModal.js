// ─────────────────────────────────────────────
// EditOutfitModal Component
// Fonts loaded globally in App.js
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_SIZE    = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2;

export default function EditOutfitModal({
  visible,
  outfit,
  items,
  onClose,
  onSave,
}) {
  const [currentIds,   setCurrentIds]   = useState(outfit?.itemIds || []);
  const [swapCategory, setSwapCategory] = useState(null);

  const outfitItems = currentIds.map(id => items.find(i => i.id === id)).filter(Boolean);

  function handleRemove(itemId) {
    setCurrentIds(prev => prev.filter(id => id !== itemId));
  }

  function handleSwapPress(category) {
    setSwapCategory(category);
  }

  function handleSwapSelect(newItem) {
    const withoutCategory = currentIds.filter(id => {
      const found = items.find(i => i.id === id);
      return found?.category !== swapCategory;
    });
    setCurrentIds([...withoutCategory, newItem.id]);
    setSwapCategory(null);
  }

  function handleSave() {
    onSave({ ...outfit, itemIds: currentIds });
  }

  const swapCandidates = swapCategory
    ? items.filter(i => i.category === swapCategory && !currentIds.includes(i.id))
    : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Outfit</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* ── Outfit items grid ── */}
          <Text style={styles.sectionLabel}>PIECES</Text>
          <View style={styles.itemsGrid}>
            {outfitItems.map(item => (
              <View key={item.id} style={[styles.itemCell, { width: ITEM_SIZE, height: ITEM_SIZE }]}>
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />

                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>

                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.swapBtn} onPress={() => handleSwapPress(item.category)}>
                  <Text style={styles.swapBtnText}>↻</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* ── Swap panel ── */}
          {swapCategory && (
            <View style={styles.swapPanel}>
              <View style={styles.swapPanelHeader}>
                <Text style={styles.swapPanelTitle}>
                  Swap {swapCategory.toUpperCase()}
                </Text>
                <TouchableOpacity onPress={() => setSwapCategory(null)}>
                  <Text style={styles.swapPanelClose}>Done</Text>
                </TouchableOpacity>
              </View>

              {swapCandidates.length === 0 ? (
                <Text style={styles.emptyText}>
                  No other {swapCategory}s in your closet yet.
                </Text>
              ) : (
                <FlatList
                  data={swapCandidates}
                  keyExtractor={i => i.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.swapList}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSwapSelect(item)} style={styles.swapCandidate}>
                      <Image
                        source={{ uri: item.imageUri }}
                        style={styles.swapCandidateImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.swapCandidateName} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryLight,
  },

  closeBtn: {
    width:           36,
    height:          36,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    alignItems:      'center',
    justifyContent:  'center',
  },

  closeBtnText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
  },

  headerTitle: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeLG,
    color:         COLORS.textDark,
    letterSpacing: 1,
  },

  saveBtn: {
    backgroundColor:   COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    borderRadius:      RADIUS.full,
  },

  saveBtnText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.white,
  },

  scrollContent: {
    padding:       SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  sectionLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeSM,
    color:         COLORS.textMedium,
    letterSpacing: 2,
    marginBottom:  SPACING.md,
  },

  itemsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
    marginBottom:  SPACING.xl,
  },

  itemCell: {
    borderRadius:    RADIUS.md,
    overflow:        'hidden',
    backgroundColor: COLORS.cardBackground,
  },

  itemImage: {
    width:  '100%',
    height: '100%',
  },

  categoryBadge: {
    position:          'absolute',
    top:               SPACING.xs,
    left:              SPACING.xs,
    backgroundColor:   'rgba(0,0,0,0.55)',
    borderRadius:      RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical:   2,
  },

  categoryBadgeText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    color:         COLORS.white,
    letterSpacing: 0.5,
  },

  removeBtn: {
    position:        'absolute',
    top:             SPACING.xs,
    right:           SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius:    RADIUS.full,
    width:           28,
    height:          28,
    alignItems:      'center',
    justifyContent:  'center',
  },

  removeBtnText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.white,
  },

  swapBtn: {
    position:        'absolute',
    bottom:          SPACING.xs,
    right:           SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.full,
    width:           32,
    height:          32,
    alignItems:      'center',
    justifyContent:  'center',
  },

  swapBtnText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeLG,
    color:      COLORS.white,
  },

  swapPanel: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    ...SHADOW.small,
  },

  swapPanelHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.md,
  },

  swapPanelTitle: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeMD,
    color:         COLORS.textDark,
    letterSpacing: 1,
  },

  swapPanelClose: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.primary,
  },

  swapList: {
    gap:           SPACING.sm,
    paddingBottom: SPACING.sm,
  },

  swapCandidate: {
    width:       100,
    marginRight: SPACING.sm,
    alignItems:  'center',
  },

  swapCandidateImage: {
    width:        100,
    height:       100,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },

  swapCandidateName: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    textAlign:  'center',
  },

  emptyText: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textLight,
    textAlign:  'center',
    padding:    SPACING.md,
  },
});
