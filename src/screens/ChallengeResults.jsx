import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getChallenge } from '../utils/firestore';

export default function ChallengeResults() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { won, attempts, phrase, hint, creatorName } = location.state || {};
  const [plays, setPlays] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Find challenge by code to get plays
        const { getChallengeByCode } = await import('../utils/firestore');
        const c = await getChallengeByCode(code);
        if (c?.plays) {
          const sorted = [...c.plays].sort((a, b) => {
            if (a.won !== b.won) return b.won ? 1 : -1;
            return a.attempts - b.attempts;
          });
          setPlays(sorted);
        }
      } catch (e) {
        console.error('Failed to load challenge results:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const handleShare = () => {
    const url = `${window.location.origin}/c/${code}`;
    const emojis = won ? '🟩' : '🟥';
    const text = [
      `REMINDLE CHALLENGE — ${won ? `${attempts}/5` : 'X/5'}`,
      `Hint: "${hint}"`,
      `${emojis.repeat(Math.min(attempts || 1, 5))}`,
      '',
      `Can you beat me? ${url}`,
    ].join('\n');

    if (navigator.share) {
      navigator.share({ title: 'Remindle Challenge', text }).catch(() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/c/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.resultHeader}>
        <h1 style={{
          ...styles.headline,
          color: won ? 'var(--primary)' : 'var(--error)',
        }}>
          {won ? 'You Got It!' : 'Not This Time'}
        </h1>
      </div>

      {/* Answer */}
      <div style={styles.answerCard}>
        <span style={styles.answerLabel}>The Answer</span>
        <span style={styles.answerPhrase}>{phrase || '???'}</span>
        <span style={styles.answerHint}>{hint}</span>
      </div>

      {/* Your score */}
      <div style={styles.scoreCard}>
        <span style={styles.scoreValue}>{won ? `${attempts}/5` : 'X/5'}</span>
        <span style={styles.scoreLabel}>Your Score</span>
      </div>

      {/* All plays */}
      {!loading && plays.length > 0 && (
        <div style={styles.playsSection}>
          <span style={styles.sectionLabel}>All Players</span>
          <div style={styles.playsList}>
            {plays.map((p, i) => (
              <div key={i} style={styles.playRow}>
                <span style={styles.playName}>{p.name}</span>
                <span style={{
                  ...styles.playScore,
                  color: p.won ? 'var(--primary)' : 'var(--error)',
                }}>
                  {p.won ? `${p.attempts}/5` : 'X/5'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share */}
      <button onClick={handleShare} style={styles.shareBtn}>
        {copied ? '✓ Copied!' : '↗ Share Challenge'}
      </button>

      <button onClick={handleCopyLink} style={styles.linkBtn}>
        Copy Challenge Link
      </button>

      {/* CTA */}
      <div style={styles.ctaSection}>
        <p style={styles.ctaText}>Want to create your own challenges?</p>
        <button onClick={() => navigate('/login')} style={styles.ctaBtn}>
          Sign Up for Remindle
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflow: 'auto', padding: '24px 16px', gap: 16, background: 'var(--background)' },
  resultHeader: { textAlign: 'center', padding: '12px 0' },
  headline: { fontFamily: 'var(--font-family)', fontSize: '2.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em' },
  answerCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '20px 32px', background: 'var(--surface-container-high)', width: '100%', maxWidth: 400 },
  answerLabel: { fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  answerPhrase: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-family)', letterSpacing: '0.06em', wordBreak: 'break-all', textAlign: 'center' },
  answerHint: { fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  scoreCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '16px 32px', background: 'var(--surface-container-low)', width: '100%', maxWidth: 400 },
  scoreValue: { fontSize: '2rem', fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-family)', fontVariantNumeric: 'tabular-nums' },
  scoreLabel: { fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  playsSection: { width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 6 },
  sectionLabel: { fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  playsList: { display: 'flex', flexDirection: 'column', gap: 2 },
  playRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'var(--surface-container-low)' },
  playName: { fontSize: '0.875rem', fontWeight: 500, color: 'var(--on-surface)', fontFamily: 'var(--font-family)' },
  playScore: { fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-family)', fontVariantNumeric: 'tabular-nums' },
  shareBtn: { width: '100%', maxWidth: 400, padding: '14px', background: 'var(--primary-container)', color: '#fff', border: 'none', fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '0.9375rem', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 0 },
  linkBtn: { width: '100%', maxWidth: 400, padding: '12px', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: 'none', fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 0 },
  ctaSection: { textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  ctaText: { fontFamily: 'var(--font-family)', fontSize: '0.875rem', color: 'var(--on-surface-variant)' },
  ctaBtn: { padding: '12px 24px', background: 'var(--surface-container-high)', color: 'var(--primary)', border: 'none', fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 0, textDecoration: 'underline', textUnderlineOffset: '3px' },
};
