import React, { Suspense, useState, useCallback } from 'react';
import { SkeletonLoader } from './components/SkeletonLoader';
import OnboardingPage from './pages/OnboardingPage';
import { useAuth } from './hooks/useAuth';
import './index.css';

const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const MapPage = React.lazy(() => import('./pages/MapPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SeatingPage = React.lazy(() => import('./pages/SeatingPage'));

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: 20, color: '#ef4444' }}>
          <h2>Application Error</h2>
          <p>Please refresh the page to try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const NavButton = React.memo(({ id, icon, label, currentTab, setTab }) => {
  const isCurrent = currentTab === id;
  return (
    <button
      onClick={() => setTab(id)}
      aria-current={isCurrent ? 'page' : undefined}
      style={{
        flex: 1, padding: '12px', background: 'none', border: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        color: isCurrent ? '#3b82f6' : '#64748b', cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span style={{ fontSize: '1.4rem', marginBottom: '4px' }} aria-hidden="true">{icon}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{label}</span>
      {isCurrent && (
        <span style={{
          position: 'absolute', bottom: 0, width: '32px', height: '3px',
          background: '#3b82f6', borderRadius: '3px 3px 0 0'
        }} />
      )}
    </button>
  );
});

export default function App() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('map');

  const handleSetTab = useCallback((tab) => {
    setCurrentTab(tab);
  }, []);

  // Enforce Onboarding Flow
  if (!user || !user.seat) {
    return <OnboardingPage />;
  }

  return (
    <AppErrorBoundary>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#020617' }}>
        
        {/* Main Content Area */}
        <main id="main-content" style={{ flex: 1, overflow: 'hidden' }}>
          <Suspense fallback={<SkeletonLoader />}>
            {currentTab === 'map' && <MapPage />}
            {currentTab === 'seating' && <SeatingPage />}
            {currentTab === 'chat' && <ChatPage />}
            {currentTab === 'profile' && <ProfilePage />}
          </Suspense>
        </main>

        {/* Bottom Navigation */}
        <nav
          aria-label="Main navigation"
          style={{
            display: 'flex', background: '#0f172a',
            borderTop: '1px solid #1e293b', position: 'relative',
          }}
        >
          <NavButton id="map" icon="🗺️" label="Map" currentTab={currentTab} setTab={handleSetTab} />
          <NavButton id="seating" icon="🏛️" label="Seats" currentTab={currentTab} setTab={handleSetTab} />
          <NavButton id="chat" icon="🤖" label="AI Guide" currentTab={currentTab} setTab={handleSetTab} />
          <NavButton id="profile" icon="👤" label="Settings" currentTab={currentTab} setTab={handleSetTab} />
        </nav>
      </div>
    </AppErrorBoundary>
  );
}
