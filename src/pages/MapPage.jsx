import React, { useState, useMemo, useCallback } from 'react';
import { useWaitTimes } from '../hooks/useWaitTimes';
import { useAuth } from '../hooks/useAuth';
import { formatWaitTime } from '../utils/formatWaitTime';

/** Stadium zone positions on the SVG canvas */
const ZONE_POSITIONS = {
  'Gate A': { cx: 300, cy: 50, type: 'gate' },
  'Gate B': { cx: 550, cy: 200, type: 'gate' },
  'Gate C': { cx: 300, cy: 370, type: 'gate' },
  'Gate D': { cx: 50, cy: 200, type: 'gate' },
  'Concession 1': { cx: 160, cy: 90, type: 'food' },
  'Concession 2': { cx: 440, cy: 90, type: 'food' },
  'Restroom North': { cx: 160, cy: 330, type: 'restroom' },
  'Restroom South': { cx: 440, cy: 330, type: 'restroom' },
};

const ICON_MAP = { gate: '🚪', food: '🍔', restroom: '🚻' };

/** Seat anchor position (center-ish, varies by section) */
const SEAT_POS = { cx: 300, cy: 210 };

/**
 * MapPage — Interactive SVG stadium with clickable zones,
 * live wait-time markers, and animated navigation paths.
 */
export default function MapPage() {
  const { waitTimes } = useWaitTimes();
  const { user } = useAuth();
  const [selectedZone, setSelectedZone] = useState(null);
  const [showNav, setShowNav] = useState(false);

  const waitMap = useMemo(() => {
    const m = {};
    waitTimes.forEach((w) => { m[w.zone] = w; });
    return m;
  }, [waitTimes]);

  const handleZoneClick = useCallback((zone) => {
    setSelectedZone(zone);
    setShowNav(true);
  }, []);

  const closePanel = useCallback(() => {
    setSelectedZone(null);
    setShowNav(false);
  }, []);

  const selPos = selectedZone ? ZONE_POSITIONS[selectedZone] : null;
  const selWait = selectedZone ? waitMap[selectedZone] : null;
  const selThreshold = selWait ? formatWaitTime(selWait.time) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>Stadium Map</h1>
        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
          Tap a zone to navigate • {user?.seat ? `Seat: ${user.seat}` : 'Set seat in Profile'}
        </p>
      </header>

      {/* Interactive SVG Map */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', position: 'relative' }}>
        <svg viewBox="0 0 600 420" style={{ width: '100%', maxWidth: 650 }} role="img" aria-label="Interactive stadium map">
          {/* Stadium structure */}
          <ellipse cx="300" cy="210" rx="270" ry="180" fill="none" stroke="#334155" strokeWidth="2" />
          <ellipse cx="300" cy="210" rx="210" ry="140" fill="none" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="200" y="140" width="200" height="140" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          <text x="300" y="215" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="600">FIELD</text>

          {/* Navigation path line */}
          {showNav && selPos && (
            <line
              x1={SEAT_POS.cx} y1={SEAT_POS.cy}
              x2={selPos.cx} y2={selPos.cy}
              stroke="#3b82f6" strokeWidth="3" strokeDasharray="10,6"
              opacity="0.9"
            >
              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.5s" repeatCount="indefinite" />
            </line>
          )}

          {/* Seat marker */}
          <circle cx={SEAT_POS.cx} cy={SEAT_POS.cy} r="8" fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="2">
            <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x={SEAT_POS.cx} y={SEAT_POS.cy - 14} textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="600">YOU</text>

          {/* Zone markers */}
          {Object.entries(ZONE_POSITIONS).map(([zone, pos]) => {
            const wt = waitMap[zone];
            const t = wt ? formatWaitTime(wt.time) : { color: '#64748b', label: '?' };
            const isSelected = selectedZone === zone;
            return (
              <g
                key={zone}
                onClick={() => handleZoneClick(zone)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`${zone}: ${wt ? wt.time + ' minute wait' : 'no data'}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZoneClick(zone); }}
              >
                {/* Pulse ring on selection */}
                {isSelected && (
                  <circle cx={pos.cx} cy={pos.cy} r="22" fill="none" stroke={t.color} strokeWidth="2" opacity="0.5">
                    <animate attributeName="r" values="18;26;18" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={pos.cx} cy={pos.cy} r="16" fill={t.color} opacity={isSelected ? 1 : 0.85} stroke={isSelected ? '#fff' : 'none'} strokeWidth="2" />
                <text x={pos.cx} y={pos.cy + 5} textAnchor="middle" fontSize="12">{ICON_MAP[pos.type]}</text>
                {/* Wait time label */}
                <text x={pos.cx} y={pos.cy + 32} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="500">
                  {wt ? `${wt.time}m` : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Details panel when zone is selected */}
        {selectedZone && selPos && selWait && (
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(12px)',
              padding: '16px 20px', borderTop: `3px solid ${selThreshold.color}`,
              animation: 'fadeInUp 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>
                  {ICON_MAP[ZONE_POSITIONS[selectedZone].type]} {selectedZone}
                </h3>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                  Wait: <strong style={{ color: selThreshold.color }}>{selWait.time} min — {selThreshold.label}</strong>
                </p>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.75rem' }}>
                  ↗ Navigating from {user?.seat || 'your seat'}
                </p>
              </div>
              <button
                onClick={closePanel}
                aria-label="Close navigation panel"
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155',
                  background: 'transparent', color: '#94a3b8', fontSize: '0.8rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom legend */}
      {!selectedZone && (
        <div style={{ padding: '8px 16px 12px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { color: '#10b981', label: '< 5min' },
            { color: '#f59e0b', label: '5–10min' },
            { color: '#ef4444', label: '> 10min' },
          ].map((l) => (
            <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#94a3b8' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
