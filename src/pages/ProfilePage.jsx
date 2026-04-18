import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { STADIUMS } from './OnboardingPage';

const SECTIONS = Array.from({ length: 12 }, (_, i) => `${100 + i}`);
const ROWS = 'ABCDEFGHIJKLMNOP'.split('');
const SEATS = Array.from({ length: 20 }, (_, i) => `${i + 1}`);

export default function ProfilePage() {
  const { user, logout, updateSeat } = useAuth();
  const [stadium, setStadium] = useState(STADIUMS[0].id);
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seat, setSeat] = useState('');

  const handleUpdate = useCallback(() => {
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

  const canSave = section && row && seat;

  return (
    <section style={{ padding: '24px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px' }}>Settings</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Manage your profile and seat location.</p>
      </header>

      <article style={{ background: '#1e293b', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(148,163,184,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            {user.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>{user.name}</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{user.email}</p>
          </div>
        </div>
      </article>

      <article style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(148,163,184,0.1)' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#f8fafc' }}>Update Seat Location</h2>
        {user.seat && (
          <p style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem', marginBottom: '16px' }}>
            Current: {user.seat}
          </p>
        )}
        
        <label htmlFor="stadium-select" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Stadium</label>
        <select id="stadium-select" value={stadium} onChange={(e) => setStadium(e.target.value)} style={{ ...selectStyle, width: '100%', marginBottom: '16px' }}>
          {STADIUMS.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
          ))}
        </select>

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

        <button
          onClick={handleUpdate}
          disabled={!canSave}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            background: canSave ? '#3b82f6' : '#334155', color: '#fff', 
            fontWeight: 700, cursor: canSave ? 'pointer' : 'default',
            transition: 'background 0.2s', fontFamily: 'inherit'
          }}
        >
          {canSave ? 'Update Seat' : 'Select new seat details'}
        </button>
      </article>

      <button
        onClick={logout}
        style={{
          width: '100%', padding: '16px', background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.2s'
        }}
      >
        Sign Out
      </button>
    </section>
  );
}
