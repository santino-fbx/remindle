const KEYS = {
  PHRASES: 'remindle_phrases',
  STATS: 'remindle_stats',
  GAME_STATE: 'remindle_game_state',
  CATEGORIES: 'remindle_categories',
};

const DEFAULT_CATEGORIES = ['People', 'Home', 'Work', 'Dates', 'Numbers'];

const DEFAULT_STATS = {
  totalPlayed: 0,
  totalSolved: 0,
  currentStreak: 0,
  maxStreak: 0,
  attemptDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  lastPlayedDate: null,
};

// ─── User-Scoped Storage ───
let _uid = null;

export function setStorageUser(uid) {
  _uid = uid;
}

function scopedKey(key) {
  return _uid ? `${_uid}_${key}` : key;
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(scopedKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(scopedKey(key), JSON.stringify(value));
}

/**
 * Migrate data from unscoped keys to user-scoped keys on first login.
 * Idempotent — only copies if scoped keys are empty and unscoped keys have data.
 */
export function migrateUnscopedData(uid) {
  for (const key of Object.values(KEYS)) {
    const scopedK = `${uid}_${key}`;
    const hasScoped = localStorage.getItem(scopedK);
    const unscopedData = localStorage.getItem(key);

    if (!hasScoped && unscopedData) {
      localStorage.setItem(scopedK, unscopedData);
    }
  }
}

// ─── Phrases ───
export function getPhrases() {
  return read(KEYS.PHRASES, []);
}

export function savePhrase(phrase) {
  const phrases = getPhrases();
  phrases.push({ ...phrase, id: crypto.randomUUID(), dateAdded: new Date().toISOString() });
  write(KEYS.PHRASES, phrases);
  return phrases;
}

export function deletePhrase(id) {
  const phrases = getPhrases().filter(p => p.id !== id);
  write(KEYS.PHRASES, phrases);
  return phrases;
}

export function updatePhrase(id, updates) {
  const phrases = getPhrases().map(p => p.id === id ? { ...p, ...updates } : p);
  write(KEYS.PHRASES, phrases);
  return phrases;
}

// ─── Categories ───
export function getCategories() {
  return read(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
}

export function addCategory(name) {
  const cats = getCategories();
  if (!cats.includes(name)) {
    cats.push(name);
    write(KEYS.CATEGORIES, cats);
  }
  return cats;
}

// ─── Stats ───
export function getStats() {
  return read(KEYS.STATS, { ...DEFAULT_STATS });
}

export function recordGameResult(won, attempts) {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];

  stats.totalPlayed += 1;

  if (won) {
    stats.totalSolved += 1;
    stats.attemptDistribution[attempts] = (stats.attemptDistribution[attempts] || 0) + 1;

    const lastPlayed = stats.lastPlayedDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastPlayed === yesterday || lastPlayed === today) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  stats.lastPlayedDate = today;
  write(KEYS.STATS, stats);
  return stats;
}

// ─── Game State (current session) ───
export function getGameState() {
  return read(KEYS.GAME_STATE, null);
}

export function saveGameState(state) {
  write(KEYS.GAME_STATE, state);
}

export function clearGameState() {
  localStorage.removeItem(scopedKey(KEYS.GAME_STATE));
}

// ─── Deck Game State (per-deck session) ───
export function getDeckGameState(deckId) {
  return read(`deck_${deckId}_game_state`, null);
}

export function saveDeckGameState(deckId, state) {
  write(`deck_${deckId}_game_state`, state);
}

export function clearDeckGameState(deckId) {
  localStorage.removeItem(scopedKey(`deck_${deckId}_game_state`));
}

// ─── Seed phrases for first-time users ───
export function seedDemoPhrases() {
  const existing = getPhrases();
  if (existing.length > 0) return existing;

  const demos = [
    { phrase: '8675309', hint: "Jenny's phone number", category: 'Numbers' },
    { phrase: '07041776', hint: 'US Independence Day (MMDDYYYY)', category: 'Dates' },
    { phrase: '90210', hint: 'Famous Beverly Hills zip code', category: 'Numbers' },
    { phrase: 'MITOCHONDRIA', hint: 'The powerhouse of the cell', category: 'Work' },
    { phrase: '42WALLOWAYDR', hint: "Nemo's address", category: 'Home' },
  ];

  const seeded = demos.map(d => ({
    ...d,
    id: crypto.randomUUID(),
    dateAdded: new Date().toISOString(),
  }));

  write(KEYS.PHRASES, seeded);
  return seeded;
}
