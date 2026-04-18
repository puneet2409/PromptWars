import React from 'react';

export const SkeletonLoader = () => (
  <div style={{ padding: '20px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }} aria-busy="true">
    <div style={{ height: '40px', background: '#334155', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
    <div style={{ height: '120px', background: '#334155', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
    <div style={{ height: '120px', background: '#334155', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
  </div>
);
