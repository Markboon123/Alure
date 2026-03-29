// ─────────────────────────────────────────────
// AddItemScreen
// Lets users add a clothing item in two ways:
//   1. Upload / take a photo  → Gemini analyzes it
//   2. Paste a product URL    → scrape + pick image
// After adding, navigates back to the Closet tab.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { saveItem } from '../services/storageService';
import { analyzeClothingImage } from '../services/geminiService';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function AddItemScreen({ navigation }) {
  // ── State ─────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState('photo');  // 'photo' | 'url'
  const [pickedImage,   setPickedImage]   = useState(null);     // { uri, base64 }
  const [urlInput,      setUrlInput]      = useState('');
  const [analyzing,     setAnalyzing]     = useState(false);
  const [analyzedData,  setAnalyzedData]  = useState(null);     // from Gemini
  const [saving,        setSaving]        = useState(false);

  // ── Photo picker ──────────────────────────────
  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow access to your photo library to add items.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPickedImage({ uri: asset.uri, base64: asset.base64 });
      setAnalyzedData(null);
    }
  }

  // ── Camera ────────────────────────────────────
  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPickedImage({ uri: asset.uri, base64: asset.base64 });
      setAnalyzedData(null);
    }
  }

  // ── Analyze with Gemini ───────────────────────
  async function handleAnalyze() {
    if (!pickedImage?.base64) return;
    setAnalyzing(true);
    try {
      const data = await analyzeClothingImage({
        base64Image: pickedImage.base64,
        mimeType: 'image/jpeg',
      });
      setAnalyzedData(data);
    } catch (err) {
      console.error('handleAnalyze error:', err);
      Alert.alert('Analysis failed', 'Could not analyze the image. You can still add it manually.');
      setAnalyzedData({
        name: 'New Item',
        category: 'top',
        color: '',
        tags: [],
        style: 'Casual',
        weather: ['Any'],
        notes: '',
      });
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Save item to storage ──────────────────────
  async function handleAddItem() {
    if (!pickedImage) {
      Alert.alert('No image', 'Please pick or take a photo first.');
      return;
    }
    if (!analyzedData) {
      // Auto-analyze if not done yet
      await handleAnalyze();
      return;
    }

    setSaving(true);
    try {
      const newItem = {
        id:        `item_${Date.now()}`,
        name:      analyzedData.name || 'New Item',
        brand:     '',
        category:  analyzedData.category || 'top',
        imageUri:  pickedImage.uri,
        tags:      analyzedData.tags || [],
        notes:     analyzedData.notes || '',
        color:     analyzedData.color || '',
        style:     analyzedData.style || 'Casual',
        weather:   analyzedData.weather || ['Any'],
        lastWorn:  null,
        timesWorn: 0,
        addedAt:   new Date().toISOString(),
      };
      await saveItem(newItem);
      Alert.alert('Added! 🎉', `"${newItem.name}" has been added to your closet.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('handleAddItem error:', err);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── URL tab (placeholder for future expansion) ─
  function renderUrlTab() {
    return (
      <View style={styles.urlTab}>
        <Text style={styles.urlLabel}>
          Paste a product URL from any online store:
        </Text>
        <TextInput
          style={styles.urlInput}
          value={urlInput}
          onChangeText={setUrlInput}
          placeholder="https://www.zara.com/..."
          placeholderTextColor={COLORS.textLight}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.urlFetchBtn}>
          <Text style={styles.urlFetchBtnText}>Find Images (Coming Soon)</Text>
        </TouchableOpacity>
        <Text style={styles.comingSoonNote}>
          🚧 URL import is coming in a future update!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ───────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADD ITEM</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ── Tab switcher ─────────────────────── */}
      <View style={styles.tabs}>
        {['photo', 'url'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'photo' ? '📸 Photo / Camera' : '🔗 URL'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {activeTab === 'photo' ? (
          <>
            {/* ── Image preview ────────────────── */}
            <View style={styles.imagePreviewContainer}>
              {pickedImage ? (
                <Image
                  source={{ uri: pickedImage.uri }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderIcon}>👕</Text>
                  <Text style={styles.imagePlaceholderText}>
                    No image selected
                  </Text>
                </View>
              )}
            </View>

            {/* ── Pick / Take buttons ───────────── */}
            <View style={styles.imageActionRow}>
              <TouchableOpacity style={styles.imageActionBtn} onPress={handlePickPhoto}>
                <Text style={styles.imageActionBtnText}>📁 Upload Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageActionBtn} onPress={handleTakePhoto}>
                <Text style={styles.imageActionBtnText}>📸 Take Photo</Text>
              </TouchableOpacity>
            </View>

            {/* ── Retake / Analyze ─────────────── */}
            {pickedImage && (
              <View style={styles.analyzeSection}>
                {!analyzedData ? (
                  <TouchableOpacity
                    style={styles.analyzeBtn}
                    onPress={handleAnalyze}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.analyzeBtnText}>✨ Analyze with AI</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  /* ── Analyzed results card ─────── */
                  <View style={styles.analyzedCard}>
                    <Text style={styles.analyzedTitle}>AI Analysis</Text>

                    <InfoRow label="Name"     value={analyzedData.name} />
                    <InfoRow label="Category" value={analyzedData.category} />
                    <InfoRow label="Color"    value={analyzedData.color} />
                    <InfoRow label="Style"    value={analyzedData.style} />

                    <Text style={styles.analyzedLabel}>Tags</Text>
                    <View style={styles.tagsWrap}>
                      {analyzedData.tags?.map(tag => (
                        <View key={tag} style={styles.tagPill}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    {analyzedData.notes ? (
                      <>
                        <Text style={styles.analyzedLabel}>Notes</Text>
                        <Text style={styles.analyzedNotes}>{analyzedData.notes}</Text>
                      </>
                    ) : null}
                  </View>
                )}
              </View>
            )}

            {/* ── Add Item CTA ─────────────────── */}
            {pickedImage && (
              <TouchableOpacity
                style={[styles.addBtn, saving && { opacity: 0.6 }]}
                onPress={handleAddItem}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.addBtnText}>
                    {analyzedData ? 'Add to Closet' : 'Analyze & Add'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          renderUrlTab()
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Small helper row ──────────────────────────
function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
  },

  cancelText: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.primary,
    fontWeight: '600',
  },

  headerTitle: {
    fontSize:   FONTS.sizeLG,
    fontWeight: '800',
    color:      COLORS.textDark,
    letterSpacing: 2,
  },

  tabs: {
    flexDirection:  'row',
    paddingHorizontal: SPACING.lg,
    gap:            SPACING.sm,
    marginBottom:   SPACING.md,
  },

  tab: {
    flex:              1,
    paddingVertical:   SPACING.sm,
    borderRadius:      RADIUS.full,
    backgroundColor:   COLORS.cardBackground,
    alignItems:        'center',
  },

  tabActive: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.textMedium,
    fontWeight: '600',
  },

  tabTextActive: {
    color: COLORS.white,
  },

  scrollContent: {
    padding:       SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  imagePreviewContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.lg,
    height:          300,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.md,
    overflow:        'hidden',
  },

  imagePreview: {
    width:  '100%',
    height: '100%',
  },

  imagePlaceholder: {
    alignItems: 'center',
    gap:        SPACING.sm,
  },

  imagePlaceholderIcon: {
    fontSize: 56,
  },

  imagePlaceholderText: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.textLight,
  },

  imageActionRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    marginBottom:  SPACING.lg,
  },

  imageActionBtn: {
    flex:              1,
    backgroundColor:   COLORS.cardBackground,
    borderRadius:      RADIUS.md,
    paddingVertical:   SPACING.md,
    alignItems:        'center',
    ...SHADOW.small,
  },

  imageActionBtnText: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.textDark,
    fontWeight: '600',
  },

  analyzeSection: {
    marginBottom: SPACING.lg,
  },

  analyzeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems:      'center',
  },

  analyzeBtnText: {
    fontSize:   FONTS.sizeMD,
    color:      COLORS.white,
    fontWeight: '700',
  },

  analyzedCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
  },

  analyzedTitle: {
    fontSize:    FONTS.sizeLG,
    fontWeight:  '700',
    color:       COLORS.textDark,
    marginBottom: SPACING.md,
  },

  infoRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    marginBottom:  SPACING.xs,
  },

  infoLabel: {
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    fontWeight: '600',
    width:      80,
  },

  infoValue: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.textDark,
    flex:      1,
    textTransform: 'capitalize',
  },

  analyzedLabel: {
    fontSize:    FONTS.sizeSM,
    color:       COLORS.textMedium,
    fontWeight:  '600',
    marginTop:   SPACING.sm,
    marginBottom: SPACING.xs,
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.xs,
  },

  tagPill: {
    backgroundColor: COLORS.white,
    borderRadius:    RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical:   2,
  },

  tagText: {
    fontSize:  FONTS.sizeXS,
    color:     COLORS.textDark,
    fontWeight: '600',
  },

  analyzedNotes: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.textMedium,
    fontStyle: 'italic',
    lineHeight: FONTS.sizeSM * 1.5,
  },

  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems:      'center',
    ...SHADOW.medium,
  },

  addBtnText: {
    fontSize:   FONTS.sizeMD,
    color:      COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // URL tab
  urlTab: {
    gap: SPACING.md,
  },

  urlLabel: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.textMedium,
  },

  urlInput: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    fontSize:        FONTS.sizeMD,
    color:           COLORS.textDark,
  },

  urlFetchBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius:    RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems:      'center',
  },

  urlFetchBtnText: {
    fontSize:  FONTS.sizeMD,
    color:     COLORS.white,
    fontWeight: '700',
  },

  comingSoonNote: {
    fontSize:  FONTS.sizeSM,
    color:     COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
