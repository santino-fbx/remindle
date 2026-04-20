import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>
      <h1 style={styles.title}>Terms of Service</h1>
      <p style={styles.date}>Last updated: April 20, 2026</p>

      <section style={styles.section}>
        <h2 style={styles.heading}>Acceptance</h2>
        <p style={styles.body}>By using Remindle, you agree to these terms. If you don't agree, please don't use the service.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>The Service</h2>
        <p style={styles.body}>Remindle is a memory training application that helps you memorize personal information through a Wordle-style game mechanic. The service includes personal play, shared decks, and challenge modes.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Your Content</h2>
        <p style={styles.body}>You are responsible for the phrases and information you store in Remindle. Do not store sensitive data like passwords, social security numbers, or financial account numbers. Phrases shared in decks and challenges are visible to other participants.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Accounts</h2>
        <p style={styles.body}>You are responsible for maintaining the security of your account. Remindle uses Firebase Authentication and does not store your password directly.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Acceptable Use</h2>
        <p style={styles.body}>Don't use Remindle to store or share illegal, harmful, or abusive content. Don't attempt to interfere with the service or access other users' data.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Advertising</h2>
        <p style={styles.body}>Remindle displays advertisements to support the free service. Ad content is provided by Google AdSense and is not controlled by Remindle.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Availability</h2>
        <p style={styles.body}>Remindle is provided "as is" without warranty. We may modify or discontinue the service at any time. We are not liable for any data loss.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Contact</h2>
        <p style={styles.body}>Questions about these terms? Contact us at hello@remindle.co.</p>
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
