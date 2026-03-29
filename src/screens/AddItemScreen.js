// ─────────────────────────────────────────────
// AddItemScreen
// Fonts loaded globally in App.js
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { saveItem } from '../services/storageService';
import { analyzeClothingImage } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

export default function AddItemScreen({ navigation, route }) {
  const { user, login } = useAuth();
  const isOnboarding = route.params?.isOnboarding === true;
  const [itemName,     setItemName]     = useState('');
  const [pickedImage,  setPickedImage]  = useState(null);
  const [urlInput,     setUrlInput]     = useState('');
  const [analyzing,    setAnalyzing]    = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [saving,       setSaving]       = useState(false);

  async function handlePickPhoto() {
    Alert.alert(
      'Add Photo',
      'Choose how to add your item photo',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: handleLibraryPhoto,
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

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

  async function handleLibraryPhoto() {
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

  async function handleAnalyze() {
    if (!pickedImage?.base64) return;
    setAnalyzing(true);
    try {
      const data = await analyzeClothingImage({
        base64Image: pickedImage.base64,
        mimeType: 'image/jpeg',
      });
      setAnalyzedData(data);
      if (!itemName && data.name) setItemName(data.name);
    } catch (err) {
      console.error('handleAnalyze error:', err);
      setAnalyzedData({
        name: itemName || 'New Item', category: 'top', color: '',
        tags: [], style: 'Casual', weather: ['Any'], notes: '',
      });
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAddItem() {
    if (!pickedImage) {
      Alert.alert('No image', 'Please add a photo first.');
      return;
    }

    let data = analyzedData;
    if (!data) {
      setAnalyzing(true);
      try {
        data = await analyzeClothingImage({
          base64Image: pickedImage.base64,
          mimeType: 'image/jpeg',
        });
        setAnalyzedData(data);
        if (!itemName && data.name) setItemName(data.name);
      } catch {
        data = {
          name: itemName || 'New Item', category: 'top', color: '',
          tags: [], style: 'Casual', weather: ['Any'], notes: '',
        };
      } finally {
        setAnalyzing(false);
      }
    }

    setSaving(true);
    try {
      const newItem = {
        id:        `item_${Date.now()}`,
        name:      itemName || data.name || 'New Item',
        brand:     '',
        category:  data.category || 'top',
        imageUri:  pickedImage.uri,
        tags:      data.tags || [],
        notes:     data.notes || '',
        color:     data.color || '',
        style:     data.style || 'Casual',
        weather:   data.weather || ['Any'],
        lastWorn:  null,
        timesWorn: 0,
        addedAt:   new Date().toISOString(),
      };
      await saveItem(newItem);
      if (isOnboarding) {
        await login({ ...user, isNewUser: false });
      } else {
        Alert.alert('Added!', `"${newItem.name}" has been added to your closet.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      console.error('handleAddItem error:', err);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        {isOnboarding ? (
          <View style={{ width: 60 }} />
        ) : (
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {isOnboarding ? 'BUILD YOUR CLOSET' : 'ADD ITEM'}
        </Text>
        {isOnboarding ? (
          <TouchableOpacity onPress={() => login({ ...user, isNewUser: false })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.cancelText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {isOnboarding && (
        <Text style={styles.onboardingSubtitle}>
          Add your first piece to get personalised outfit suggestions
        </Text>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Item Name ── */}
        <Text style={styles.sectionLabel}>ITEM NAME</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.nameInput}
            value={itemName}
            onChangeText={setItemName}
            placeholder="e.g. Varsity Jacket"
            placeholderTextColor={COLORS.textLight}
            returnKeyType="done"
          />
        </View>

        {/* ── Product Imagery ── */}
        <Text style={styles.sectionLabel}>PRODUCT IMAGERY</Text>

        <TouchableOpacity
          style={styles.dropZone}
          onPress={handlePickPhoto}
          activeOpacity={0.7}
        >
          {pickedImage ? (
            <Image source={{ uri: pickedImage.uri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.dropZoneContent}>
              <View style={styles.cameraIconWrap}>
                <Ionicons name="camera-outline" size={32} color={COLORS.textMedium} />
                <View style={styles.plusBadge}>
                  <Ionicons name="add" size={12} color={COLORS.white} />
                </View>
              </View>
              <Text style={styles.dropZoneTitle}>Drop photo here or tap to browse</Text>
              <Text style={styles.dropZoneSubtitle}>Supports JPG, PNG (Max 10MB)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── OR divider ── */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* ── URL input ── */}
        <View style={styles.urlInputCard}>
          <Ionicons name="link-outline" size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.urlInput}
            value={urlInput}
            onChangeText={setUrlInput}
            placeholder="Paste image URL..."
            placeholderTextColor={COLORS.textLight}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
        </View>

        {/* ── AI analyzed card (shown after analysis) ── */}
        {analyzedData && (
          <View style={styles.analyzedCard}>
            <View style={styles.analyzedTitleRow}>
              <Ionicons name="sparkles" size={16} color={COLORS.primary} />
              <Text style={styles.analyzedTitle}>AI Analysis</Text>
            </View>
            <InfoRow label="Category" value={analyzedData.category} />
            <InfoRow label="Color"    value={analyzedData.color} />
            <InfoRow label="Style"    value={analyzedData.style} />
            {analyzedData.tags?.length > 0 && (
              <View style={styles.tagsWrap}>
                {analyzedData.tags.map(tag => (
                  <View key={tag} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Analyze button (shown when photo picked, not yet analyzed) ── */}
        {pickedImage && !analyzedData && (
          <TouchableOpacity
            style={styles.analyzeBtn}
            onPress={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={16} color={COLORS.white} />
                <Text style={styles.analyzeBtnText}>Analyze with AI</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* ── Add Item button ── */}
        <TouchableOpacity
          style={[styles.addBtn, (saving || analyzing) && { opacity: 0.6 }]}
          onPress={handleAddItem}
          disabled={saving || analyzing}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.addBtnText}>Add Item</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  // ── Header ──
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
  },

  cancelText: {
    fontFamily: FONTS.medium,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.primary,
    width:      60,
  },

  onboardingSubtitle: {
    fontFamily:        FONTS.regular,
    fontSize:          FONTS.sizeMD,
    color:             COLORS.textMedium,
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.sm,
  },

  headerTitle: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeLG,
    color:         COLORS.textDark,
    letterSpacing: 2,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.xxl,
  },

  // ── Section labels ──
  sectionLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeXS,
    color:         COLORS.textMedium,
    letterSpacing: 1.5,
    marginBottom:  SPACING.sm,
    marginTop:     SPACING.md,
  },

  // ── Name input ──
  inputCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm + 2,
    marginBottom:    SPACING.sm,
  },

  nameInput: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
  },

  // ── Drop zone ──
  dropZone: {
    borderWidth:     1.5,
    borderColor:     COLORS.primaryLight,
    borderStyle:     'dashed',
    borderRadius:    RADIUS.lg,
    height:          220,
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'hidden',
    backgroundColor: COLORS.cardBackground,
    marginBottom:    SPACING.md,
  },

  dropZoneContent: {
    alignItems: 'center',
    gap:        SPACING.sm,
  },

  cameraIconWrap: {
    width:           64,
    height:          64,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.inputBackground,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.xs,
  },

  plusBadge: {
    position:        'absolute',
    top:             8,
    right:           8,
    width:           18,
    height:          18,
    borderRadius:    9,
    backgroundColor: COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },

  previewImage: {
    width:  '100%',
    height: '100%',
  },

  dropZoneTitle: {
    fontFamily: FONTS.medium,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
    textAlign:  'center',
  },

  dropZoneSubtitle: {
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textLight,
    textAlign:  'center',
  },

  // ── OR divider ──
  orRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.md,
    marginBottom:  SPACING.md,
  },

  orLine: {
    flex:            1,
    height:          1,
    backgroundColor: COLORS.primaryLight,
  },

  orText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONTS.sizeSM,
    color:         COLORS.textLight,
    letterSpacing: 1,
  },

  // ── URL input ──
  urlInputCard: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   COLORS.cardBackground,
    borderRadius:      RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm + 2,
    gap:               SPACING.sm,
    marginBottom:      SPACING.lg,
  },

  urlInput: {
    flex:       1,
    fontFamily: FONTS.regular,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
  },

  // ── AI analyzed card ──
  analyzedCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    marginBottom:    SPACING.md,
    ...SHADOW.small,
  },

  analyzedTitleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.xs,
    marginBottom:  SPACING.sm,
  },

  analyzedTitle: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeMD,
    color:      COLORS.textDark,
  },

  infoRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    marginBottom:  SPACING.xs,
  },

  infoLabel: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.textMedium,
    width:      72,
  },

  infoValue: {
    fontFamily:    FONTS.regular,
    fontSize:      FONTS.sizeSM,
    color:         COLORS.textDark,
    flex:          1,
    textTransform: 'capitalize',
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.xs,
    marginTop:     SPACING.xs,
  },

  tagPill: {
    backgroundColor:   COLORS.white,
    borderRadius:      RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical:   2,
  },

  tagText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeXS,
    color:      COLORS.textDark,
  },

  // ── Analyze button ──
  analyzeBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius:    RADIUS.md,
    paddingVertical: SPACING.sm,
    marginBottom:    SPACING.md,
  },

  analyzeBtnText: {
    fontFamily: FONTS.bold,
    fontSize:   FONTS.sizeSM,
    color:      COLORS.white,
  },

  // ── Add Item button ──
  addBtn: {
    backgroundColor: COLORS.textDark,
    borderRadius:    RADIUS.full,
    paddingVertical: SPACING.md + 2,
    alignItems:      'center',
    ...SHADOW.medium,
  },

  addBtnText: {
    fontFamily:    FONTS.medium,
    fontSize:      FONTS.sizeMD,
    color:         COLORS.white,
    letterSpacing: 0.3,
  },
});
