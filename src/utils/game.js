/**
 * Core Wordle game logic adapted for arbitrary-length phrases.
 *
 * Letters are compared character-by-character:
 *   CORRECT  — right char, right position
 *   PRESENT  — right char, wrong position
 *   ABSENT   — char not in target (or all instances accounted for)
 */

export const MAX_ATTEMPTS = 5;

export const Status = {
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent',
  EMPTY: 'empty',
  FILLED: 'filled',
};

/**
 * Evaluate a guess against the target phrase.
 * Returns an array of { char, status } for each position.
 *
 * Uses the classic Wordle two-pass algorithm:
 *   Pass 1 — mark exact matches (CORRECT)
 *   Pass 2 — mark misplaced letters (PRESENT), respecting frequency
 */
export function evaluateGuess(guess, target) {
  const g = guess.toUpperCase().split('');
  const t = target.toUpperCase().split('');
  const result = g.map(ch => ({ char: ch, status: Status.ABSENT }));

  // Frequency map for unmatched target chars
  const remaining = {};
  t.forEach(ch => { remaining[ch] = (remaining[ch] || 0) + 1; });

  // Pass 1 — exact matches
  for (let i = 0; i < g.length; i++) {
    if (i < t.length && g[i] === t[i]) {
      result[i].status = Status.CORRECT;
      remaining[g[i]]--;
    }
  }

  // Pass 2 — present (wrong position)
  for (let i = 0; i < g.length; i++) {
    if (result[i].status === Status.CORRECT) continue;
    if (remaining[g[i]] > 0) {
      result[i].status = Status.PRESENT;
      remaining[g[i]]--;
    }
  }

  return result;
}

/**
 * Build a keyboard letter-state map from all evaluated guesses.
 * Priority: CORRECT > PRESENT > ABSENT
 */
export function buildKeyboardState(evaluatedGuesses) {
  const map = {};
  const priority = { [Status.CORRECT]: 3, [Status.PRESENT]: 2, [Status.ABSENT]: 1 };

  for (const guess of evaluatedGuesses) {
    for (const { char, status } of guess) {
      const current = map[char];
      if (!current || priority[status] > priority[current]) {
        map[char] = status;
      }
    }
  }

  return map;
}

/**
 * Pick a random phrase from the collection, optionally excluding the last N played.
 */
export function pickRandomPhrase(phrases, recentIds = []) {
  const candidates = phrases.filter(p => !recentIds.includes(p.id));
  const pool = candidates.length > 0 ? candidates : phrases;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Normalize a phrase for comparison (uppercase, strip spaces).
 */
export function normalizePhrase(phrase) {
  return phrase.toUpperCase().replace(/\s/g, '');
}

/**
 * djb2 hash — deterministic 32-bit integer from a string.
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // force 32-bit
  }
  return hash;
}

/**
 * Pick a deterministic phrase for a given deck + date.
 * All members get the same phrase on the same day.
 * Phrases MUST be sorted by ID before calling.
 */
export function pickDeterministicPhrase(sortedPhrases, deckId, dateString) {
  if (sortedPhrases.length === 0) return null;
  const seed = deckId + '_' + dateString;
  const index = Math.abs(djb2Hash(seed)) % sortedPhrases.length;
  return sortedPhrases[index];
}

/**
 * Today's date as YYYY-MM-DD string.
 */
export function todayDateString() {
  return new Date().toISOString().split('T')[0];
}
