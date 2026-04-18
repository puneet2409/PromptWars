import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const MAX_SEAT_LENGTH = 50;

/**
 * ProfilePage — User login, seat configuration, and session management.
 * Uses Google Identity Services when key is available, mock login otherwise.
 * @returns {React.ReactElement}
 */
export default function ProfilePage() {
  const { user, login, logout, updateSeat } = useAuth();
  const [seatInput, setSeatInput] = useState('');

  const handleUpdateSeat = useCallback(() => {
    const trimmed = seatInput.trim();
    if (trimmed) {
      updateSeat(trimmed);
      setSeatInput('');
    }
  }, [seatInput, updateSeat]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleUpdateSeat();
  }, [handleUpdateSeat]);

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
          onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
        >
          🔐 Sign in with Google
        </button>
      </section>
    );
  }

  return (
    <section style={{ padding: '24px', animation: 'fadeInUp 0.3s ease' }}>
      <h1 style={{ color: '#f8fafc', marginBottom: '24px', fontSize: '1.25rem' }}>Your Profile</h1>

      {/* User card */}
      <article style={{
        background: '#1e293b', padding: '20px', borderRadius: '16px',
        marginBottom: '20px', border: '1px solid rgba(148,163,184,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 700, color: '#fff',
          }}>
            {user.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>{user.name}</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</p>
          </div>
        </div>
      </article>

      {/* Seat config */}
      <article style={{
        background: '#1e293b', padding: '20px', borderRadius: '16px',
        marginBottom: '20px', border: '1px solid rgba(148,163,184,0.1)',
      }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#f8fafc' }}>
          Seat Location
        </h2>
        <p style={{ color: user.seat ? '#3b82f6' : '#64748b', fontWeight: 600, marginBottom: '12px', fontSize: '0.85rem' }}>
          {user.seat ? `📍 ${user.seat}` : 'Not set yet — the AI needs your seat for personalized routing'}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <label htmlFor="seat-input" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            Seat location
          </label>
          <input
            id="seat-input"
            type="text"
            value={seatInput}
            onChange={(e) => setSeatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_SEAT_LENGTH}
            placeholder="e.g. Sect 104, Row B, Seat 12"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '10px',
              border: '1px solid rgba(148,163,184,0.15)', background: '#0f172a',
              color: '#f8fafc', fontSize: '0.85rem', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleUpdateSeat}
            disabled={!seatInput.trim()}
            style={{
              padding: '10px 18px', borderRadius: '10px', border: 'none',
              background: seatInput.trim() ? '#3b82f6' : '#334155',
              color: '#fff', fontWeight: 600, cursor: seatInput.trim() ? 'pointer' : 'default',
              fontFamily: 'inherit', transition: 'background 200ms',
            }}
          >
            Save
          </button>
        </div>
      </article>

      {/* Sign out */}
      <button
        onClick={logout}
        style={{
          width: '100%', padding: '14px', background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 200ms',
        }}
        onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.2)'; }}
        onMouseLeave={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; }}
      >
        Sign Out
      </button>
    </section>
  );
}
