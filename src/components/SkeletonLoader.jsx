import React from 'react';

/**
 * SkeletonLoader — shimmer placeholder shown while lazy pages load.
 * @returns {React.ReactElement}
 */
export const SkeletonLoader = () => (
  <div
    role="status"
    aria-label="Loading content"
    aria-busy="true"
    style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
  >
    {[120, 200, 160, 80].map((h, i) => (
      <div
        key={i}
        style={{
          height: `${h}px`,
          borderRadius: '12px',
          background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }}
      />
    ))}
    <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
      Loading…
    </span>
  </div>
);
