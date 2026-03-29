// ─────────────────────────────────────────────
// Theme constants for the Aluré app
// Matches the warm beige / brown Figma palette
// ─────────────────────────────────────────────

export const COLORS = {
  // Backgrounds
  background:    '#F5F0E8',   // main cream background
  cardBackground:'#EDEAE0',   // slightly darker card surface
  inputBackground:'#E8E4D8',  // text input fields

  // Primary brand
  primary:       '#8B7355',   // warm brown (buttons, active icons)
  primaryDark:   '#6B5840',   // darker brown for pressed states
  primaryLight:  '#BFA98E',   // lighter brown for borders/separators

  // Text
  textDark:      '#2C2A27',   // nearly-black body text
  textMedium:    '#6B6560',   // secondary / label text
  textLight:     '#A09890',   // placeholder / disabled text

  // Accents (Events page uses a near-black theme)
  black:         '#1A1A1A',
  white:         '#FFFFFF',
  offWhite:      '#FAF7F2',

  // Category badge colors (Events)
  cultureBadge:  '#E8E0F0',   // light lavender
  cultureText:   '#7B5EA7',
  nightlifeBadge:'#FFE8E8',
  nightlifeText: '#C0392B',
  socialBadge:   '#E8F5E9',
  socialText:    '#2E7D32',
  casualBadge:   '#FFF3E0',
  casualText:    '#E65100',

  // Feedback
  positive:      '#5A8A5A',   // thumbs up green
  negative:      '#C0392B',   // thumbs down red
  favorite:      '#8B7355',   // heart / save brown
};

export const FONTS = {
  // Use system fonts; swap in a custom font (e.g. Cormorant) via expo-font if desired
  regular:    'System',
  medium:     'System',
  bold:       'System',

  sizeXS:   10,
  sizeSM:   12,
  sizeMD:   14,
  sizeLG:   16,
  sizeXL:   20,
  size2XL:  26,
  size3XL:  32,
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const RADIUS = {
  sm:  8,
  md:  16,
  lg:  24,
  full: 999,
};

export const SHADOW = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
};
