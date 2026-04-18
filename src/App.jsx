import React, { Suspense, useState } from 'react';
import { SkeletonLoader } from './components/SkeletonLoader';

const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const MapPage = React.lazy(() => import('./pages/MapPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'white', padding: '20px' }}>Something went critically wrong in the UI.</div>;
    }
    return this.props.children;
  }
}

function App() {
  const [tab, setTab] = useState('chat');

  const NavButton = ({ id, label }) => (
    <button 
      onClick={() => setTab(id)}
      style={{
        flex: 1, padding: '12px', background: tab === id ? '#3b82f6' : 'transparent',
        color: tab === id ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
      }}
    >
      {label}
    </button>
  );

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#020617' }}>
        <main style={{ flex: 1, overflow: 'hidden' }}>
          <Suspense fallback={<SkeletonLoader />}>
            {tab === 'chat' && <ChatPage />}
            {tab === 'map' && <MapPage />}
            {tab === 'profile' && <ProfilePage />}
          </Suspense>
        </main>
        
        <nav style={{ display: 'flex', padding: '12px', background: '#0f172a', borderTop: '1px solid #1e293b' }}>
          <NavButton id="map" label="Map" />
          <NavButton id="chat" label="AI Guide" />
          <NavButton id="profile" label="Profile" />
        </nav>
      </div>
    </ErrorBoundary>
  );
}

export default App;
