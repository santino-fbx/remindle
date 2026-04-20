import { useState, useEffect } from 'react';
import { getDeckDayResults, getDeck } from '../utils/firestore';
import { todayDateString } from '../utils/game';

export default function DeckResults({ deckId, currentUid, date }) {
  const [results, setResults] = useState([]);
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetDate = date || todayDateString();

  useEffect(() => {
    async function load() {
      try {
        const [dayResults, deckData] = await Promise.all([
          getDeckDayResults(deckId, targetDate),
          getDeck(deckId),
        ]);
        setResults(dayResults);
        setDeck(deckData);
      } catch (e) {
        console.error('Failed to load deck results:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [deckId, targetDate]);

  if (loading) return <p style={styles.muted}>Loading group results...</p>;
  if (!deck) return null;

  const members = deck.members || {};
  const playedUids = new Set(results.map(r => r.uid));

  return (
    <div style={styles.container}>
      <span style={styles.title}>Group Results</span>

      <div style={styles.list}>
        {/* Players who finished */}
        {results.map(r => (
          <div key={r.uid} style={styles.row}>
            <span style={{
              ...styles.name,
              color: r.uid === currentUid ? 'var(--primary)' : 'var(--on-surface)',
            }}>
              {r.displayName}{r.uid === currentUid ? ' (you)' : ''}
            </span>
            <div style={styles.resultRight}>
              <span style={{
                ...styles.score,
                color: r.won ? 'var(--primary)' : 'var(--error)',
              }}>
                {r.won ? `${r.attempts}/5` : 'X/5'}
              </span>
              <span style={styles.indicator}>{r.won ? '■' : '□'}</span>
            </div>
          </div>
        ))}

        {/* Members who haven't played yet */}
        {Object.entries(members)
          .filter(([uid]) => !playedUids.has(uid))
          .map(([uid, name]) => (
            <div key={uid} style={styles.row}>
              <span style={{
                ...styles.name,
                color: 'var(--on-surface-variant)',
              }}>
                {name}{uid === currentUid ? ' (you)' : ''}
              </span>
              <span style={styles.waiting}>Waiting...</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-family)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'var(--surface-container-low)',
  },
  name: {
    fontSize: '0.875rem',
    fontWeight: 500,
    fontFamily: 'var(--font-family)',
  },
  resultRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    fontFamily: 'var(--font-family)',
    fontVariantNumeric: 'tabular-nums',
  },
  indicator: {
    fontSize: '0.75rem',
    color: 'var(--primary)',
  },
  waiting: {
    fontSize: '0.75rem',
    fontStyle: 'italic',
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-family)',
  },
  muted: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.875rem',
    color: 'var(--on-surface-variant)',
    textAlign: 'center',
    padding: 16,
  },
};
