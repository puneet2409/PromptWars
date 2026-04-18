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

/** Seat anchor pos */
const SEAT_POS = { cx: 300, cy: 210 };

/** Architectural detailed seating blocks */
const SEATING_BLOCKS = Array.from({ length: 24 }).map((_, i) => {
  const angle = (i * 15 * Math.PI) / 180;
  // Inner ring
  const isInner = i % 2 === 0;
  const radius = isInner ? 90 : 130;
  const x = 300 + Math.cos(angle) * (radius * 1.5);
  const y = 210 + Math.sin(angle) * radius;
  return { x, y, rot: (i * 15) % 360 };
});

export default function MapPage() {
  const { waitTimes } = useWaitTimes();
  const { user } = useAuth();
  const [selectedZone, setSelectedZone] = useState(null);

  const waitMap = useMemo(() => {
    const m = {};
    waitTimes.forEach((w) => { m[w.zone] = w; });
    return m;
  }, [waitTimes]);

  const handleZoneClick = useCallback((zone) => {
    setSelectedZone(zone);
  }, []);

  const closePanel = useCallback(() => {
    setSelectedZone(null);
  }, []);

  const selPos = selectedZone ? ZONE_POSITIONS[selectedZone] : null;
  const selWait = selectedZone ? waitMap[selectedZone] : null;
  const selThreshold = selWait ? formatWaitTime(selWait.time) : null;

  // Calculate zoom transform
  let mapTransform = 'translate(0px, 0px) scale(1)';
  if (selectedZone && selPos) {
    const midX = (SEAT_POS.cx + selPos.cx) / 2;
    const midY = (SEAT_POS.cy + selPos.cy) / 2;
    const scale = 1.9; // 190% zoom for architectural detail
    const tx = 300 - (midX * scale);
    const ty = 210 - (midY * scale);
    mapTransform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ padding: '16px 16px 4px', zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc', fontWeight: 800 }}>Live Map</h1>
        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
          {user?.seat || 'Set seat in Setup'}
        </p>
      </header>

      {/* Interactive SVG Map with Transform Zoom */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        <svg viewBox="0 0 600 420" style={{ width: '100%', height: '100%' }} role="img" aria-label="Stadium architectural map">
          <g style={{ transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)', transform: mapTransform, transformOrigin: '0 0' }}>
            
            {/* Base stadium rings */}
            <ellipse cx="300" cy="210" rx="270" ry="180" fill="#0f172a" stroke="#1e293b" strokeWidth="4" />
            <ellipse cx="300" cy="210" rx="210" ry="140" fill="none" stroke="#1e293b" strokeWidth="2" />
            
            {/* Field */}
            <rect x="220" y="140" width="160" height="140" rx="8" fill="#061c10" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="300" cy="210" r="15" fill="none" stroke="#rgba(16,185,129,0.5)" />
            <text x="300" y="214" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="700" letterSpacing="4" opacity="0.4">FIELD</text>

            {/* Architectural Seating Blocks (Fades in on zoom) */}
            <g style={{ transition: 'opacity 0.8s', opacity: selectedZone ? 0.7 : 0 }}>
              {SEATING_BLOCKS.map((blk, i) => (
                <g key={i} transform={`translate(${blk.x}, ${blk.y}) rotate(${blk.rot})`}>
                  <rect x="-15" y="-10" width="30" height="20" fill="none" stroke="#334155" strokeWidth="0.5" rx="2" />
                  <line x1="-15" y1="0" x2="15" y2="0" stroke="#334155" strokeWidth="0.5" opacity="0.5" />
                  <circle cx="0" cy="-5" r="1" fill="#475569" />
                  <circle cx="0" cy="5" r="1" fill="#475569" />
                  <text x="0" y="2" fontSize="5" fill="#475569" textAnchor="middle" opacity="0.8">S{100 + i}</text>
                </g>
              ))}
            </g>

            {/* Navigation path line */}
            {selectedZone && selPos && (
              <line
                x1={SEAT_POS.cx} y1={SEAT_POS.cy}
                x2={selPos.cx} y2={selPos.cy}
                stroke="#3b82f6" strokeWidth="3" strokeDasharray="10,6"
                strokeLinecap="round"
              >
                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.5s" repeatCount="indefinite" />
              </line>
            )}

            {/* Seat marker */}
            <circle cx={SEAT_POS.cx} cy={SEAT_POS.cy} r="6" fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="1.5">
              <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x={SEAT_POS.cx} y={SEAT_POS.cy - 12} textAnchor="middle" fill="#c4b5fd" fontSize="8" fontWeight="700">YOU</text>

            {/* Zone markers */}
            {Object.entries(ZONE_POSITIONS).map(([zone, pos]) => {
              const wt = waitMap[zone];
              const t = wt ? formatWaitTime(wt.time) : { color: '#64748b', label: '?' };
              const isSelected = selectedZone === zone;
              // Fade out non-selected zones slightly when zoomed
              const zoneOpacity = selectedZone && !isSelected ? 0.3 : 1;

              return (
                <g
                  key={zone}
                  onClick={() => handleZoneClick(zone)}
                  style={{ cursor: 'pointer', transition: 'opacity 0.5s' }}
                  opacity={zoneOpacity}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${zone}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZoneClick(zone); }}
                >
                  {/* Pulse ring on selection */}
                  {isSelected && (
                    <circle cx={pos.cx} cy={pos.cy} r="18" fill="none" stroke={t.color} strokeWidth="1.5">
                      <animate attributeName="r" values="14;22;14" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={pos.cx} cy={pos.cy} r="12" fill={t.color} stroke={isSelected ? '#fff' : '#0f172a'} strokeWidth="1.5" />
                  <text x={pos.cx} y={pos.cy + 4} textAnchor="middle" fontSize="10">{ICON_MAP[pos.type]}</text>
                  
                  {/* Visible text label so user knows what marker this is! */}
                  <text x={pos.cx} y={pos.cy + 22} textAnchor="middle" fill="#cbd5e1" fontSize="8" fontWeight="600" opacity="0.9">
                    {zone}
                  </text>
                  <text x={pos.cx} y={pos.cy + 32} textAnchor="middle" fill={t.color} fontSize="8" fontWeight="700">
                    {wt ? `${wt.time}m` : ''}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Details panel overlay */}
        {selectedZone && selPos && selWait && (
          <div
            style={{
              position: 'absolute', bottom: 16, left: 16, right: 16,
              background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(16px)',
              padding: '16px 20px', borderRadius: '16px',
              border: `1px solid rgba(255,255,255,0.1)`,
              borderLeft: `4px solid ${selThreshold.color}`,
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800 }}>
                  <span style={{ marginRight: 6 }}>{ICON_MAP[ZONE_POSITIONS[selectedZone].type]}</span>
                  {selectedZone}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ background: `${selThreshold.color}1A`, color: selThreshold.color, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {selWait.time} min wait
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{selThreshold.label}</span>
                </div>
                <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#3b82f6' }}>⤑</span> Route calculated from {user?.seat ? 'your seat' : 'seat'}
                </p>
              </div>
              <button
                onClick={closePanel}
                aria-label="Close navigation"
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Basic legend when no zone is selected */}
      {!selectedZone && (
        <div style={{ padding: '8px 16px 16px', display: 'flex', gap: '16px', justifyContent: 'center', background: '#0f172a' }}>
          {[
            { color: '#10b981', label: '< 5m' },
            { color: '#f59e0b', label: '5–10m' },
            { color: '#ef4444', label: '> 10m' },
          ].map((l) => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, boxShadow: `0 0 8px ${l.color}40` }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
