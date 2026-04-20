import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Play', icon: '▶' },
  { path: '/add', label: 'Add', icon: '+' },
  { path: '/collection', label: 'Collection', icon: '≡' },
  { path: '/decks', label: 'Decks', icon: '⊞' },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav style={styles.nav}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              ...styles.tab,
              ...(active ? styles.tabActive : {}),
            }}
          >
            <span style={styles.icon}>{tab.icon}</span>
            <span style={{
              ...styles.label,
              color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: 'var(--surface-container-low)',
    padding: '8px 0 12px',
    borderTop: 'none',
    flexShrink: 0,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 12px',
    fontFamily: 'var(--font-family)',
  },
  tabActive: {},
  icon: {
    fontSize: '1.25rem',
    color: 'inherit',
  },
  label: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-family)',
  },
};
