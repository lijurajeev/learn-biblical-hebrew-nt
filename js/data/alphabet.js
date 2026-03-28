// ============================================
// Hebrew Alphabet Data
// ============================================

const HEBREW_ALPHABET = [
  { letter: 'א', name: 'Aleph', transliteration: 'silent / glottal stop', sound: "'", sofit: false, group: 1, description: 'Silent letter — carries vowels. Like the pause before "uh-oh".' },
  { letter: 'בּ', name: 'Bet', transliteration: 'b (as in boy)', sound: 'b', sofit: false, group: 1, description: 'With a dot (dagesh) inside, sounds like "b".' },
  { letter: 'ב', name: 'Vet', transliteration: 'v (as in vine)', sound: 'v', sofit: false, group: 1, description: 'Without the dot, sounds like "v".' },
  { letter: 'גּ', name: 'Gimel', transliteration: 'g (as in go)', sound: 'g', sofit: false, group: 1, description: 'Always a hard "g" sound.' },
  { letter: 'ד', name: 'Dalet', transliteration: 'd (as in door)', sound: 'd', sofit: false, group: 1, description: 'Like English "d".' },

  { letter: 'ה', name: 'He', transliteration: 'h (as in hello)', sound: 'h', sofit: false, group: 2, description: 'A soft breath-like "h" sound.' },
  { letter: 'ו', name: 'Vav', transliteration: 'v (as in vine)', sound: 'v', sofit: false, group: 2, description: 'Also used as a vowel holder for "o" and "u" sounds.' },
  { letter: 'ז', name: 'Zayin', transliteration: 'z (as in zoo)', sound: 'z', sofit: false, group: 2, description: 'Like English "z".' },
  { letter: 'ח', name: 'Chet', transliteration: 'ch (as in Bach)', sound: 'ch', sofit: false, group: 2, description: 'A guttural sound from the throat — like clearing your throat gently.' },
  { letter: 'ט', name: 'Tet', transliteration: 't (as in top)', sound: 't', sofit: false, group: 2, description: 'Emphatic "t" sound.' },

  { letter: 'י', name: 'Yod', transliteration: 'y (as in yes)', sound: 'y', sofit: false, group: 3, description: 'The smallest letter. Also used as a vowel holder for "i" and "ei" sounds.' },
  { letter: 'כּ', name: 'Kaf', transliteration: 'k (as in king)', sound: 'k', sofit: false, group: 3, description: 'With a dot (dagesh), sounds like "k".' },
  { letter: 'כ', name: 'Khaf', transliteration: 'kh (as in Bach)', sound: 'kh', sofit: false, group: 3, description: 'Without the dot, a guttural "kh" sound.' },
  { letter: 'ך', name: 'Khaf Sofit', transliteration: 'kh (final form)', sound: 'kh', sofit: true, group: 3, description: 'Final form of Khaf — used only at the end of a word.' },
  { letter: 'ל', name: 'Lamed', transliteration: 'l (as in light)', sound: 'l', sofit: false, group: 3, description: 'Like English "l". The tallest letter — it rises above the line.' },

  { letter: 'מ', name: 'Mem', transliteration: 'm (as in moon)', sound: 'm', sofit: false, group: 4, description: 'Like English "m".' },
  { letter: 'ם', name: 'Mem Sofit', transliteration: 'm (final form)', sound: 'm', sofit: true, group: 4, description: 'Final form of Mem — a closed square used at the end of a word.' },
  { letter: 'נ', name: 'Nun', transliteration: 'n (as in now)', sound: 'n', sofit: false, group: 4, description: 'Like English "n".' },
  { letter: 'ן', name: 'Nun Sofit', transliteration: 'n (final form)', sound: 'n', sofit: true, group: 4, description: 'Final form of Nun — extends below the line.' },
  { letter: 'ס', name: 'Samekh', transliteration: 's (as in sun)', sound: 's', sofit: false, group: 4, description: 'Like English "s".' },

  { letter: 'ע', name: 'Ayin', transliteration: 'silent / guttural', sound: "'", sofit: false, group: 5, description: 'Originally a deep throat sound. In most traditions, treated as silent.' },
  { letter: 'פּ', name: 'Pe', transliteration: 'p (as in park)', sound: 'p', sofit: false, group: 5, description: 'With a dot (dagesh), sounds like "p".' },
  { letter: 'פ', name: 'Fe', transliteration: 'f (as in fan)', sound: 'f', sofit: false, group: 5, description: 'Without the dot, sounds like "f".' },
  { letter: 'ף', name: 'Fe Sofit', transliteration: 'f (final form)', sound: 'f', sofit: true, group: 5, description: 'Final form of Fe — used at the end of a word.' },
  { letter: 'צ', name: 'Tsade', transliteration: 'ts (as in cats)', sound: 'ts', sofit: false, group: 5, description: 'A "ts" combination sound.' },
  { letter: 'ץ', name: 'Tsade Sofit', transliteration: 'ts (final form)', sound: 'ts', sofit: true, group: 5, description: 'Final form of Tsade.' },

  { letter: 'ק', name: 'Qof', transliteration: 'q/k (as in king)', sound: 'k', sofit: false, group: 6, description: 'A deep "k" sound from the back of the throat.' },
  { letter: 'ר', name: 'Resh', transliteration: 'r (as in run)', sound: 'r', sofit: false, group: 6, description: 'A soft "r" — more like a French or Spanish "r".' },
  { letter: 'שׁ', name: 'Shin', transliteration: 'sh (as in ship)', sound: 'sh', sofit: false, group: 6, description: 'With the dot on the right, sounds like "sh".' },
  { letter: 'שׂ', name: 'Sin', transliteration: 's (as in sun)', sound: 's', sofit: false, group: 6, description: 'With the dot on the left, sounds like "s".' },
  { letter: 'תּ', name: 'Tav', transliteration: 't (as in top)', sound: 't', sofit: false, group: 6, description: 'Like English "t". The last letter of the alphabet.' },
];

// Group labels for progressive learning
const ALPHABET_GROUPS = [
  { id: 1, name: 'Letters 1-5', subtitle: 'Aleph through Dalet', letters: "א בּ ב גּ ד" },
  { id: 2, name: 'Letters 6-10', subtitle: 'He through Tet', letters: "ה ו ז ח ט" },
  { id: 3, name: 'Letters 11-15', subtitle: 'Yod through Lamed', letters: "י כּ כ ך ל" },
  { id: 4, name: 'Letters 16-20', subtitle: 'Mem through Samekh', letters: "מ ם נ ן ס" },
  { id: 5, name: 'Letters 21-26', subtitle: 'Ayin through Tsade', letters: "ע פּ פ ף צ ץ" },
  { id: 6, name: 'Letters 27-31', subtitle: 'Qof through Tav', letters: "ק ר שׁ שׂ תּ" },
];
