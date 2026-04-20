import { Status } from '../utils/game';

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

const KEY_BG = {
  [Status.CORRECT]: 'var(--tile-correct)',
  [Status.PRESENT]: 'var(--tile-present)',
  [Status.ABSENT]: 'var(--tile-absent)',
};

export default function Keyboard({ keyStates = {}, onKey, disabled }) {
  const handleClick = (key) => {
    if (disabled) return;
    if (key === '⌫') onKey('Backspace');
    else if (key === 'ENTER') onKey('Enter');
    else onKey(key);
  };

  return (
    <div style={styles.container}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={styles.row}>
          {row.map(key => {
            const isSpecial = key === 'ENTER' || key === '⌫';
            const state = keyStates[key];
            const bg = state ? KEY_BG[state] : 'var(--surface-container-high)';
            const textColor = state ? '#fff' : 'var(--on-surface)';

            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                disabled={disabled}
                style={{
                  ...styles.key,
                  background: bg,
                  color: textColor,
                  flex: isSpecial ? 1.5 : 1,
                  fontSize: isSpecial ? '0.65rem' : ri === 0 ? '0.85rem' : '0.9rem',
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 4px',
    width: '100%',
    maxWidth: '500px',
  },
  row: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
  },
  key: {
    height: '46px',
    minWidth: 0,
    border: 'none',
    borderRadius: 0,
    cursor: 'pointer',
    fontFamily: 'var(--font-family)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.1s linear',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
};
