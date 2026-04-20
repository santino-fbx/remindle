import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>
      <h1 style={styles.title}>Privacy Policy</h1>
      <p style={styles.date}>Last updated: April 20, 2026</p>

      <section style={styles.section}>
        <h2 style={styles.heading}>What We Collect</h2>
        <p style={styles.body}>When you create an account, we collect your email address and display name through Firebase Authentication. If you sign in with Google or Apple, we receive the profile information those services provide (name, email, profile photo).</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>How We Use Your Data</h2>
        <p style={styles.body}>Your data is used solely to provide the Remindle service: authenticating your account, storing your phrases and game progress, and enabling shared deck features. We do not sell your personal information.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Data Storage</h2>
        <p style={styles.body}>Personal phrases and game state are stored locally on your device (localStorage). Shared deck data (phrases, membership, game results) is stored in Google Firebase Firestore and is accessible only to authenticated deck members.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Advertising</h2>
        <p style={styles.body}>Remindle displays advertisements through Google AdSense. Google may use cookies and device identifiers to serve personalized ads. You can opt out of personalized advertising through your Google Ad Settings.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Analytics</h2>
        <p style={styles.body}>We use Firebase Analytics to understand how the app is used (games played, features accessed). This data is aggregated and anonymized. No personal phrase content is included in analytics.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Third-Party Services</h2>
        <p style={styles.body}>Remindle uses: Google Firebase (authentication, database, analytics), Google AdSense (advertising), and Vercel (hosting). Each service has its own privacy policy.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Your Rights</h2>
        <p style={styles.body}>You can delete your account and all associated data at any time by contacting us. You can also clear your local data by clearing your browser's site data for remindle.co.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Contact</h2>
        <p style={styles.body}>For privacy questions, contact us at privacy@remindle.co.</p>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--background)', padding: '24px 20px 64px', maxWidth: 600, margin: '0 auto' },
  back: { background: 'none', border: 'none', color: 'var(--primary)', fontFamily: 'var(--font-family)', fontSize: '0.875rem', cursor: 'pointer', marginBottom: 16, padding: 0 },
  title: { fontFamily: 'var(--font-family)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 },
  date: { fontFamily: 'var(--font-family)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: 24 },
  section: { marginBottom: 20 },
  heading: { fontFamily: 'var(--font-family)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 },
  body: { fontFamily: 'var(--font-family)', fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 },
};
