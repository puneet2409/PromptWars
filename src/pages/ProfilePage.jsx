import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user, login, logout, updateSeat } = useAuth();
  const [seatInput, setSeatInput] = useState('');

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px' }}>
        <h2 style={{ color: '#fff', marginBottom: '16px' }}>Welcome to NaviStadium</h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '32px' }}>
          Sign in to access real-time stadium navigation, personalized routes, and the AI concierge.
        </p>
        <button 
          onClick={() => login({ credential: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvbiBEb2UiLCJlbWFpbCI6ImpvbkBleGFtcGxlLmNvbSJ9' })}
          style={{ padding: '12px 24px', background: '#fff', color: '#0f172a', fontWeight: 'bold', borderRadius: '8px', border: 'none' }}
        >
          Sign in with Mock Google Account
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#f8fafc', marginBottom: '24px' }}>Profile Context</h2>
      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>{user.name}</h3>
        <p style={{ margin: 0, color: '#94a3b8' }}>{user.email}</p>
      </div>

      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Seat Location</h3>
        <p style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '16px' }}>Current: {user.seat || 'Not set'}</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={seatInput}
            onChange={e => setSeatInput(e.target.value)}
            placeholder="e.g. Sect 104, Row B, Seat 12"
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
          />
          <button 
            onClick={() => { updateSeat(seatInput); setSeatInput(''); }}
            style={{ padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px' }}
          >
            Update
          </button>
        </div>
      </div>

      <button onClick={logout} style={{ width: '100%', padding: '12px', background: '#ef4444', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px' }}>
        Sign Out
      </button>
    </div>
  );
}
