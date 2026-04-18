import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const STADIUMS = [
  { id: 'att', name: 'AT&T Stadium', city: 'Arlington, TX', capacity: '80,000' },
  { id: 'sofi', name: 'SoFi Stadium', city: 'Inglewood, CA', capacity: '70,240' },
  { id: 'metlife', name: 'MetLife Stadium', city: 'East Rutherford, NJ', capacity: '82,500' },
  { id: 'lambeau', name: 'Lambeau Field', city: 'Green Bay, WI', capacity: '81,441' },
];

const SECTIONS = Array.from({ length: 12 }, (_, i) => `${100 + i}`);
const ROWS = 'ABCDEFGHIJKLMNOP'.split('');
const SEATS = Array.from({ length: 20 }, (_, i) => `${i + 1}`);

/**
 * ProfilePage — Stadium selection, seat configuration via dropdowns, and session management.
 */
export default function ProfilePage() {
  const { user, login, logout, updateSeat } = useAuth();
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
        justifyContent: 'center', height: '100%', padding: '24px',
        animation: 'fadeInUp 0.4s ease',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }} aria-hidden="true">🏟️</div>
        <h1 style={{ color: '#f8fafc', marginBottom: '8px', fontSize: '1.5rem' }}>
          Welcome to NaviStadium
        </h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: '320px', lineHeight: 1.5, marginBottom: '32px' }}>
          Sign in to get real-time AI-powered guidance, personalized routes, and live crowd insights.
        </p>
        <button
          onClick={() => login({ credential: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiU3RhZGl1bSBGYW4iLCJlbWFpbCI6ImZhbkBuYXZpc3RhZGl1bS5kZXYiLCJwaWN0dXJlIjoiIn0' })}
          style={{
            padding: '14px 28px', background: '#fff', color: '#0f172a',
            fontWeight: 700, borderRadius: '12px', border: 'none',
            fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 200ms, box-shadow 200ms',
          }}
        >
          🔐 Sign in with Google
        </button>
      </section>
    );
  }

  const activeStadium = STADIUMS.find((s) => s.id === stadium);
  const canSave = section && row && seat;

  return (
    <section style={{ padding: '20px', overflowY: 'auto', height: '100%', animation: 'fadeInUp 0.3s ease' }}>
      <h1 style={{ color: '#f8fafc', marginBottom: '20px', fontSize: '1.25rem' }}>Setup</h1>

      {/* User card */}
      <article style={{ background: '#1e293b', padding: '16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid rgba(148,163,184,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            {user.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc' }}>{user.name}</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{user.email}</p>
          </div>
        </div>
      </article>

      {/* Stadium selector */}
      <article style={{ background: '#1e293b', padding: '16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid rgba(148,163,184,0.1)' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#f8fafc' }}>🏟️ Stadium</h2>
        <label htmlFor="stadium-select" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Select stadium</label>
        <select id="stadium-select" value={stadium} onChange={(e) => setStadium(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
          {STADIUMS.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
          ))}
        </select>
        {activeStadium && (
          <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Capacity: {activeStadium.capacity}
          </p>
        )}
      </article>

      {/* Seat selector */}
      <article style={{ background: '#1e293b', padding: '16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid rgba(148,163,184,0.1)' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#f8fafc' }}>📍 Seat Location</h2>
        {user.seat && (
          <p style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.8rem', marginBottom: '12px' }}>
            Current: {user.seat}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="section-select" style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>Section</label>
            <select id="section-select" value={section} onChange={(e) => setSection(e.target.value)} style={selectStyle}>
              <option value="">—</option>
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="row-select" style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>Row</label>
            <select id="row-select" value={row} onChange={(e) => setRow(e.target.value)} style={selectStyle}>
              <option value="">—</option>
              {ROWS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="seat-select" style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>Seat</label>
            <select id="seat-select" value={seat} onChange={(e) => setSeat(e.target.value)} style={selectStyle}>
              <option value="">—</option>
              {SEATS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
            background: canSave ? '#3b82f6' : '#334155',
            color: '#fff', fontWeight: 600, cursor: canSave ? 'pointer' : 'default',
            fontFamily: 'inherit', transition: 'background 200ms', fontSize: '0.9rem',
          }}
        >
          {canSave ? '✓ Save Seat Location' : 'Select section, row & seat'}
        </button>
      </article>

      {/* Sign out */}
      <button
        onClick={logout}
        style={{
          width: '100%', padding: '14px', background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Sign Out
      </button>
    </section>
  );
}
