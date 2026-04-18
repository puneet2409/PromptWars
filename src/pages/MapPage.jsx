import React, { useEffect, useRef } from 'react';
import { useWaitTimes } from '../hooks/useWaitTimes';
import { formatWaitTime } from '../utils/formatWaitTime';

export default function MapPage() {
  const mapRef = useRef(null);
  const { waitTimes } = useWaitTimes();

  useEffect(() => {
    // Simulated Google Maps initialization for demonstration
    if (mapRef.current) {
      mapRef.current.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;flex-direction:column;">
        <span>Google Maps Render Target</span>
        <span style="font-size:0.8rem">(Requires google maps api key and loader initialization)</span>
      </div>`;
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ flex: 1, background: '#1e293b' }}
        role="img" 
        aria-label="Interactive stadium crowd map"
      />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'rgba(15, 23, 42, 0.9)' }}>
        <h3 style={{ color: '#f8fafc', margin: '0 0 8px 0', fontSize: '1rem' }}>Live Heatmap Overlay</h3>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {waitTimes.map(w => {
            const threshold = formatWaitTime(w.time);
            return (
              <span key={w.zone} style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '12px', background: threshold.color, color: '#000', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {w.zone}: {w.time}m
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
