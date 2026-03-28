// ============================================
// Hebrew Niqqud (Vowels) Data
// ============================================

const HEBREW_VOWELS = [
  // A-class vowels
  { symbol: 'בַ', name: 'Patach', transliteration: 'a', sound: 'a as in "father"', group: 1, description: 'A short horizontal line under the letter. Short "a" sound.' },
  { symbol: 'בָ', name: 'Qamats', transliteration: 'a / o', sound: 'a as in "father" (or o)', group: 1, description: 'A T-shaped mark under the letter. Usually "a" sound, sometimes "o".' },
  { symbol: 'בֲ', name: 'Chataf Patach', transliteration: 'a (short)', sound: 'quick a', group: 1, description: 'Ultra-short "a" — used with guttural letters.' },

  // E-class vowels
  { symbol: 'בֶ', name: 'Segol', transliteration: 'e', sound: 'e as in "bed"', group: 2, description: 'Three dots in a triangle under the letter. Short "e" sound.' },
  { symbol: 'בֵ', name: 'Tsere', transliteration: 'ei', sound: 'ei as in "they"', group: 2, description: 'Two dots side by side under the letter. Long "ei" sound.' },
  { symbol: 'בֱ', name: 'Chataf Segol', transliteration: 'e (short)', sound: 'quick e', group: 2, description: 'Ultra-short "e" — used with guttural letters.' },

  // I-class vowels
  { symbol: 'בִ', name: 'Chiriq', transliteration: 'i', sound: 'i as in "machine"', group: 3, description: 'A single dot under the letter. "ee" sound.' },
  { symbol: 'בִי', name: 'Chiriq Malei', transliteration: 'i (long)', sound: 'ee as in "seed"', group: 3, description: 'Chiriq followed by Yod — full long "ee" sound.' },

  // O-class vowels
  { symbol: 'בֹ', name: 'Cholam', transliteration: 'o', sound: 'o as in "go"', group: 4, description: 'A dot above and to the left of the letter. Long "o" sound.' },
  { symbol: 'בוֹ', name: 'Cholam Malei', transliteration: 'o (long)', sound: 'o as in "go"', group: 4, description: 'Cholam written with a Vav — full "o" sound.' },
  { symbol: 'בֳ', name: 'Chataf Qamats', transliteration: 'o (short)', sound: 'quick o', group: 4, description: 'Ultra-short "o" — used with guttural letters.' },

  // U-class vowels
  { symbol: 'בֻ', name: 'Qubbuts', transliteration: 'u', sound: 'u as in "flute"', group: 5, description: 'Three diagonal dots under the letter. Short "u/oo" sound.' },
  { symbol: 'בוּ', name: 'Shureq', transliteration: 'u (long)', sound: 'oo as in "moon"', group: 5, description: 'A Vav with a dot in the middle. Long "oo" sound.' },

  // Shva
  { symbol: 'בְ', name: 'Shva', transliteration: '(silent or quick e)', sound: 'silent or very quick "e"', group: 6, description: 'Two vertical dots under the letter. Can be silent (closing a syllable) or voiced (quick "e").' },
];

const VOWEL_GROUPS = [
  { id: 1, name: 'A-Vowels', subtitle: 'Patach, Qamats, Chataf Patach', color: 'gold' },
  { id: 2, name: 'E-Vowels', subtitle: 'Segol, Tsere, Chataf Segol', color: 'blue' },
  { id: 3, name: 'I-Vowels', subtitle: 'Chiriq, Chiriq Malei', color: 'gold' },
  { id: 4, name: 'O-Vowels', subtitle: 'Cholam, Cholam Malei, Chataf Qamats', color: 'blue' },
  { id: 5, name: 'U-Vowels', subtitle: 'Qubbuts, Shureq', color: 'gold' },
  { id: 6, name: 'Shva', subtitle: 'The silent/voiced reduced vowel', color: 'blue' },
];
