import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getDeck, getDeckPhrases, leaveDeck, deleteDeckPhrase } from '../utils/firestore';

export default function DeckDetail() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deck, setDeck] = useState(null);
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDeck();
  }, [deckId]);

  const loadDeck = async () => {
    try {
      const [d, p] = await Promise.all([getDeck(deckId), getDeckPhrases(deckId)]);
      setDeck(d);
      setPhrases(p);
    } catch (e) {
      console.error('Failed to load deck:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (deck?.code) {
      navigator.clipboard.writeText(deck.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveDeck(deckId, user.uid);
      navigate('/decks');
    } catch (e) {
      console.error('Failed to leave deck:', e);
    }
  };

  const handleDeletePhrase = async (phraseId) => {
    try {
      await deleteDeckPhrase(deckId, phraseId);
      setPhrases(prev => prev.filter(p => p.id !== phraseId));
    } catch (e) {
      console.error('Failed to delete phrase:', e);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header title="Deck" onBack={() => navigate('/decks')} />
        <p style={styles.muted}>Loading...</p>
      </div>
    );
  }

  if (!deck) {
    return (
      <div style={styles.container}>
        <Header title="Deck" onBack={() => navigate('/decks')} />
        <p style={styles.muted}>Deck not found.</p>
      </div>
    );
  }

  const members = deck.members || {};
  const memberNames = Object.values(members).filter(Boolean);
  const isOwner = deck.createdBy === user.uid;

  return (
    <div style={styles.container}>
      <Header title={deck.name} onBack={() => navigate('/decks')} />

      <div style={styles.content}>
        {/* Invite code */}
        <div style={styles.codeSection}>
          <span style={styles.label}>Invite Code</span>
          <div style={styles.codeRow}>
            <span style={styles.codeValue}>{deck.code}</span>
            <button onClick={handleCopyCode} style={styles.copyBtn}>
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Play button */}
        <button onClick={() => navigate(`/deck/${deckId}`)} style={styles.playBtn}>
          ▶ Play Today's Challenge
        </button>

        {/* Members */}
        <section style={styles.section}>
          <span style={styles.label}>Members ({memberNames.length})</span>
          <div style={styles.memberList}>
            {memberNames.map((name, i) => (
              <div key={i} style={styles.memberChip}>{name}</div>
            ))}
          </div>
        </section>

        {/* Phrases */}
        <section style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={styles.label}>Phrases ({phrases.length})</span>
            <button onClick={() => navigate(`/decks/${deckId}/add`)} style={styles.addBtn}>+ Add</button>
          </div>
          {phrases.length === 0 && (
            <p style={styles.muted}>No phrases yet. Add some for the group to play!</p>
          )}
          <div style={styles.phraseList}>
            {phrases.map(p => (
              <div key={p.id} style={styles.phraseCard}>
                <div style={styles.phraseInfo}>
                  <span style={styles.phraseCategory}>{p.category}</span>
                  <span style={styles.phraseHint}>{p.hint}</span>
                  <span style={styles.phraseAdded}>Added by {p.addedByName}</span>
                </div>
                {(p.addedBy === user.uid || isOwner) && (
                  <button onClick={() => handleDeletePhrase(p.id)} style={styles.deleteBtn}>✕</button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Leave */}
        <button onClick={handleLeave} style={styles.leaveBtn}>
          Leave Deck
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    paddingBottom: 80,
  },
  codeSection: {
    background: 'var(--surface-container-high)',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-family)',
  },
  copyBtn: {
    padding: '6px 12px',
    background: 'var(--surface-container-highest)',
    color: 'var(--on-surface)',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: 0,
  },
  playBtn: {
    padding: '14px',
    background: 'var(--primary-container)',
    color: '#fff',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.9375rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    borderRadius: 0,
    textAlign: 'center',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-family)',
  },
  memberList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  memberChip: {
    padding: '6px 12px',
    background: 'var(--surface-container-highest)',
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-family)',
    fontSize: '0.8125rem',
    fontWeight: 500,
  },
  phraseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  phraseCard: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'var(--surface-container-low)',
  },
  phraseInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  phraseCategory: {
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'var(--primary)',
    fontFamily: 'var(--font-family)',
  },
  phraseHint: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-family)',
  },
  phraseAdded: {
    fontSize: '0.6875rem',
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-family)',
    marginTop: 2,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--error)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: 4,
  },
  addBtn: {
    padding: '6px 12px',
    background: 'var(--primary-container)',
    color: '#fff',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: 0,
  },
  leaveBtn: {
    padding: '12px',
    background: 'var(--surface-container-highest)',
    color: 'var(--error)',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.8125rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    borderRadius: 0,
    marginTop: 8,
  },
  muted: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.875rem',
    color: 'var(--on-surface-variant)',
    padding: '16px 0',
  },
};
