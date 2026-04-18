import React, { useState, useMemo, useCallback } from 'react';
import { useWaitTimes } from '../hooks/useWaitTimes';
import { useAuth } from '../hooks/useAuth';
import { formatWaitTime } from '../utils/formatWaitTime';
import { useLiveAttendees } from '../hooks/useLiveAttendees';

/** Stadium zone positions on the SVG canvas */
const ZONE_POSITIONS = {
  'Gate A': { cx: 280, cy: 30, type: 'gate' },
  'Gate B': { cx: 550, cy: 150, type: 'gate' },
  'Gate C': { cx: 320, cy: 390, type: 'gate' },
  'Gate D': { cx: 50, cy: 270, type: 'gate' },
  'Concession 1': { cx: 180, cy: 90, type: 'food' },
  'Concession 2': { cx: 420, cy: 90, type: 'food' },
  'Restroom N': { cx: 160, cy: 300, type: 'restroom' },
  'Restroom S': { cx: 440, cy: 300, type: 'restroom' },
};

const TYPE_LABELS = { gate: 'GT', food: 'FD', restroom: 'WC' };

/** Dynamic Seat Calculation */

/** Architectural detailed seating blocks */
const SEATING_BLOCKS = Array.from({ length: 32 }).map((_, i) => {
  const angle = (i * 11.25 * Math.PI) / 180;
  const isInner = i % 2 === 0;
  const radius = isInner ? 100 : 150;
  const x = 300 + Math.cos(angle) * radius;
  const y = 210 + Math.sin(angle) * (radius * 0.7); // Elliptical distortion
  return { x, y, rot: (i * 11.25) };
});

export default function MapPage() {
  const { waitTimes } = useWaitTimes();
  const { user } = useAuth();
  const [selectedZone, setSelectedZone] = useState(null);
  const liveAttendees = useLiveAttendees();

  const waitMap = useMemo(() => {
    const m = {};
    waitTimes.forEach((w) => { m[w.zone] = w; });
    return m;
  }, [waitTimes]);

  const userSeatPos = useMemo(() => {
    if (!user || !user.seat) return { cx: 300, cy: 250 }; // fallback to center
    const match = user.seat.match(/Sect\s(\d+)/i);
    if (!match) return { cx: 300, cy: 250 };
    
    const sect = parseInt(match[1], 10);
    // Assuming sections 100+ encircle the 32-block stadium
    const blockIndex = Math.max(0, sect - 100) % 32;
    
    const angle = (blockIndex * 11.25 * Math.PI) / 180;
    const radius = 125; // Median distance between inner and outer ring
    const x = 300 + Math.cos(angle) * radius;
    const y = 210 + Math.sin(angle) * (radius * 0.7);
    return { cx: x, cy: y };
  }, [user]);

  const handleZoneClick = useCallback((zone) => {
    setSelectedZone((prev) => (prev === zone ? null : zone));
  }, []);

  const closePanel = useCallback(() => {
    setSelectedZone(null);
  }, []);

  const selPos = selectedZone ? ZONE_POSITIONS[selectedZone] : null;
  const selWait = selectedZone ? waitMap[selectedZone] : null;
  const selThreshold = selWait ? formatWaitTime(selWait.time) : null;

  const realisticPath = useMemo(() => {
    if (!selectedZone || !selPos) return null;

    // Center of map is 300, 210
    const user_px = userSeatPos.cx - 300;
    const user_py = userSeatPos.cy - 210;
    const sel_px = selPos.cx - 300;
    const sel_py = selPos.cy - 210;

    // Use the primary stadium concourse ring for routing (rx=210, ry=140)
    const a = 210;
    const b = 140;

    // Normalize coordinates parametrically to the concourse ellipse
    const phi_user = Math.atan2(user_py / b, user_px / a);
    const phi_dest = Math.atan2(sel_py / b, sel_px / a);

    // Calculate concourse entry/exit points
    const cx1 = 300 + a * Math.cos(phi_user);
    const cy1 = 210 + b * Math.sin(phi_user);
    const cx2 = 300 + a * Math.cos(phi_dest);
    const cy2 = 210 + b * Math.sin(phi_dest);

    // Shortest direction arc calculation
    let delta = phi_dest - phi_user;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;

    const sweep = delta > 0 ? 1 : 0;

    // Draw the orthogonal multi-segment path: Seat -> Concourse Entry -> Escalate along Concourse -> Destination Exit
    return `M ${userSeatPos.cx} ${userSeatPos.cy} L ${cx1} ${cy1} A ${a} ${b} 0 0 ${sweep} ${cx2} ${cy2} L ${selPos.cx} ${selPos.cy}`;
  }, [selectedZone, selPos, userSeatPos]);

  // Calculate zoom transform
  let mapTransform = 'translate(0px, 0px) scale(1)';
  if (selectedZone && selPos) {
    const midX = (userSeatPos.cx + selPos.cx) / 2;
    const midY = (userSeatPos.cy + selPos.cy) / 2;
    const scale = 2.1; // Aggressive zoom for premium feel
    const tx = 300 - (midX * scale);
    const ty = 210 - (midY * scale);
    mapTransform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#020617', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '24px 24px 0', zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#f8fafc', fontWeight: 800, letterSpacing: '-0.02em' }}>Live Blueprint</h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          {user?.seat || 'Global Stadium Overview'}
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#f472b6', fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f472b6', boxShadow: '0 0 8px #f472b6' }}>
              <animate/>
            </span>
            {liveAttendees.length} LIVE
          </span>
        </p>
      </header>

      {/* Interactive SVG Map with Transform Zoom */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        <svg viewBox="0 0 600 420" style={{ width: '100%', height: '100%', outline: 'none' }} role="img" aria-label="Modern Stadium Blueprint Map">
          <defs>
            <pattern id="blueprintGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(56, 189, 248, 0.04)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="fieldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#blueprintGrid)" />

          <g style={{ transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)', transform: mapTransform, transformOrigin: '0 0' }}>
            
            {/* Base stadium rings */}
            <ellipse cx="300" cy="210" rx="280" ry="190" fill="#020617" stroke="#0f172a" strokeWidth="6" />
            <ellipse cx="300" cy="210" rx="275" ry="185" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 8" />
            <ellipse cx="300" cy="210" rx="210" ry="140" fill="#090f1b" stroke="#334155" strokeWidth="1.5" />
            
            {/* Field */}
            <ellipse cx="300" cy="210" rx="140" ry="90" fill="url(#fieldGlow)" />
            <rect x="230" y="145" width="140" height="130" rx="6" fill="#022c22" stroke="#059669" strokeWidth="1" opacity="0.8" />
            <rect x="235" y="150" width="130" height="120" rx="4" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />
            <ellipse cx="300" cy="210" rx="25" ry="18" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.6"/>
            <line x1="300" y1="145" x2="300" y2="275" stroke="#10b981" strokeWidth="1" opacity="0.6" />
            <text x="300" y="214" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="800" letterSpacing="4" opacity="0.4">TURF</text>

            {/* Architectural Seating Blocks */}
            <g style={{ transition: 'opacity 0.8s', opacity: selectedZone ? 0.3 : 1 }}>
              {SEATING_BLOCKS.map((blk, i) => (
                <g key={i} transform={`translate(${blk.x}, ${blk.y}) rotate(${blk.rot})`}>
                  <rect x="-10" y="-8" width="20" height="16" fill="rgba(51, 65, 85, 0.4)" stroke="#475569" strokeWidth="0.5" rx="2" />
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#475569" strokeWidth="0.5" opacity="0.5" />
                </g>
              ))}
            </g>

            {/* Navigation path line */}
            {realisticPath && (
              <path
                d={realisticPath}
                fill="none"
                stroke="#38bdf8" 
                strokeWidth="2.5" 
                strokeDasharray="6 6"
                strokeLinecap="round"
                filter="url(#neonGlow)"
              >
                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
              </path>
            )}
            {/* Live Attendee Dots */}
            <g style={{ transition: 'opacity 0.5s', opacity: selectedZone ? 0.25 : 1 }}>
              {liveAttendees.map(a => {
                const r     = a.isMoving ? 3.5 : 2;
                const glow  = a.isMoving ? a.color : 'transparent';
                const alpha = a.isMoving ? 0.95 : 0.45;
                return (
                  <g key={a.id}>
                    {/* Glow ring — only for moving attendees */}
                    {a.isMoving && (
                      <circle cx={a.x} cy={a.y} r={r + 4} fill={a.color} opacity={0.15} />
                    )}
                    <circle cx={a.x} cy={a.y} r={r} fill={a.color} opacity={alpha} />
                  </g>
                );
              })}
            </g>

            {/* Seat marker */}
            <g transform={`translate(${userSeatPos.cx}, ${userSeatPos.cy})`}>
              <circle cx="0" cy="0" r="16" fill="rgba(139, 92, 246, 0.2)" />
              <circle cx="0" cy="0" r="5" fill="#a78bfa" stroke="#fff" strokeWidth="1.5" filter="url(#neonGlow)">
                <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
              </circle>
              <text y="-14" textAnchor="middle" fill="#c4b5fd" fontSize="8" fontWeight="700" letterSpacing="1">YOU</text>
            </g>

            {/* Premium Zone markers */}
            {Object.entries(ZONE_POSITIONS).map(([zone, pos]) => {
              const wt = waitMap[zone];
              const t = wt ? formatWaitTime(wt.time) : { color: '#64748b', label: '---' };
              const isSelected = selectedZone === zone;
              const zoneOpacity = selectedZone && !isSelected ? 0.2 : 1;

              return (
                <g
                  key={zone}
                  onClick={() => handleZoneClick(zone)}
                  style={{ cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  opacity={zoneOpacity}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${zone}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZoneClick(zone); }}
                  transform={isSelected ? `translate(0, -4)` : `translate(0, 0)`}
                >
                  {/* Outer pulse */}
                  {isSelected && (
                    <circle cx={pos.cx} cy={pos.cy} r="22" fill="none" stroke={t.color} strokeWidth="1" opacity="0.8">
                      <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  
                  {/* Pillar / Stand */}
                  <line x1={pos.cx} y1={pos.cy} x2={pos.cx} y2={pos.cy + 15} stroke={t.color} strokeWidth="1.5" opacity="0.6" />
                  
                  {/* Core Icon Shield */}
                  <circle cx={pos.cx} cy={pos.cy} r="12" fill="#0f172a" stroke={isSelected ? '#fff' : t.color} strokeWidth="1.5" filter={isSelected ? 'url(#neonGlow)' : ''} />
                  <text x={pos.cx} y={pos.cy + 3} textAnchor="middle" fill={isSelected ? '#fff' : '#cbd5e1'} fontSize="8" fontWeight="800" letterSpacing="0.5">
                    {TYPE_LABELS[pos.type]}
                  </text>
                  
                  {/* Floating Tag */}
                  <rect x={pos.cx - Math.max(zone.length * 3, 24)} y={pos.cy - 30} width={Math.max(zone.length * 6, 48)} height="14" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke={t.color} strokeWidth="0.5" />
                  <text x={pos.cx} y={pos.cy - 20} textAnchor="middle" fill="#e2e8f0" fontSize="7" fontWeight="600" letterSpacing="0.5">
                    {zone}
                  </text>
                  
                  {/* Wait Time Indicator */}
                  {wt && (
                    <text x={pos.cx} y={pos.cy + 24} textAnchor="middle" fill={t.color} fontSize="8" fontWeight="800">
                      {wt.time}m
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Details panel overlay */}
        {selectedZone && selPos && selWait && (
          <div
            style={{
              position: 'absolute', bottom: 24, left: 24, right: 24,
              background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(12px)',
              padding: '24px', borderRadius: '24px',
              border: `1px solid rgba(255,255,255,0.08)`,
              borderTop: `1px solid rgba(255,255,255,0.15)`,
              animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', background: `${selThreshold.color}15`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: selThreshold.color, 
                fontWeight: 800, fontSize: '1.25rem', border: `1px solid ${selThreshold.color}40`,
                boxShadow: `0 0 16px ${selThreshold.color}20`
              }}>
                {TYPE_LABELS[ZONE_POSITIONS[selectedZone].type]}
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {selectedZone}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ color: selThreshold.color, fontSize: '0.875rem', fontWeight: 700 }}>
                    {selWait.time} min wait
                  </span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#475569' }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{selThreshold.label}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={closePanel}
              style={{
                width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#cbd5e1'; }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Modern Status Bar Legend */}
      {!selectedZone && (
        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
          {[
            { color: '#10b981', label: 'EXCELLENT (< 5m)' },
            { color: '#f59e0b', label: 'MODERATE (5-10m)' },
            { color: '#ef4444', label: 'IMPACTED (> 10m)' },
          ].map((l) => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.color, boxShadow: `0 0 10px ${l.color}` }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
