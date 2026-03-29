// ─────────────────────────────────────────────
// Storage Service
// Wraps AsyncStorage for persisting wardrobe
// items, outfits, and user preferences locally.
// ─────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_ITEMS, MOCK_OUTFITS, MOCK_USER } from '../data/mockData';

const KEYS = {
  ITEMS:       'alure_items',
  OUTFITS:     'alure_outfits',
  USER:        'alure_user',
  INITIALIZED: 'alure_initialized',
};

// ── Seed with mock data on first launch ───────
export async function initializeStorage() {
  try {
    const initialized = await AsyncStorage.getItem(KEYS.INITIALIZED);
    if (!initialized) {
      await AsyncStorage.setItem(KEYS.ITEMS,   JSON.stringify(MOCK_ITEMS));
      await AsyncStorage.setItem(KEYS.OUTFITS, JSON.stringify(MOCK_OUTFITS));
      await AsyncStorage.setItem(KEYS.USER,    JSON.stringify(MOCK_USER));
      await AsyncStorage.setItem(KEYS.INITIALIZED, 'true');
    }
  } catch (err) {
    console.error('initializeStorage error:', err);
  }
}

// ── Items ─────────────────────────────────────
export async function getAllItems() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ITEMS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('getAllItems error:', err);
    return [];
  }
}

export async function saveItem(item) {
  try {
    const items = await getAllItems();
    const existingIndex = items.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = item;  // update existing
    } else {
      items.unshift(item);          // prepend so newest is first
    }
    await AsyncStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
    return items;
  } catch (err) {
    console.error('saveItem error:', err);
  }
}

export async function deleteItem(itemId) {
  try {
    const items = await getAllItems();
    const filtered = items.filter(i => i.id !== itemId);
    await AsyncStorage.setItem(KEYS.ITEMS, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('deleteItem error:', err);
  }
}

// Mark an item as worn today — updates lastWorn and timesWorn
export async function markItemWorn(itemId) {
  try {
    const items = await getAllItems();
    const updated = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          lastWorn: new Date().toISOString(),
          timesWorn: (item.timesWorn || 0) + 1,
        };
      }
      return item;
    });
    await AsyncStorage.setItem(KEYS.ITEMS, JSON.stringify(updated));
  } catch (err) {
    console.error('markItemWorn error:', err);
  }
}

// ── Outfits ───────────────────────────────────
export async function getAllOutfits() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.OUTFITS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('getAllOutfits error:', err);
    return [];
  }
}

export async function saveOutfit(outfit) {
  try {
    const outfits = await getAllOutfits();
    const existingIndex = outfits.findIndex(o => o.id === outfit.id);
    if (existingIndex >= 0) {
      outfits[existingIndex] = outfit;
    } else {
      outfits.unshift(outfit);
    }
    await AsyncStorage.setItem(KEYS.OUTFITS, JSON.stringify(outfits));
    return outfits;
  } catch (err) {
    console.error('saveOutfit error:', err);
  }
}

export async function deleteOutfit(outfitId) {
  try {
    const outfits = await getAllOutfits();
    const filtered = outfits.filter(o => o.id !== outfitId);
    await AsyncStorage.setItem(KEYS.OUTFITS, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('deleteOutfit error:', err);
  }
}

// Toggle favorite on an outfit
export async function toggleOutfitFavorite(outfitId) {
  try {
    const outfits = await getAllOutfits();
    const updated = outfits.map(o =>
      o.id === outfitId ? { ...o, isFavorite: !o.isFavorite } : o
    );
    await AsyncStorage.setItem(KEYS.OUTFITS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('toggleOutfitFavorite error:', err);
  }
}

// Record that an outfit was worn today, mark each piece as worn
export async function markOutfitWorn(outfitId) {
  try {
    const outfits = await getAllOutfits();
    const updated = outfits.map(o => {
      if (o.id === outfitId) {
        return {
          ...o,
          wornDates: [new Date().toISOString(), ...(o.wornDates || [])],
        };
      }
      return o;
    });
    await AsyncStorage.setItem(KEYS.OUTFITS, JSON.stringify(updated));

    // Also update the individual items' wear counts
    const outfit = outfits.find(o => o.id === outfitId);
    if (outfit?.itemIds) {
      for (const itemId of outfit.itemIds) {
        await markItemWorn(itemId);
      }
    }
  } catch (err) {
    console.error('markOutfitWorn error:', err);
  }
}

// ── User ──────────────────────────────────────
export async function getUser() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('getUser error:', err);
    return null;
  }
}

export async function updateUser(updates) {
  try {
    const user = await getUser();
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('updateUser error:', err);
  }
}
