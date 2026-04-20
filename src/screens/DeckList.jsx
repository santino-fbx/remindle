import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { createDeck, joinDeck, getUserDecks } from '../utils/firestore';

export default function DeckList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create deck state
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState('');

  // Join deck state
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Unknown';

  useEffect(() => {
    loadDecks();
  }, [user]);

  const loadDecks = async () => {
    if (!user) return;
    try {
      const list = await getUserDecks(user.uid);
      setDecks(list);
    } catch (e) {
      console.error('Failed to load decks:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    setError('');
    setCreatedCode('');
    try {
      const { code } = await createDeck(newName.trim(), user.uid, displayName);
      setCreatedCode(code);
      setNewName('');
      await loadDecks();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (joinCode.length < 6 || joining) return;
    setJoining(true);
    setError('');
    try {
      await joinDeck(joinCode.trim(), user.uid, displayName);
      setJoinCode('');
      await loadDecks();
    } catch (e) {
      setError(e.message);
    } finally {
      setJoining(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div style={styles.container}>
      <Header title="Decks" onBack={() => navigate('/')} />

      <div style={styles.content}>
        {/* Create */}
        <section style={styles.section}>
          <label style={styles.sectionLabel}>Create a Deck</label>
          <div style={styles.row}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Deck name..."
              style={styles.input}
              maxLength={40}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              style={{ ...styles.actionBtn, opacity: newName.trim() && !creating ? 1 : 0.4 }}
            >
              {creating ? '...' : 'Create'}
            </button>
          </div>
          {createdCode && (
            <div style={styles.codeBox}>
              <span style={styles.codeLabel}>Invite Code</span>
              <div style={styles.codeRow}>
                <span style={styles.codeValue}>{createdCode}</span>
                <button onClick={() => copyCode(createdCode)} style={styles.copyBtn}>Copy</button>
              </div>
            </div>
          )}
        </section>

        {/* Join */}
        <section style={styles.section}>
          <label style={styles.sectionLabel}>Join a Deck</label>
          <div style={styles.row}>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="Enter 6-char code"
              style={{ ...styles.input, textTransform: 'uppercase', letterSpacing: '0.2em' }}
              maxLength={6}
            />
            <button
              onClick={handleJoin}
              disabled={joinCode.length < 6 || joining}
              style={{ ...styles.actionBtn, opacity: joinCode.length >= 6 && !joining ? 1 : 0.4 }}
            >
              {joining ? '...' : 'Join'}
            </button>
          </div>
        </section>

        {error && <p style={styles.error}>{error}</p>}

        {/* Deck list */}
        <section style={styles.section}>
          <label style={styles.sectionLabel}>Your Decks</label>
          {loading && <p style={styles.muted}>Loading...</p>}
          {!loading && decks.length === 0 && (
            <p style={styles.muted}>No decks yet. Create one or join with a code.</p>
          )}
          <div style={styles.deckList}>
            {decks.map(deck => (
              <div key={deck.id} style={styles.deckCard}>
                <div style={styles.deckInfo} onClick={() => navigate(`/decks/${deck.id}`)}>
                  <span style={styles.deckName}>{deck.name}</span>
                  <span style={styles.deckMeta}>
                    {deck.memberCount || deck.memberUids?.length || 1} member{(deck.memberCount || 1) !== 1 ? 's' : ''}
                    {' · '}
                    <span style={{ color: 'var(--primary)' }}>{deck.code}</span>
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/deck/${deck.id}`)}
                  style={styles.playBtn}
                >
                  Play
                </button>
              </div>
            ))}
          </div>
        </section>
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
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sectionLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-family)',
  },
  row: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    background: 'var(--surface-container-lowest)',
    border: 'none',
    borderBottom: '2px solid var(--outline-variant)',
    padding: '12px',
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-family)',
    fontSize: '0.9375rem',
    fontWeight: 500,
    borderRadius: 0,
    outline: 'none',
  },
  actionBtn: {
    padding: '12px 20px',
    background: 'var(--primary-container)',
    color: '#fff',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.8125rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    borderRadius: 0,
    whiteSpace: 'nowrap',
  },
  codeBox: {
    background: 'var(--surface-container-high)',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  codeLabel: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--primary)',
    fontFamily: 'var(--font-family)',
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
  error: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.8125rem',
    color: 'var(--error)',
    textAlign: 'center',
    padding: '8px',
    background: 'var(--error-container)',
  },
  muted: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.875rem',
    color: 'var(--on-surface-variant)',
    padding: '16px 0',
  },
  deckList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  deckCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'var(--surface-container-low)',
    cursor: 'pointer',
  },
  deckInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  deckName: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-family)',
  },
  deckMeta: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-family)',
  },
  playBtn: {
    padding: '8px 16px',
    background: 'var(--primary-container)',
    color: '#fff',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: 0,
  },
};
