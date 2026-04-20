import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { addDeckPhrase, getDeck } from '../utils/firestore';
import { getCategories, addCategory } from '../utils/storage';

export default function AddDeckPhrase() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deckName, setDeckName] = useState('');
  const [phrase, setPhrase] = useState('');
  const [hint, setHint] = useState('');
  const [category, setCategory] = useState('People');
  const [customCat, setCustomCat] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const categories = getCategories();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Unknown';

  useEffect(() => {
    getDeck(deckId).then(d => { if (d) setDeckName(d.name); });
  }, [deckId]);

  const handleSave = async () => {
    if (!phrase.trim() || !hint.trim() || busy) return;
    setBusy(true);

    let finalCategory = category;
    if (showCustom && customCat.trim()) {
      finalCategory = customCat.trim();
      addCategory(finalCategory);
    }

    try {
      await addDeckPhrase(deckId, {
        phrase: phrase.trim(),
        hint: hint.trim(),
        category: finalCategory,
      }, user.uid, displayName);

      setSaved(true);
      setTimeout(() => {
        navigate(`/decks/${deckId}`);
      }, 800);
    } catch (e) {
      console.error('Failed to add phrase:', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.container}>
      <Header title={deckName ? `Add to ${deckName}` : 'Add Phrase'} onBack={() => navigate(`/decks/${deckId}`)} />

      <div style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Phrase</label>
          <input
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Enter the phrase to memorize..."
            style={styles.input}
            autoComplete="off"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Hint</label>
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="What should the clue say?"
            style={styles.input}
            autoComplete="off"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <div style={styles.tags}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setShowCustom(false); }}
                style={{
                  ...styles.tag,
                  background: category === cat && !showCustom ? 'var(--primary-container)' : 'var(--surface-container-highest)',
                  color: category === cat && !showCustom ? '#fff' : 'var(--on-surface-variant)',
                }}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(true)}
              style={{
                ...styles.tag,
                background: showCustom ? 'var(--primary-container)' : 'var(--surface-container-highest)',
                color: showCustom ? '#fff' : 'var(--primary)',
              }}
            >
              + Custom
            </button>
          </div>
          {showCustom && (
            <input
              type="text"
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
              placeholder="Custom category..."
              style={{ ...styles.input, marginTop: 8 }}
              autoFocus
            />
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!phrase.trim() || !hint.trim() || busy}
          style={{
            ...styles.saveBtn,
            opacity: phrase.trim() && hint.trim() && !busy ? 1 : 0.4,
            background: saved ? 'var(--primary)' : 'var(--primary-container)',
          }}
        >
          {saved ? '✓ Added to Deck' : busy ? '...' : 'Add to Deck'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' },
  form: { padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)' },
  input: { background: 'var(--surface-container-lowest)', border: 'none', borderBottom: '2px solid var(--outline-variant)', padding: '14px 12px', color: 'var(--on-surface)', fontFamily: 'var(--font-family)', fontSize: '1rem', fontWeight: 500, borderRadius: 0, outline: 'none' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: { padding: '8px 14px', border: 'none', fontFamily: 'var(--font-family)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em', borderRadius: 0 },
  saveBtn: { padding: '16px', border: 'none', fontFamily: 'var(--font-family)', fontSize: '1rem', fontWeight: 700, color: '#fff', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 0, marginTop: 'auto' },
};
