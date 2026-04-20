import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Grid from '../components/Grid';
import Keyboard from '../components/Keyboard';
import ProfileButton from '../components/ProfileButton';
import { logEvent } from '../firebase';
import AdBanner from '../components/AdBanner';
import { useAuth } from '../contexts/AuthContext';
import {
  evaluateGuess,
  buildKeyboardState,
  pickRandomPhrase,
  pickDeterministicPhrase,
  normalizePhrase,
  todayDateString,
  MAX_ATTEMPTS,
} from '../utils/game';
import {
  getPhrases, seedDemoPhrases,
  getGameState, saveGameState, clearGameState,
  getDeckGameState, saveDeckGameState,
} from '../utils/storage';
import { getDeck, getDeckPhrases, submitDeckResult } from '../utils/firestore';

export default function DailyGame() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const { user } = useAuth();
  const isDeckMode = Boolean(deckId);

  const [targetPhrase, setTargetPhrase] = useState(null);
  const [targetPhraseRaw, setTargetPhraseRaw] = useState('');
  const [hint, setHint] = useState('');
  const [deckName, setDeckName] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [revealRow, setRevealRow] = useState(-1);
  const [toast, setToast] = useState('');
  const [shakeRow, setShakeRow] = useState(false);
  const [loading, setLoading] = useState(isDeckMode);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Unknown';

  // ─── Initialize: Personal Mode ───
  useEffect(() => {
    if (isDeckMode) return;

    let phrases = getPhrases();
    if (phrases.length === 0) phrases = seedDemoPhrases();

    const saved = getGameState();
    if (saved?.targetId) {
      const target = phrases.find(p => p.id === saved.targetId);
      if (target) {
        if (saved.gameOver) {
          // Already finished — show results instead of resetting
          navigate('/results', {
            replace: true,
            state: { won: saved.won, attempts: saved.guesses?.length || 0, phrase: target.phrase, hint: target.hint },
          });
          return;
        }
        // Restore an in-progress game
        setTargetPhrase(normalizePhrase(target.phrase));
        setTargetPhraseRaw(target.phrase);
        setHint(target.hint);
        setGuesses(saved.guesses || []);
        return;
      }
    }

    // No saved state — pick a new phrase
    clearGameState();

    const picked = pickRandomPhrase(phrases);
    if (!picked) return;
    setTargetPhrase(normalizePhrase(picked.phrase));
    setTargetPhraseRaw(picked.phrase);
    setHint(picked.hint);
    saveGameState({ targetId: picked.id, guesses: [], gameOver: false, won: false });
  }, [isDeckMode, navigate]);

  // ─── Initialize: Deck Mode ───
  useEffect(() => {
    if (!isDeckMode) return;

    (async () => {
      try {
        const [deck, phrases] = await Promise.all([getDeck(deckId), getDeckPhrases(deckId)]);
        if (!deck) { navigate('/decks'); return; }
        setDeckName(deck.name);

        if (phrases.length === 0) { setLoading(false); return; }

        const today = todayDateString();
        const picked = pickDeterministicPhrase(phrases, deckId, today);
        if (!picked) { setLoading(false); return; }

        const normalized = normalizePhrase(picked.phrase);

        const saved = getDeckGameState(deckId);
        if (saved?.date === today && saved?.targetId === picked.id) {
          setTargetPhrase(normalized);
          setTargetPhraseRaw(picked.phrase);
          setHint(picked.hint);
          setGuesses(saved.guesses || []);
          if (saved.gameOver) {
            setGameOver(true);
            setTimeout(() => navigate(`/deck/${deckId}/results`, {
              replace: true,
              state: { won: saved.won, attempts: saved.guesses?.length || 0, phrase: picked.phrase, hint: picked.hint, deckId },
            }), 300);
          }
        } else {
          setTargetPhrase(normalized);
          setTargetPhraseRaw(picked.phrase);
          setHint(picked.hint);
          saveDeckGameState(deckId, { targetId: picked.id, date: today, guesses: [], gameOver: false, won: false });
        }
      } catch (e) {
        console.error('Deck load failed:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isDeckMode, deckId, navigate]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1500);
  };

  const submitGuess = useCallback(() => {
    if (!targetPhrase || gameOver) return;

    const normalized = currentGuess.toUpperCase();
    if (normalized.length !== targetPhrase.length) {
      showToast(`Needs ${targetPhrase.length} characters`);
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    const evaluated = evaluateGuess(normalized, targetPhrase);
    const newGuesses = [...guesses, evaluated];
    setGuesses(newGuesses);
    setCurrentGuess('');
    setRevealRow(guesses.length);
    setTimeout(() => setRevealRow(-1), targetPhrase.length * 150 + 300);

    const won = normalized === targetPhrase;
    const lost = !won && newGuesses.length >= MAX_ATTEMPTS;

    if (won || lost) {
      setGameOver(true);
      logEvent('game_complete', { won, attempts: newGuesses.length, mode: isDeckMode ? 'deck' : 'personal', phrase_length: targetPhrase.length });
      const delay = targetPhrase.length * 150 + 800;

      if (isDeckMode) {
        const today = todayDateString();
        saveDeckGameState(deckId, { targetId: getDeckGameState(deckId)?.targetId, date: today, guesses: newGuesses, gameOver: true, won });
        submitDeckResult(deckId, user.uid, displayName, today, won, newGuesses.length).catch(console.error);
        setTimeout(() => navigate(`/deck/${deckId}/results`, {
          replace: true,
          state: { won, attempts: newGuesses.length, phrase: targetPhraseRaw, hint, deckId },
        }), delay);
      } else {
        const saved = getGameState();
        saveGameState({ ...saved, guesses: newGuesses, gameOver: true, won });
        setTimeout(() => {
          const phrases = getPhrases();
          const target = phrases.find(p => p.id === saved?.targetId);
          navigate('/results', {
            replace: true,
            state: { won, attempts: newGuesses.length, phrase: target?.phrase || targetPhraseRaw, hint: target?.hint || hint },
          });
        }, delay);
      }
    } else {
      if (isDeckMode) {
        const saved = getDeckGameState(deckId);
        saveDeckGameState(deckId, { ...saved, guesses: newGuesses });
      } else {
        const saved = getGameState();
        saveGameState({ ...saved, guesses: newGuesses });
      }
    }
  }, [currentGuess, targetPhrase, targetPhraseRaw, guesses, gameOver, hint, navigate, isDeckMode, deckId, user, displayName]);

  const handleKey = useCallback((key) => {
    if (!targetPhrase || gameOver) return;
    if (key === 'Enter') submitGuess();
    else if (key === 'Backspace') setCurrentGuess(prev => prev.slice(0, -1));
    else if (/^[A-Z0-9]$/i.test(key) && currentGuess.length < targetPhrase.length) {
      setCurrentGuess(prev => prev + key.toUpperCase());
    }
  }, [targetPhrase, gameOver, currentGuess, submitGuess]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') handleKey('Enter');
      else if (e.key === 'Backspace') handleKey('Backspace');
      else if (/^[a-zA-Z0-9]$/.test(e.key)) handleKey(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const keyboardState = buildKeyboardState(guesses);

  // Loading state for deck mode
  if (loading) {
    return (
      <div style={styles.emptyState}>
        <p className="body-md text-muted">Loading deck...</p>
      </div>
    );
  }

  // Empty state
  if (!targetPhrase) {
    return (
      <div style={styles.emptyState}>
        <p className="headline-md">{isDeckMode ? 'No phrases in this deck' : 'No phrases yet'}</p>
        <p className="body-md text-muted" style={{ marginTop: 8 }}>
          {isDeckMode ? 'Add some phrases for the group to play!' : 'Add some memories to start playing'}
        </p>
        <button
          onClick={() => navigate(isDeckMode ? `/decks/${deckId}/add` : '/add')}
          style={styles.addBtn}
        >
          + Add Phrase
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {isDeckMode ? (
          <button onClick={() => navigate('/decks')} style={styles.backBtn}>←</button>
        ) : (
          <div style={{ width: 36 }} />
        )}
        <h1 style={styles.title}>{isDeckMode ? deckName : 'REMINDLE'}</h1>
        <ProfileButton />
      </div>

      {/* Hint banner */}
      <div style={styles.hintBanner}>
        <span style={styles.hintLabel}>{isDeckMode ? 'Deck Challenge' : "Today's Hint"}</span>
        <span style={styles.hintText}>{hint}</span>
        <span style={styles.charCount}>{targetPhrase.length} characters</span>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', animation: shakeRow ? 'shake 500ms' : 'none',
      }}>
        <Grid guesses={guesses} currentGuess={currentGuess} targetLength={targetPhrase.length} maxAttempts={MAX_ATTEMPTS} revealRow={revealRow} />
      </div>

      <div style={{ flexShrink: 0, paddingBottom: 4 }}>
        <Keyboard keyStates={keyboardState} onKey={handleKey} disabled={gameOver} />
      </div>

      <AdBanner slot={import.meta.env.VITE_AD_SLOT_BANNER} style={{ height: 50 }} />
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px', flexShrink: 0 },
  title: { fontFamily: 'var(--font-family)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--on-surface)' },
  backBtn: { background: 'none', border: 'none', color: 'var(--on-surface)', fontSize: '1.5rem', cursor: 'pointer', fontFamily: 'var(--font-family)', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hintBanner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '10px 16px', margin: '0 16px 8px', background: 'var(--surface-container-high)', flexShrink: 0 },
  hintLabel: { fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontFamily: 'var(--font-family)' },
  hintText: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)', fontFamily: 'var(--font-family)', textAlign: 'center' },
  charCount: { fontSize: '0.6875rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  toast: { position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', background: 'var(--on-surface)', color: 'var(--surface)', padding: '8px 16px', fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '0.875rem', zIndex: 100 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, padding: 32 },
  addBtn: { marginTop: 16, padding: '12px 24px', background: 'var(--primary-container)', color: '#fff', border: 'none', fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', textTransform: 'uppercase' },
};
