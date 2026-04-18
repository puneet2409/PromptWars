import React from 'react';
import { formatWaitTime } from '../utils/formatWaitTime';

export const WaitTimeCard = ({ zone, time }) => {
  const threshold = formatWaitTime(time);
  
  return (
    <article 
      className="wait-time-card"
      style={{
        padding: '12px',
        margin: '8px 0',
        borderRadius: '8px',
        background: '#1e293b',
        borderLeft: `4px solid ${threshold.color}`
      }}
      aria-live="polite"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>{zone}</h3>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 'bold', color: threshold.color }}>
            {time} min
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {threshold.label}
          </span>
        </div>
      </div>
    </article>
  );
};
