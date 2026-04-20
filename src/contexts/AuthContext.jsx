import { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../firebase';
import { setStorageUser, migrateUnscopedData } from '../utils/storage';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase isn't configured, skip auth entirely
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    import('firebase/auth').then(({ onAuthStateChanged }) => {
      if (!isMounted) return;
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!isMounted) return;
        if (firebaseUser) {
          setUser(firebaseUser);
          setStorageUser(firebaseUser.uid);
          migrateUnscopedData(firebaseUser.uid);
        } else {
          setUser(null);
          setStorageUser(null);
        }
        setLoading(false);
      });
      window.__authUnsub = unsubscribe;
    });

    return () => {
      isMounted = false;
      if (window.__authUnsub) window.__authUnsub();
    };
  }, []);

  // Use redirect on mobile (popups get blocked), popup on desktop
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const signInWithGoogle = async () => {
    const { signInWithPopup, signInWithRedirect, GoogleAuthProvider } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    return isMobile ? signInWithRedirect(auth, provider) : signInWithPopup(auth, provider);
  };

  const signInWithApple = async () => {
    const { signInWithPopup, signInWithRedirect, OAuthProvider } = await import('firebase/auth');
    const provider = new OAuthProvider('apple.com');
    return isMobile ? signInWithRedirect(auth, provider) : signInWithPopup(auth, provider);
  };

  const signInEmail = async (email, password) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUpEmail = async (email, password) => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const { signOut } = await import('firebase/auth');
    return signOut(auth);
  };

  // Loading screen while Firebase resolves auth state
  if (loading) {
    return (
      <div style={styles.loading}>
        <h1 style={styles.loadingTitle}>REMINDLE</h1>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isFirebaseConfigured,
      signInWithGoogle,
      signInWithApple,
      signInEmail,
      signUpEmail,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'var(--background)',
    gap: 16,
  },
  loadingTitle: {
    fontFamily: 'var(--font-family)',
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'var(--on-surface)',
  },
  loadingDot: {
    width: 8,
    height: 8,
    background: 'var(--primary)',
    animation: 'blink 1s linear infinite',
  },
};
