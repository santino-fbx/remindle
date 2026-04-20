import ProfileButton from './ProfileButton';

export default function Header({ title, onBack }) {
  return (
    <header style={styles.header}>
      {onBack ? (
        <button onClick={onBack} style={styles.backBtn}>←</button>
      ) : (
        <div style={{ width: 40 }} />
      )}
      <h1 style={styles.title}>{title}</h1>
      <ProfileButton />
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'var(--surface)',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'var(--font-family)',
    fontSize: '1.25rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface)',
    textAlign: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--on-surface)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    fontFamily: 'var(--font-family)',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
