import { useEffect, useRef } from 'react';

/**
 * Google AdSense display/rectangle ad (for interstitial-style placements).
 * Renders a large-format ad unit — ideal for between-content breaks like game results.
 *
 * Props:
 *   slot   — Your AdSense ad unit ID
 *   style  — Additional container styles
 */
export default function AdInterstitial({ slot, style = {} }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (e) {
      // Ad blocked or not loaded
    }
  }, []);

  const adClient = import.meta.env.VITE_ADSENSE_CLIENT;

  if (!adClient || !slot) {
    return (
      <div style={{ ...styles.placeholder, ...style }}>
        <span style={styles.placeholderText}>Ad Space</span>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, ...style }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: 250 }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format="rectangle"
      />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    overflow: 'hidden',
    background: 'var(--surface-container-lowest)',
    minHeight: 250,
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 200,
    background: 'var(--surface-container-lowest)',
    border: '1px dashed var(--outline-variant)',
  },
  placeholderText: {
    fontFamily: 'var(--font-family)',
    fontSize: '0.6875rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--on-surface-variant)',
  },
};
