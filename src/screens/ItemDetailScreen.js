// ─────────────────────────────────────────────
// ItemDetailScreen
// Full expanded view of a single wardrobe item.
// Shows:
//   - Large item image
//   - Last worn date
//   - Editable badges / tags
//   - Notes
//   - Outfits this item appears in
//   - Remove from closet
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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import {
  saveItem,
  deleteItem,
  getAllOutfits,
} from '../services/storageService';

export default function ItemDetailScreen({ route, navigation }) {
  const { item: initialItem } = route.params;

  const [item,          setItem]          = useState(initialItem);
  const [outfits,       setOutfits]       = useState([]);
  const [editingTags,   setEditingTags]   = useState(false);
  const [newTag,        setNewTag]        = useState('');
  const [editingNotes,  setEditingNotes]  = useState(false);
  const [notesText,     setNotesText]     = useState(item.notes || '');

  // ── Load outfits that include this item ──────
  useEffect(() => {
    getAllOutfits().then(all => {
      const related = all.filter(o => o.itemIds?.includes(item.id));
      setOutfits(related);
    });
  }, [item.id]);

  // ── Format last-worn date ─────────────────────
  function formatLastWorn(dateStr) {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const diffMs   = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)  return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    return `${Math.floor(diffDays / 7)} weeks ago`;
  }

  // ── Remove a tag ──────────────────────────────
  async function handleRemoveTag(tag) {
    const updated = { ...item, tags: item.tags.filter(t => t !== tag) };
    setItem(updated);
    await saveItem(updated);
  }

  // ── Add a tag ─────────────────────────────────
  async function handleAddTag() {
    const trimmed = newTag.trim();
    if (!trimmed || item.tags?.includes(trimmed)) return;
    const updated = { ...item, tags: [...(item.tags || []), trimmed] };
    setItem(updated);
    setNewTag('');
    await saveItem(updated);
  }

  // ── Save edited notes ─────────────────────────
  async function handleSaveNotes() {
    const updated = { ...item, notes: notesText };
    setItem(updated);
    setEditingNotes(false);
    await saveItem(updated);
  }

  // ── Remove item from closet ───────────────────
  async function handleRemove() {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from your closet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(item.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Back button ──────────────────────── */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Hero image ────────────────────── */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: item.imageUri }}
            style={styles.heroImage}
            resizeMode="contain"
          />

          {/* Last worn chip */}
          <View style={styles.lastWornChip}>
            <Text style={styles.lastWornIcon}>🕐</Text>
            <Text style={styles.lastWornText}>
              LAST WORN: {formatLastWorn(item.lastWorn).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ── Item name & brand ─────────────── */}
        <Text style={styles.itemName}>{item.name}</Text>
        {item.brand && (
          <Text style={styles.itemBrand}>{item.brand}</Text>
        )}

        {/* ── Badges / Tags ─────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>BADGES</Text>
          <TouchableOpacity onPress={() => setEditingTags(!editingTags)}>
            <Text style={styles.editBadgesText}>
              {editingTags ? '✓ Done' : '✏ Edit Badges'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsWrap}>
          {item.tags?.map(tag => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
              {editingTags && (
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag)}
                  style={styles.tagRemove}
                >
                  <Text style={styles.tagRemoveText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Add tag input (shown when editing) */}
          {editingTags && (
            <View style={styles.addTagRow}>
              <TextInput
                style={styles.addTagInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add tag..."
                placeholderTextColor={COLORS.textLight}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={handleAddTag} style={styles.addTagBtn}>
                <Text style={styles.addTagBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Notes ────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>NOTES</Text>
          <TouchableOpacity onPress={() => setEditingNotes(!editingNotes)}>
            <Text style={styles.editBadgesText}>
              {editingNotes ? '' : '✏ Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {editingNotes ? (
          <View style={styles.notesEditContainer}>
            <TextInput
              style={styles.notesInput}
              value={notesText}
              onChangeText={setNotesText}
              multiline
              placeholder="Add styling notes..."
              placeholderTextColor={COLORS.textLight}
              autoFocus
            />
            <TouchableOpacity style={styles.saveNotesBtn} onPress={handleSaveNotes}>
              <Text style={styles.saveNotesBtnText}>Save Notes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>
              {item.notes || '"No notes yet."'}
            </Text>
          </View>
        )}

        {/* ── Outfits featuring this item ──── */}
        {outfits.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>
              IN OUTFITS
            </Text>
            {outfits.map(outfit => (
              <TouchableOpacity
                key={outfit.id}
                style={styles.outfitRow}
                onPress={() => navigation.navigate('OutfitDetail', { outfitId: outfit.id })}
              >
                <Text style={styles.outfitRowName}>{outfit.name}</Text>
                <Text style={styles.outfitRowArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── Remove button ─────────────────── */}
        <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
          <Text style={styles.removeBtnIcon}>⊖</Text>
          <Text style={styles.removeBtnText}>REMOVE FROM CLOSET</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  backBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
  },

  backBtnText: {
    fontSize:   FONTS.sizeMD,
    color:      COLORS.primary,
    fontWeight: '600',
  },

  scrollContent: {
    padding:       SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  heroCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    overflow:        'hidden',
    marginBottom:    SPACING.lg,
    alignItems:      'center',
    paddingTop:      SPACING.lg,
    ...SHADOW.small,
  },

  heroImage: {
    width:  '80%',
    height: 300,
  },

  lastWornChip: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius:    RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    margin:          SPACING.md,
    gap:             SPACING.xs,
  },

  lastWornIcon: {
    fontSize: FONTS.sizeSM,
  },

  lastWornText: {
    fontSize:    FONTS.sizeSM,
    color:       COLORS.textDark,
    fontWeight:  '600',
    letterSpacing: 0.5,
  },

  itemName: {
    fontSize:    FONTS.sizeXL,
    fontWeight:  '700',
    color:       COLORS.textDark,
    marginBottom: SPACING.xs,
  },

  itemBrand: {
    fontSize:     FONTS.sizeMD,
    color:        COLORS.textMedium,
    marginBottom: SPACING.lg,
  },

  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.sm,
  },

  sectionLabel: {
    fontSize:    FONTS.sizeSM,
    color:       COLORS.textMedium,
    fontWeight:  '700',
    letterSpacing: 2,
  },

  editBadgesText: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.primary,
    fontWeight: '600',
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
    marginBottom:  SPACING.lg,
  },

  tagPill: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   COLORS.cardBackground,
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    gap:               SPACING.xs,
  },

  tagText: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.textDark,
    fontWeight: '500',
  },

  tagRemove: {
    marginLeft: SPACING.xs,
  },

  tagRemoveText: {
    fontSize:  FONTS.sizeXS,
    color:     COLORS.negative,
    fontWeight: '700',
  },

  addTagRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.xs,
  },

  addTagInput: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    fontSize:        FONTS.sizeSM,
    color:           COLORS.textDark,
    minWidth:        100,
  },

  addTagBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.full,
    width:           28,
    height:          28,
    alignItems:      'center',
    justifyContent:  'center',
  },

  addTagBtnText: {
    fontSize:  FONTS.sizeLG,
    color:     COLORS.white,
    fontWeight: '700',
  },

  notesBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    marginBottom:    SPACING.lg,
  },

  notesText: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.textMedium,
    lineHeight: FONTS.sizeSM * 1.6,
    fontStyle: 'italic',
  },

  notesEditContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    marginBottom:    SPACING.lg,
  },

  notesInput: {
    fontSize:    FONTS.sizeSM,
    color:       COLORS.textDark,
    lineHeight:  FONTS.sizeSM * 1.6,
    minHeight:   80,
    marginBottom: SPACING.sm,
  },

  saveNotesBtn: {
    alignSelf:       'flex-end',
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
  },

  saveNotesBtnText: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.white,
    fontWeight: '700',
  },

  outfitRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBackground,
  },

  outfitRowName: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.textDark,
  },

  outfitRowArrow: {
    fontSize:  FONTS.sizeLG,
    color:     COLORS.textMedium,
  },

  removeBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   RADIUS.md,
    borderWidth:    1,
    borderColor:    COLORS.negative,
    padding:        SPACING.md,
    marginTop:      SPACING.xl,
    gap:            SPACING.sm,
  },

  removeBtnIcon: {
    fontSize:  FONTS.sizeLG,
    color:     COLORS.negative,
  },

  removeBtnText: {
    fontSize:    FONTS.sizeSM,
    color:       COLORS.negative,
    fontWeight:  '700',
    letterSpacing: 1,
  },
});
