import React from 'react';
import HemicycleSeating from '../components/HemicycleSeating';

export default function SeatingPage() {
  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto', background: '#020617' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc', fontWeight: 800 }}>Seating Plan</h1>
        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
          Real-time occupancy status
        </p>
      </header>
      <HemicycleSeating />
    </div>
  );
}
