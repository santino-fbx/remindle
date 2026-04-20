import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ERROR_MAP = {
  'auth/invalid-email': 'Invalid email address',
  'auth/user-not-found': 'No account with that email',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-credential': 'Incorrect email or password',
  'auth/email-already-in-use': 'Email already registered',
  'auth/weak-password': 'Password must be at least 6 characters',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed',
  'auth/network-request-failed': 'Network error. Check your connection.',
};

function friendlyError(err) {
  return ERROR_MAP[err?.code] || 'Something went wrong. Try again.';
}

export default function Login() {
  const { user, isFirebaseConfigured, signInWithGoogle, signInWithApple, signInEmail, signUpEmail } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already authed — redirect to home
  if (user) return <Navigate to="/" replace />;

  const isSignUp = mode === 'signup';

  const emailValid = email.includes('@') && email.includes('.');
  const passwordValid = password.length >= 6;
  const confirmValid = !isSignUp || password === confirmPassword;
  const canSubmit = emailValid && passwordValid && confirmValid && !busy;

  const handleOAuth = async (provider) => {
    setError('');
    setBusy(true);
    try {
      await provider();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setBusy(true);
    try {
      if (isSignUp) {
        await signUpEmail(email, password);
      } else {
        await signInEmail(email, password);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  // Firebase not configured — show setup instructions
  if (!isFirebaseConfigured) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>REMINDLE</h1>
          <p style={styles.subtitle}>Firebase Setup Required</p>
        </div>
        <div style={{ ...styles.form, textAlign: 'center' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontFamily: 'var(--font-family)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Create a Firebase project, enable Authentication (Google, Apple, Email), then add your config to <code style={{ color: 'var(--primary)' }}>.env.local</code>
          </p>
          <pre style={{
            background: 'var(--surface-container-lowest)',
            padding: 16,
            fontSize: '0.75rem',
            color: 'var(--on-surface-variant)',
            fontFamily: 'monospace',
            textAlign: 'left',
            overflowX: 'auto',
            lineHeight: 1.8,
          }}>
{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.header}>
        <h1 style={styles.title}>REMINDLE</h1>
        <p style={styles.subtitle}>Sign in to play</p>
      </div>

      {/* OAuth buttons */}
      <div style={styles.oauthSection}>
        <button
          onClick={() => handleOAuth(signInWithGoogle)}
          disabled={busy}
          style={{ ...styles.oauthBtn, opacity: busy ? 0.5 : 1 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10, flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <button
          onClick={() => handleOAuth(signInWithApple)}
          disabled={busy}
          style={{ ...styles.oauthBtn, opacity: busy ? 0.5 : 1 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10, flexShrink: 0 }}>
            <path fill="#fff" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Sign in with Apple
        </button>
      </div>

      {/* Divider */}
      <div style={styles.divider}>
        <div style={styles.dividerLine} />
        <span style={styles.dividerText}>or</span>
        <div style={styles.dividerLine} />
      </div>

      {/* Email form */}
      <form onSubmit={handleEmailSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={styles.input}
            autoComplete="email"
            disabled={busy}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            style={styles.input}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            disabled={busy}
          />
        </div>

        {isSignUp && (
          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              style={styles.input}
              autoComplete="new-password"
              disabled={busy}
            />
            {confirmPassword && !confirmValid && (
              <span style={styles.fieldError}>Passwords don't match</span>
            )}
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            ...styles.submitBtn,
            opacity: canSubmit ? 1 : 0.4,
          }}
        >
          {busy ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {/* Toggle mode */}
      <button
        onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); setError(''); }}
        style={styles.toggleBtn}
      >
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'var(--background)',
    padding: '48px 24px 32px',
    overflow: 'auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'var(--font-family)',
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'var(--on-surface)',
  },
  subtitle: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--on-surface-variant)',
    marginTop: 8,
  },
  oauthSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    maxWidth: 360,
  },
  oauthBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 16px',
    background: 'var(--surface-container-high)',
    color: 'var(--on-surface)',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'background 0.1s linear',
    width: '100%',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 360,
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'var(--outline-variant)',
  },
  dividerText: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--on-surface-variant)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    maxWidth: 360,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
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
    padding: '12px',
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-family)',
    fontSize: '0.9375rem',
    fontWeight: 500,
    borderRadius: 0,
    outline: 'none',
  },
  fieldError: {
    fontSize: '0.6875rem',
    color: 'var(--error)',
    fontFamily: 'var(--font-family)',
    marginTop: 2,
  },
  error: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.8125rem',
    color: 'var(--error)',
    textAlign: 'center',
    padding: '8px',
    background: 'var(--error-container)',
    marginTop: 4,
  },
  submitBtn: {
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
    marginTop: 4,
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontFamily: 'var(--font-family)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 20,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
};
