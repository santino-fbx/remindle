import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '../components/Grid';
import Keyboard from '../components/Keyboard';
import {
  evaluateGuess, buildKeyboardState, normalizePhrase, MAX_ATTEMPTS,
} from '../utils/game';
import { getChallengeByCode, submitChallengeResult } from '../utils/firestore';

export default function ChallengePlay() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [targetPhrase, setTargetPhrase] = useState(null);
  const [hint, setHint] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [revealRow, setRevealRow] = useState(-1);
  const [toast, setToast] = useState('');
  const [shakeRow, setShakeRow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [nameSet, setNameSet] = useState(false);

  // Load challenge
  useEffect(() => {
    (async () => {
      try {
        const c = await getChallengeByCode(code);
        if (!c) { setError('Challenge not found'); setLoading(false); return; }
        setChallenge(c);
        setTargetPhrase(normalizePhrase(c.phrase));
        setHint(c.hint);
      } catch (e) {
        setError('Failed to load challenge');
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

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
      // Submit result to Firestore
      submitChallengeResult(challenge.id, playerName || 'Anonymous', won, newGuesses.length).catch(console.error);

      const delay = targetPhrase.length * 150 + 800;
      setTimeout(() => {
        navigate(`/c/${code}/results`, {
          replace: true,
          state: {
            won,
            attempts: newGuesses.length,
            phrase: challenge.phrase,
            hint: challenge.hint,
            challengeId: challenge.id,
            challengeCode: code,
            creatorName: challenge.creatorName,
          },
        });
      }, delay);
    }
  }, [currentGuess, targetPhrase, guesses, gameOver, challenge, playerName, code, navigate]);

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

  // Loading
  if (loading) {
    return (
      <div style={styles.center}>
        <h1 style={styles.logo}>REMINDLE</h1>
        <p style={styles.muted}>Loading challenge...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={styles.center}>
        <h1 style={styles.logo}>REMINDLE</h1>
        <p style={styles.error}>{error}</p>
        <button onClick={() => navigate('/')} style={styles.ctaBtn}>Go to Remindle</button>
      </div>
    );
  }

  // Name entry (before playing)
  if (!nameSet) {
    return (
      <div style={styles.center}>
        <h1 style={styles.logo}>REMINDLE</h1>
        <p style={styles.subtitle}>Challenge from {challenge?.creatorName}</p>
        <p style={styles.muted}>Enter your name to play</p>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
          style={styles.input}
          maxLength={20}
          autoFocus
        />
        <button
          onClick={() => setNameSet(true)}
          disabled={!playerName.trim()}
          style={{ ...styles.ctaBtn, opacity: playerName.trim() ? 1 : 0.4 }}
        >
          Start Challenge
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.challengeLabel}>Challenge</span>
        <h1 style={styles.headerTitle}>REMINDLE</h1>
        <span style={styles.challengeFrom}>from {challenge?.creatorName}</span>
      </div>

      {/* Hint */}
      <div style={styles.hintBanner}>
        <span style={styles.hintLabel}>Hint</span>
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
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--background)' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--background)', padding: 32, gap: 12 },
  logo: { fontFamily: 'var(--font-family)', fontSize: '2rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--on-surface)' },
  subtitle: { fontFamily: 'var(--font-family)', fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' },
  muted: { fontFamily: 'var(--font-family)', fontSize: '0.875rem', color: 'var(--on-surface-variant)' },
  error: { fontFamily: 'var(--font-family)', fontSize: '0.875rem', color: 'var(--error)' },
  input: { background: 'var(--surface-container-lowest)', border: 'none', borderBottom: '2px solid var(--outline-variant)', padding: '14px 12px', color: 'var(--on-surface)', fontFamily: 'var(--font-family)', fontSize: '1rem', fontWeight: 500, borderRadius: 0, outline: 'none', width: '100%', maxWidth: 280, textAlign: 'center' },
  ctaBtn: { marginTop: 8, padding: '14px 32px', background: 'var(--primary-container)', color: '#fff', border: 'none', fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', textTransform: 'uppercase', borderRadius: 0 },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px 4px', flexShrink: 0 },
  challengeLabel: { fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--primary)', fontFamily: 'var(--font-family)' },
  headerTitle: { fontFamily: 'var(--font-family)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--on-surface)' },
  challengeFrom: { fontSize: '0.6875rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  hintBanner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '10px 16px', margin: '0 16px 8px', background: 'var(--surface-container-high)', flexShrink: 0 },
  hintLabel: { fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontFamily: 'var(--font-family)' },
  hintText: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)', fontFamily: 'var(--font-family)', textAlign: 'center' },
  charCount: { fontSize: '0.6875rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  toast: { position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', background: 'var(--on-surface)', color: 'var(--surface)', padding: '8px 16px', fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '0.875rem', zIndex: 100 },
};
