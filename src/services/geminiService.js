// ─────────────────────────────────────────────
// Gemini AI Service
// Handles all calls to the Google Gemini API:
//  - Outfit suggestion generation
//  - Clothing image analysis / tagging
//  - Outfit compatibility scoring
// ─────────────────────────────────────────────

import { GoogleGenerativeAI } from '@google/generative-ai';

// ⚠️  Replace with your actual Gemini API key.
// In production, store this in an environment variable
// and never commit it to source control.
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ── Helper: get the text model ────────────────
function getTextModel() {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// ── Helper: get the vision model (image analysis) ─
function getVisionModel() {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// ── Outfit Suggestions ────────────────────────
// Returns an array of outfit ideas given the user's
// wardrobe items, weather, and style preferences.
//
// outfitCount  – how many outfits to suggest (default 3)
// items        – array of wardrobe item objects
// weather      – string like "57°F, partly cloudy"
// preferences  – array of style tags e.g. ["Bold", "Comfy"]
export async function suggestOutfits({
  items,
  weather,
  preferences,
  outfitCount = 3,
}) {
  // Build a compact description of the wardrobe so the prompt stays short
  const wardrobeDescription = items
    .map(item =>
      `id:${item.id} | ${item.category} | ${item.name} | tags:${item.tags.join(',')} | lastWorn:${item.lastWorn || 'never'} | worn:${item.timesWorn || 0}x`
    )
    .join('\n');

  const prompt = `
You are a personal stylist AI for a college student.
Weather today: ${weather}
User style preferences: ${preferences.join(', ')}

User's wardrobe:
${wardrobeDescription}

Task: Suggest exactly ${outfitCount} complete outfit combinations.
Rules:
- Each outfit MUST contain exactly 4 items: one jacket (or omit if none fits), one top, one bottom, one shoes item.
- If a jacket is omitted, include 3 items.
- Prioritise items that are LEAST recently worn to prevent wardrobe staleness.
- Each outfit should have a different mood/style.
- Return ONLY valid JSON with no markdown fences.

Return format (array of ${outfitCount} objects):
[
  {
    "name": "outfit name",
    "tags": ["tag1", "tag2", "tag3"],
    "itemIds": ["id1", "id2", "id3", "id4"],
    "style": "Bold|Colorful|Casual|Comfy|Smart",
    "reason": "one sentence explaining why this outfit works today"
  }
]
`;

  try {
    const model = getTextModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Strip any accidental markdown fences before parsing
    const clean = text.replace(/```json|```/g, '').trim();
    const outfits = JSON.parse(clean);
    return outfits;
  } catch (err) {
    console.error('suggestOutfits error:', err);
    // Return a safe empty array — the UI will fall back to mock data
    return [];
  }
}

// ── Clothing Image Analysis ───────────────────
// Accepts a base64-encoded image of a clothing item
// and returns structured tags / metadata.
//
// base64Image – base64 string (without data: prefix)
// mimeType    – e.g. 'image/jpeg'
export async function analyzeClothingImage({ base64Image, mimeType = 'image/jpeg' }) {
  const prompt = `
Analyze this clothing item image and return structured metadata.
Return ONLY valid JSON with no markdown fences.

Format:
{
  "name": "descriptive item name",
  "category": "jacket|top|bottom|shoes|accessory",
  "color": "primary color",
  "tags": ["tag1", "tag2", "tag3"],
  "style": "Bold|Casual|Comfy|Smart|Colorful|Formal",
  "weather": ["Warm|Mild|Cool|Cold"],
  "notes": "one sentence styling note"
}
`;

  try {
    const model = getVisionModel();
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('analyzeClothingImage error:', err);
    // Return a minimal default so the upload can still proceed
    return {
      name: 'New Item',
      category: 'top',
      color: 'Unknown',
      tags: [],
      style: 'Casual',
      weather: ['Any'],
      notes: '',
    };
  }
}

// ── Outfit Compatibility Score ────────────────
// Returns a 0-1 score and a short reason string.
export async function scoreOutfit({ itemNames, weather, occasion }) {
  const prompt = `
Rate this outfit combination for ${occasion || 'general wear'} in ${weather || 'mild'} weather.
Items: ${itemNames.join(', ')}

Return ONLY valid JSON:
{
  "score": 0.85,
  "reason": "one sentence"
}
`;
  try {
    const model = getTextModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('scoreOutfit error:', err);
    return { score: 0.75, reason: 'Looks great!' };
  }
}

// ── Generate Outfit From Custom Prompt ───────
// Takes a user's free-text prompt (e.g. "formal blue for a cold day")
// and generates outfit suggestions from their wardrobe that match.
export async function generateOutfitFromPrompt({ items, prompt, outfitCount = 3 }) {
  const wardrobeDescription = items
    .map(item =>
      `id:${item.id} | ${item.category} | ${item.name} | tags:${item.tags.join(',')}`
    )
    .join('\n');

  const promptText = `
You are a personal stylist AI.
User request: "${prompt}"

User's wardrobe:
${wardrobeDescription}

Task: Suggest exactly ${outfitCount} outfit combinations that best match the user's request.
Rules:
- Each outfit MUST contain exactly 4 items: one jacket (or omit if none fits), one top, one bottom, one shoes item.
- If a jacket is omitted, include 3 items.
- Only use item IDs from the wardrobe above.
- Match the style/occasion/vibe described by the user.
- Return ONLY valid JSON with no markdown fences.

Return format (array of ${outfitCount} objects):
[
  {
    "name": "outfit name",
    "tags": ["tag1", "tag2", "tag3"],
    "itemIds": ["id1", "id2", "id3", "id4"],
    "style": "Bold|Colorful|Casual|Comfy|Smart|Formal",
    "reason": "one sentence explaining why this outfit matches the request"
  }
]
`;

  try {
    const model = getTextModel();
    const result = await model.generateContent(promptText);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const outfits = JSON.parse(clean);
    return outfits;
  } catch (err) {
    console.error('generateOutfitFromPrompt error:', err);
    return [];
  }
}

// ── Fetch weather (open-meteo, no key needed) ─
// Returns a human-readable weather string.
export async function fetchWeather(lat = 40.7934, lon = -77.8600) {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true&temperature_unit=fahrenheit`;
    const res = await fetch(url);
    const data = await res.json();
    const temp = Math.round(data.current_weather?.temperature || 65);
    return `${temp}°F`;
  } catch {
    return '65°F';
  }
}
