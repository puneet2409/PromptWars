import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

export const STADIUMS = [
  { id: 'att', name: 'AT&T Stadium', city: 'Arlington, TX', capacity: '80,000', color: 'from-blue-900 to-slate-900', ring: '#3b82f6' },
  { id: 'sofi', name: 'SoFi Stadium', city: 'Inglewood, CA', capacity: '70,240', color: 'from-teal-900 to-slate-900', ring: '#14b8a6' },
  { id: 'metlife', name: 'MetLife Stadium', city: 'East Rutherford, NJ', capacity: '82,500', color: 'from-green-900 to-slate-900', ring: '#10b981' },
  { id: 'lambeau', name: 'Lambeau Field', city: 'Green Bay, WI', capacity: '81,441', color: 'from-emerald-900 to-slate-900', ring: '#059669' },
];

const SECTIONS = Array.from({ length: 12 }, (_, i) => `${100 + i}`);
const ROWS = 'ABCDEFGHIJKLMNOP'.split('');
const SEATS = Array.from({ length: 20 }, (_, i) => `${i + 1}`);

export default function OnboardingPage({ user, login, updateSeat }) {
  const [stadium, setStadium] = useState(STADIUMS[0].id);
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seat, setSeat] = useState('');

  const handleSave = useCallback(() => {
    if (section && row && seat) {
      const selectedStadium = STADIUMS.find((s) => s.id === stadium);
      const seatStr = `${selectedStadium?.name || ''} — Sect ${section}, Row ${row}, Seat ${seat}`;
      updateSeat(seatStr);
    }
  }, [section, row, seat, stadium, updateSeat]);

  const selectStyle = {
    flex: 1, padding: '10px 12px', borderRadius: '10px',
    border: '1px solid rgba(148,163,184,0.15)', background: '#0f172a',
    color: '#f8fafc', fontSize: '0.85rem', fontFamily: 'inherit',
    appearance: 'none', cursor: 'pointer',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
    paddingRight: '32px',
  };

  if (!user) {
    return (
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', padding: '24px',
        animation: 'fadeInUp 0.4s ease', background: 'radial-gradient(circle at 50% -20%, #1e293b, #020617)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }} aria-hidden="true">🏟️</div>
        <h1 style={{ color: '#f8fafc', marginBottom: '8px', fontSize: '1.8rem', fontWeight: 800 }}>
          NaviStadium
        </h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: '320px', lineHeight: 1.5, marginBottom: '40px' }}>
          Connect to the venue neural net for live turn-by-turn routing and wait time intelligence.
        </p>
        <button
          onClick={() => login({ credential: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiU3RhZGl1bSBGYW4iLCJlbWFpbCI6ImZhbkBuYXZpc3RhZGl1bS5kZXYiLCJwaWN0dXJlIjoiIn0' })}
          style={{
            padding: '16px 32px', background: '#3b82f6', color: '#fff',
            fontWeight: 700, borderRadius: '12px', border: 'none',
            fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
            transition: 'transform 200ms, box-shadow 200ms',
          }}
        >
          Authenticate to Enter
        </button>
      </section>
    );
  }

  const canSave = section && row && seat;

  return (
    <section style={{ padding: '24px', overflowY: 'auto', height: '100vh', animation: 'fadeInUp 0.3s ease', background: '#020617' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#f8fafc', margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 800 }}>Select Venue</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Configure your digital pass to activate the map.</p>
      </header>

      {/* SVG-based Premium Stadium Selection Cards instead of heavy images */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '16px', margin: '0 -24px 8px', paddingLeft: '24px', scrollSnapType: 'x mandatory' }}>
        {STADIUMS.map((s) => {
          const isSelected = stadium === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setStadium(s.id)}
              style={{
                scrollSnapAlign: 'center',
                flexShrink: 0, width: '220px', height: '140px',
                borderRadius: '16px', position: 'relative', overflow: 'hidden',
                cursor: 'pointer', background: '#0f172a',
                border: isSelected ? `2px solid ${s.ring}` : '1px solid rgba(148,163,184,0.1)',
                transition: 'all 0.3s ease',
                boxShadow: isSelected ? `0 8px 24px ${s.ring}33` : 'none',
              }}
            >
              {/* Procedural Stadium SVG Background */}
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', top: 0, left: 0, opacity: isSelected ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                <defs>
                  <linearGradient id={`grad-${s.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={s.ring} stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="220" height="140" fill={`url(#grad-${s.id})`} />
                <ellipse cx="110" cy="70" rx="90" ry="50" fill="none" stroke={s.ring} strokeWidth="1" strokeDasharray="4 2" opacity="0.3" />
                <ellipse cx="110" cy="70" rx="70" ry="35" fill="none" stroke={s.ring} strokeWidth="2" opacity="0.5" />
                <rect x="80" y="55" width="60" height="30" rx="4" fill={s.ring} opacity="0.2" />
              </svg>
              
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(to top, #0f172a, transparent)' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: '0 0 2px' }}>{s.name}</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.7rem', margin: 0 }}>{s.city}</p>
              </div>
            </div>
          );
        })}
      </div>

      <article style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.1)', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1.05rem', color: '#f8fafc' }}>📍 Seat Location</h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="section-select" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Section</label>
            <select id="section-select" value={section} onChange={(e) => setSection(e.target.value)} style={selectStyle}>
              <option value="">—</option>
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="row-select" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Row</label>
            <select id="row-select" value={row} onChange={(e) => setRow(e.target.value)} style={selectStyle}>
              <option value="">—</option>
              {ROWS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="seat-select" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Seat</label>
            <select id="seat-select" value={seat} onChange={(e) => setSeat(e.target.value)} style={selectStyle}>
              <option value="">—</option>
              {SEATS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </article>

      <button
        onClick={handleSave}
        disabled={!canSave}
        style={{
          width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
          background: canSave ? '#3b82f6' : '#334155',
          color: '#fff', fontWeight: 700, cursor: canSave ? 'pointer' : 'default',
          fontFamily: 'inherit', transition: 'all 0.2s', fontSize: '1rem',
          boxShadow: canSave ? '0 8px 24px rgba(59,130,246,0.25)' : 'none'
        }}
      >
        {canSave ? 'Enter NaviStadium ✓' : 'Select section, row & seat'}
      </button>
    </section>
  );
}
