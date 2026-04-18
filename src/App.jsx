import React, { Suspense, useState, useCallback } from 'react';
import { SkeletonLoader } from './components/SkeletonLoader';
import './index.css';

const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const MapPage = React.lazy(() => import('./pages/MapPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

/**
 * Global ErrorBoundary — catches render failures across the entire tree.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: '32px', color: '#f8fafc', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8' }}>Please refresh the page to try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/** @type {Array<{id: string, label: string, icon: string}>} */
const NAV_ITEMS = [
  { id: 'map', label: 'Map', icon: '🗺️' },
  { id: 'chat', label: 'AI Guide', icon: '🤖' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

/**
 * Root application — handles tab-based navigation with lazy-loaded pages.
 * @returns {React.ReactElement}
 */
function App() {
  const [tab, setTab] = useState('chat');
  const onTabChange = useCallback((id) => setTab(id), []);

  return (
    <ErrorBoundary>
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100dvh',
        background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      }}>
        {/* Skip-link target */}
        <main id="main-content" style={{ flex: 1, overflow: 'hidden' }}>
          <Suspense fallback={<SkeletonLoader />}>
            {tab === 'chat' && <ChatPage />}
            {tab === 'map' && <MapPage />}
            {tab === 'profile' && <ProfilePage />}
          </Suspense>
        </main>

        <nav aria-label="Main navigation" style={{
          display: 'flex', padding: '8px 12px 12px', gap: '4px',
          background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        }}>
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              aria-current={tab === id ? 'page' : undefined}
              style={{
                flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '4px', border: 'none', borderRadius: '12px',
                background: tab === id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: tab === id ? '#3b82f6' : '#64748b',
                fontWeight: tab === id ? 700 : 500, fontSize: '0.75rem',
                cursor: 'pointer', transition: 'all 200ms ease',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '1.25rem' }} aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </div>
    </ErrorBoundary>
  );
}

export default App;
