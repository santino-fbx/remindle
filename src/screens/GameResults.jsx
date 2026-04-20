import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStats, recordGameResult, clearGameState } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import AdInterstitial from '../components/AdInterstitial';
import DeckResults from '../components/DeckResults';

export default function GameResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { deckId } = useParams();
  const { user } = useAuth();
  const isDeckMode = Boolean(deckId);

  const { won, attempts, phrase, hint } = location.state || {};
  const [stats, setStats] = useState(getStats);
  const [recorded, setRecorded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Record personal stats (personal mode only)
  useEffect(() => {
    if (isDeckMode || recorded || !attempts) return;
    const updated = recordGameResult(won, attempts);
    setStats(updated);
    setRecorded(true);
  }, [won, attempts, recorded, isDeckMode]);

  const avgAttempts = stats.totalSolved > 0
    ? (Object.entries(stats.attemptDistribution).reduce(
        (sum, [k, v]) => sum + Number(k) * v, 0
      ) / stats.totalSolved).toFixed(1)
    : '—';

  const handlePlayAgain = () => {
    clearGameState();
    navigate('/', { replace: true });
    window.location.reload();
  };

  const handleBackToDecks = () => {
    navigate('/decks', { replace: true });
  };

  const handleShare = () => {
    const prefix = isDeckMode ? 'REMINDLE DECK' : 'REMINDLE';
    const emojis = won ? '🟩' : '🟥';
    const text = [
      `${prefix} — ${won ? `${attempts}/5` : 'X/5'}`,
      `Hint: "${hint}"`,
      `${emojis.repeat(Math.min(attempts, 5))}`,
      '',
      'Can you remember what I can\'t forget?',
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!phrase) {
    return (
      <div style={styles.container}>
        <p>No game data. <button onClick={() => navigate('/')} style={styles.link}>Play now</button></p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Result header */}
      <div style={styles.resultHeader}>
        <h1 style={{
          ...styles.headline,
          color: won ? 'var(--primary)' : 'var(--error)',
        }}>
          {won ? 'You Got It!' : 'Not This Time'}
        </h1>
      </div>

      {/* Answer reveal */}
      <div style={styles.answerCard}>
        <span style={styles.answerLabel}>The Answer</span>
        <span style={styles.answerPhrase}>{phrase}</span>
        <span style={styles.answerHint}>{hint}</span>
      </div>

      {/* Deck group results */}
      {isDeckMode && user && (
        <DeckResults deckId={deckId} currentUid={user.uid} />
      )}

      {/* Personal stats (personal mode only) */}
      {!isDeckMode && (
        <div style={styles.statsGrid}>
          <StatBox value={`${attempts}/${5}`} label="Attempts" />
          <StatBox value={stats.currentStreak} label="Streak" />
          <StatBox value={stats.totalSolved} label="Solved" />
          <StatBox value={avgAttempts} label="Avg Tries" />
        </div>
      )}

      {/* Deck mode: show attempt count */}
      {isDeckMode && (
        <div style={styles.statsGrid}>
          <StatBox value={`${attempts}/${5}`} label="Your Attempts" />
          <StatBox value={won ? '✓' : '✕'} label="Result" />
        </div>
      )}

      {/* Share */}
      <button onClick={handleShare} style={styles.shareBtn}>
        {copied ? '✓ Copied!' : '↗ Share Result'}
      </button>

      {/* Interstitial ad */}
      <AdInterstitial slot={import.meta.env.VITE_AD_SLOT_INTERSTITIAL} />

      {/* Bottom action */}
      {isDeckMode ? (
        <button onClick={handleBackToDecks} style={styles.playAgainBtn}>
          Back to Decks
        </button>
      ) : (
        <button onClick={handlePlayAgain} style={styles.playAgainBtn}>
          Play Again
        </button>
      )}
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div style={styles.statBox}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', padding: '24px 16px', gap: 20 },
  resultHeader: { textAlign: 'center', padding: '16px 0' },
  headline: { fontFamily: 'var(--font-family)', fontSize: '2.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em' },
  answerCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '20px 32px', background: 'var(--surface-container-high)', width: '100%' },
  answerLabel: { fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  answerPhrase: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-family)', letterSpacing: '0.06em', wordBreak: 'break-all', textAlign: 'center' },
  answerHint: { fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%' },
  statBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '16px', background: 'var(--surface-container-low)' },
  statValue: { fontSize: '1.75rem', fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-family)', fontVariantNumeric: 'tabular-nums' },
  statLabel: { fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  shareBtn: { width: '100%', padding: '14px', background: 'var(--primary-container)', color: '#fff', border: 'none', fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '0.9375rem', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 0 },
  playAgainBtn: { width: '100%', padding: '14px', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: 'none', fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '0.9375rem', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 0 },
  link: { background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'var(--font-family)' },
};
