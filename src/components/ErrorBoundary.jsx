import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Remindle error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <h1 style={styles.title}>REMINDLE</h1>
          <p style={styles.message}>Something went wrong</p>
          <p style={styles.detail}>{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={this.handleReset} style={styles.button}>
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'var(--background)',
    padding: 32,
    gap: 12,
  },
  title: {
    fontFamily: 'var(--font-family)',
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'var(--on-surface)',
  },
  message: {
    fontFamily: 'var(--font-family)',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--error)',
    textTransform: 'uppercase',
  },
  detail: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.75rem',
    color: 'var(--on-surface-variant)',
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    marginTop: 16,
    padding: '12px 24px',
    background: 'var(--primary-container)',
    color: '#fff',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
    textTransform: 'uppercase',
    borderRadius: 0,
  },
};
