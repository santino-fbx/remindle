import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getPhrases, deletePhrase, getCategories } from '../utils/storage';
import { createChallenge } from '../utils/firestore';

export default function Collection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phrases, setPhrases] = useState(getPhrases);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [challengingId, setChallengingId] = useState(null);
  const [challengeLink, setChallengeLink] = useState('');

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Unknown';
  const categories = ['All', ...getCategories()];

  const filtered = useMemo(() => {
    let list = phrases;
    if (activeCategory !== 'All') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.hint.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [phrases, activeCategory, search]);

  const toggleReveal = (id) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = (id) => {
    const updated = deletePhrase(id);
    setPhrases(updated);
    setRevealedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleChallenge = async (p) => {
    setChallengingId(p.id);
    setChallengeLink('');
    try {
      const { code } = await createChallenge(p.phrase, p.hint, p.category, user.uid, displayName);
      const url = `${window.location.origin}/c/${code}`;
      setChallengeLink(url);
      if (navigator.share) {
        navigator.share({ title: 'Remindle Challenge', text: `Can you guess this? "${p.hint}"`, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
      }
    } catch (e) {
      console.error('Failed to create challenge:', e);
    } finally {
      setTimeout(() => { setChallengingId(null); setChallengeLink(''); }, 3000);
    }
  };

  return (
    <div style={styles.container}>
      <Header title="Collection" onBack={() => navigate('/')} />

      {/* Search */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>⌕</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search phrases..."
          style={styles.searchInput}
        />
      </div>

      {/* Category filters */}
      <div style={styles.filters}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              ...styles.filterChip,
              background: activeCategory === cat
                ? 'var(--primary-container)'
                : 'var(--surface-container-highest)',
              color: activeCategory === cat ? '#fff' : 'var(--on-surface-variant)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Phrase list */}
      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.empty}>
            <p className="body-md text-muted">
              {phrases.length === 0 ? 'No phrases yet. Add some memories!' : 'No matches found.'}
            </p>
          </div>
        )}

        {filtered.map(p => {
          const revealed = revealedIds.has(p.id);
          return (
            <div key={p.id} style={styles.card}>
              <div style={styles.cardLeft}>
                <span style={styles.cardCategory}>{p.category}</span>
                <span style={styles.cardHint}>{p.hint}</span>
                {revealed && (
                  <span style={styles.cardPhrase}>{p.phrase}</span>
                )}
              </div>
              <div style={styles.cardActions}>
                <button
                  onClick={() => handleChallenge(p)}
                  style={{ ...styles.iconBtn, color: challengingId === p.id ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                  title="Challenge a Friend"
                >
                  {challengingId === p.id ? '✓' : '↗'}
                </button>
                <button
                  onClick={() => toggleReveal(p.id)}
                  style={styles.iconBtn}
                  title={revealed ? 'Hide' : 'Reveal'}
                >
                  {revealed ? '◉' : '◎'}
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{ ...styles.iconBtn, color: 'var(--error)' }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button onClick={() => navigate('/add')} style={styles.fab}>+</button>
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
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    margin: '0 16px',
    background: 'var(--surface-container-lowest)',
    borderBottom: '2px solid var(--outline-variant)',
    flexShrink: 0,
  },
  searchIcon: {
    padding: '0 12px',
    fontSize: '1.1rem',
    color: 'var(--on-surface-variant)',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    padding: '12px 8px',
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-family)',
    fontSize: '0.9375rem',
    outline: 'none',
  },
  filters: {
    display: 'flex',
    gap: 6,
    padding: '12px 16px',
    overflowX: 'auto',
    flexShrink: 0,
  },
  filterChip: {
    padding: '6px 12px',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    borderRadius: 0,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 16px 80px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px',
    background: 'var(--surface-container-low)',
    marginBottom: 2,
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  cardCategory: {
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'var(--primary)',
    fontFamily: 'var(--font-family)',
  },
  cardHint: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-family)',
  },
  cardPhrase: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'var(--secondary)',
    fontFamily: 'var(--font-family)',
    marginTop: 2,
  },
  cardActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexShrink: 0,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--on-surface-variant)',
    fontSize: '1.1rem',
    cursor: 'pointer',
    padding: 4,
    fontFamily: 'var(--font-family)',
  },
  fab: {
    position: 'absolute',
    bottom: 72,
    right: 20,
    width: 52,
    height: 52,
    background: 'var(--primary-container)',
    color: '#fff',
    border: 'none',
    fontSize: '1.5rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    boxShadow: '4px 4px 0 var(--surface-container-lowest)',
  },
};
