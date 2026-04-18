import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../components/ChatMessage';
import { useWaitTimes } from '../hooks/useWaitTimes';
import { useAssistant } from '../hooks/useAssistant';
import { useCrowdReports } from '../hooks/useCrowdReports';
import { useAuth } from '../hooks/useAuth';
import { WaitTimeCard } from '../components/WaitTimeCard';

export default function ChatPage() {
  const { user } = useAuth();
  const { waitTimes, crowdDensity } = useWaitTimes();
  const { reports, addReport } = useCrowdReports();
  const seat = user?.seat || 'Unknown Location';
  
  const { messages, isTyping, sendMessage } = useAssistant(seat, waitTimes, crowdDensity, reports);
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputMsg.trim()) {
      sendMessage(inputMsg);
      setInputMsg('');
    }
  };

  const handleReport = (e) => {
    e.preventDefault();
    if (inputMsg.trim().startsWith('/report ')) {
      addReport(inputMsg.replace('/report ', ''));
      setInputMsg('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
      <header style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#f8fafc' }}>AI Guide</h2>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          NaviStadium Assistant | Seat: <strong>{seat}</strong>
        </p>
      </header>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px' }}>
        {waitTimes.map(w => <WaitTimeCard key={w.zone} zone={w.zone} time={w.time} />)}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#0f172a', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
            Hi {user?.name}! Ask me anything about wait times, restrooms, or your fastest route.
          </p>
        )}
        {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
        {isTyping && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Navi is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={inputMsg.startsWith('/report ') ? handleReport : handleSend} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputMsg}
          onChange={e => setInputMsg(e.target.value)}
          placeholder="Ask a question or type /report..."
          aria-label="Ask NaviStadium"
          aria-required="true"
          style={{ flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }}
        />
        <button type="submit" style={{ padding: '0 24px', borderRadius: '24px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 'bold' }}>
          Send
        </button>
      </form>
    </div>
  );
}
