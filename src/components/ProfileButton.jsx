import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileButton() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return <div style={{ width: 36 }} />;

  const initial = (user.email?.[0] || user.displayName?.[0] || '?').toUpperCase();
  const photo = user.photoURL;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div ref={ref} style={styles.wrapper}>
      <button onClick={() => setOpen(prev => !prev)} style={styles.avatar}>
        {photo ? (
          <img src={photo} alt="" style={styles.avatarImg} referrerPolicy="no-referrer" />
        ) : (
          <span style={styles.avatarInitial}>{initial}</span>
        )}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <span style={styles.email}>{user.email || user.displayName || 'User'}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    width: 36,
    height: 36,
  },
  avatar: {
    width: 36,
    height: 36,
    background: 'var(--surface-container-highest)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 0,
    padding: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarInitial: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--primary)',
  },
  dropdown: {
    position: 'absolute',
    top: 42,
    right: 0,
    background: 'var(--surface-container-high)',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 180,
    zIndex: 200,
    boxShadow: '4px 4px 0 var(--surface-container-lowest)',
  },
  email: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.6875rem',
    fontWeight: 500,
    color: 'var(--on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    wordBreak: 'break-all',
  },
  logoutBtn: {
    background: 'var(--surface-container-highest)',
    border: 'none',
    padding: '8px 12px',
    fontFamily: 'var(--font-family)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--error)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    borderRadius: 0,
    textAlign: 'center',
  },
};
