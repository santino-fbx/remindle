import { useEffect, useRef } from 'react';

/**
 * Google AdSense banner ad.
 * Renders a responsive ad unit that fills its container width.
 *
 * Props:
 *   slot   — Your AdSense ad unit ID (e.g., "1234567890")
 *   format — "auto" (default), "horizontal", "vertical", "rectangle"
 *   style  — Additional container styles
 */
export default function AdBanner({ slot, format = 'auto', style = {} }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Only push the ad once per mount
    if (pushed.current) return;

    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (e) {
      // AdSense not loaded or ad blocked — fail silently
    }
  }, []);

  const adClient = import.meta.env.VITE_ADSENSE_CLIENT;

  // Show placeholder if AdSense isn't configured
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
        style={{ display: 'block', width: '100%' }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    overflow: 'hidden',
    background: 'var(--surface-container-lowest)',
    minHeight: 50,
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
    background: 'var(--surface-container-lowest)',
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
