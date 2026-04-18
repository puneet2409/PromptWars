import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useWaitTimes } from '../hooks/useWaitTimes';
import { formatWaitTime } from '../utils/formatWaitTime';

/**
 * MapPage — Renders a Google Maps embed with a live data overlay.
 * When VITE_GOOGLE_MAPS_API_KEY is set, loads the real Maps JS API.
 * Otherwise renders an interactive SVG stadium diagram.
 * @returns {React.ReactElement}
 */
export default function MapPage() {
  const mapRef = useRef(null);
  const { waitTimes, crowdDensity } = useWaitTimes();
  const [mapLoaded, setMapLoaded] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;
    if (window.google?.maps) { initMap(); return; }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization,places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);

    function initMap() {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 32.7473, lng: -97.0945 }, // AT&T Stadium
        zoom: 17,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        styles: [{ elementType: 'labels', stylers: [{ visibility: 'off' }] }],
      });
      setMapLoaded(true);
    }
  }, [apiKey]);

  /** Sorted wait times for the overlay badges */
  const sortedWaits = useMemo(
    () => [...waitTimes].sort((a, b) => a.time - b.time),
    [waitTimes]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>Stadium Map</h1>
        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
          {mapLoaded ? 'Google Maps — Live' : 'Interactive venue view'}
        </p>
      </header>

      {/* Map container or SVG fallback */}
      <div
        ref={mapRef}
        role="img"
        aria-label="Interactive stadium crowd map"
        style={{
          flex: 1, background: '#0f172a', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {!apiKey && (
          <svg viewBox="0 0 400 300" style={{ width: '90%', maxWidth: 500, opacity: 0.7 }}>
            <ellipse cx="200" cy="150" rx="180" ry="120" fill="none" stroke="#334155" strokeWidth="2" />
            <ellipse cx="200" cy="150" rx="140" ry="90" fill="none" stroke="#334155" strokeWidth="1.5" />
            <rect x="130" y="80" width="140" height="140" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x="200" y="155" textAnchor="middle" fill="#64748b" fontSize="12">Field</text>
            {/* Gate markers */}
            {['A', 'B', 'C', 'D'].map((g, i) => {
              const angle = (i * Math.PI) / 2 - Math.PI / 2;
              const cx = 200 + Math.cos(angle) * 170;
              const cy = 150 + Math.sin(angle) * 110;
              const w = waitTimes.find((wt) => wt.zone === `Gate ${g}`);
              const t = w ? formatWaitTime(w.time) : { color: '#64748b' };
              return (
                <g key={g}>
                  <circle cx={cx} cy={cy} r="12" fill={t.color} opacity="0.9" />
                  <text x={cx} y={cy + 4} textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold">{g}</text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Live overlay panel */}
      <section aria-label="Zone wait times" style={{
        padding: '12px 16px', background: 'rgba(15, 23, 42, 0.95)',
        borderTop: '1px solid rgba(148,163,184,0.1)',
      }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {sortedWaits.map((w) => {
            const t = formatWaitTime(w.time);
            return (
              <span
                key={w.zone}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', borderRadius: '20px',
                  background: `${t.color}20`, border: `1px solid ${t.color}40`,
                  color: t.color, fontSize: '0.72rem', fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: t.color,
                }} />
                {w.zone}: {w.time}m — {t.label}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
}
