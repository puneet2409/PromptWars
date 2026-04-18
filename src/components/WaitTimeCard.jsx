import React from 'react';
import { formatWaitTime } from '../utils/formatWaitTime';

/**
 * WaitTimeCard — compact live wait-time badge with color-coded threshold.
 * Uses both color AND label text so color is never the sole signal (WCAG).
 * @param {{ zone: string, time: number }} props
 * @returns {React.ReactElement}
 */
export const WaitTimeCard = ({ zone, time }) => {
  const threshold = formatWaitTime(time);

  // Shorten zone names for compact display
  const shortName = zone.replace('Concession ', 'C').replace('Restroom ', 'R').replace('Gate ', 'G');

  return (
    <article
      className="wait-time-card"
      aria-live="polite"
      aria-label={`${zone}: ${time} minute wait, ${threshold.label} congestion`}
      style={{
        flexShrink: 0,
        padding: '8px 12px',
        borderRadius: '12px',
        background: '#1e293b',
        border: `1px solid ${threshold.color}30`,
        minWidth: '90px',
        transition: 'transform 200ms',
      }}
    >
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>{shortName}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: threshold.color }}>{time}</span>
        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>min</span>
      </div>
      <span style={{
        display: 'inline-block', marginTop: '2px',
        fontSize: '0.6rem', fontWeight: 600, color: threshold.color,
        padding: '1px 6px', borderRadius: '4px',
        background: `${threshold.color}15`,
      }}>
        {threshold.label}
      </span>
    </article>
  );
};
