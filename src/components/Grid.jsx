import { Status } from '../utils/game';

const STATUS_COLORS = {
  [Status.CORRECT]: 'var(--tile-correct)',
  [Status.PRESENT]: 'var(--tile-present)',
  [Status.ABSENT]: 'var(--tile-absent)',
  [Status.FILLED]: 'var(--tile-filled)',
  [Status.EMPTY]: 'transparent',
};

const TEXT_COLORS = {
  [Status.CORRECT]: '#fff',
  [Status.PRESENT]: '#fff',
  [Status.ABSENT]: '#fff',
  [Status.FILLED]: 'var(--on-surface)',
  [Status.EMPTY]: 'var(--on-surface)',
};

function Tile({ char, status, index, animate }) {
  const bg = STATUS_COLORS[status] || 'transparent';
  const color = TEXT_COLORS[status] || 'var(--on-surface)';
  const isRevealed = [Status.CORRECT, Status.PRESENT, Status.ABSENT].includes(status);
  const isEmpty = status === Status.EMPTY;

  return (
    <div
      style={{
        width: 'var(--tile-size)',
        height: 'var(--tile-size)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        color,
        fontSize: 'clamp(0.875rem, 3.5vw, 1.25rem)',
        fontWeight: 700,
        fontFamily: 'var(--font-family)',
        textTransform: 'uppercase',
        border: isEmpty ? '2px solid var(--tile-border)' : '2px solid transparent',
        borderRadius: 0,
        transition: 'background 0.1s linear, border 0.1s linear',
        animation: animate && isRevealed
          ? `flip var(--transition-flip) ${index * 150}ms`
          : char && !isRevealed
            ? 'pop 100ms'
            : 'none',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {char || ''}
    </div>
  );
}

export default function Grid({ guesses, currentGuess, targetLength, maxAttempts, revealRow }) {
  const tileSize = targetLength > 10
    ? 'clamp(28px, 7vw, 36px)'
    : targetLength > 7
      ? 'clamp(32px, 8vw, 42px)'
      : 'clamp(40px, 10vw, 52px)';

  const gap = targetLength > 10 ? '2px' : '4px';

  const rows = [];
  for (let r = 0; r < maxAttempts; r++) {
    const cells = [];
    for (let c = 0; c < targetLength; c++) {
      let char = '';
      let status = Status.EMPTY;
      let animate = false;

      if (r < guesses.length) {
        // Submitted row
        char = guesses[r][c]?.char || '';
        status = guesses[r][c]?.status || Status.ABSENT;
        animate = r === revealRow;
      } else if (r === guesses.length) {
        // Current input row
        char = currentGuess[c] || '';
        status = char ? Status.FILLED : Status.EMPTY;
      }

      cells.push(
        <Tile key={`${r}-${c}`} char={char} status={status} index={c} animate={animate} />
      );
    }
    rows.push(
      <div key={r} style={{ display: 'flex', gap, justifyContent: 'center' }}>
        {cells}
      </div>
    );
  }

  return (
    <div style={{ '--tile-size': tileSize, display: 'flex', flexDirection: 'column', gap, padding: '0 8px' }}>
      {rows}
    </div>
  );
}
