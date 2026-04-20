import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { savePhrase, getCategories, addCategory } from '../utils/storage';

export default function AddPhrase() {
  const navigate = useNavigate();
  const [phrase, setPhrase] = useState('');
  const [hint, setHint] = useState('');
  const [category, setCategory] = useState('People');
  const [customCat, setCustomCat] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [saved, setSaved] = useState(false);

  const categories = getCategories();

  const handleSave = () => {
    if (!phrase.trim() || !hint.trim()) return;

    let finalCategory = category;
    if (showCustom && customCat.trim()) {
      finalCategory = customCat.trim();
      addCategory(finalCategory);
    }

    savePhrase({
      phrase: phrase.trim(),
      hint: hint.trim(),
      category: finalCategory,
    });

    setSaved(true);
    setTimeout(() => {
      setPhrase('');
      setHint('');
      setCategory('People');
      setShowCustom(false);
      setCustomCat('');
      setSaved(false);
    }, 1200);
  };

  return (
    <div style={styles.container}>
      <Header title="Add Phrase" onBack={() => navigate('/')} />

      <div style={styles.form}>
        {/* Phrase */}
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
          <span style={styles.charHint}>{phrase.length} characters — no limit</span>
        </div>

        {/* Hint */}
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

        {/* Category */}
        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <div style={styles.tags}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setShowCustom(false); }}
                style={{
                  ...styles.tag,
                  background: category === cat && !showCustom
                    ? 'var(--primary-container)'
                    : 'var(--surface-container-highest)',
                  color: category === cat && !showCustom
                    ? '#fff'
                    : 'var(--on-surface-variant)',
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
              placeholder="Custom category name..."
              style={{ ...styles.input, marginTop: 8 }}
              autoFocus
            />
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!phrase.trim() || !hint.trim()}
          style={{
            ...styles.saveBtn,
            opacity: phrase.trim() && hint.trim() ? 1 : 0.4,
            background: saved ? 'var(--primary)' : 'var(--primary-container)',
          }}
        >
          {saved ? '✓ Saved' : 'Save Phrase'}
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
    overflow: 'auto',
  },
  form: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    flex: 1,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-family)',
  },
  input: {
    background: 'var(--surface-container-lowest)',
    border: 'none',
    borderBottom: '2px solid var(--outline-variant)',
    padding: '14px 12px',
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-family)',
    fontSize: '1rem',
    fontWeight: 500,
    borderRadius: 0,
    outline: 'none',
    transition: 'border-color 0.1s linear',
  },
  charHint: {
    fontSize: '0.6875rem',
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-family)',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    padding: '8px 14px',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderRadius: 0,
    transition: 'background 0.1s linear',
  },
  saveBtn: {
    padding: '16px',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderRadius: 0,
    marginTop: 'auto',
    transition: 'background 0.15s linear',
  },
};
