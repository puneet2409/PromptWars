import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage } from '../components/ChatMessage';
import { useWaitTimes } from '../hooks/useWaitTimes';
import { useAssistant } from '../hooks/useAssistant';
import { useCrowdReports } from '../hooks/useCrowdReports';
import { useAuth } from '../hooks/useAuth';
import { WaitTimeCard } from '../components/WaitTimeCard';

const MAX_INPUT_LENGTH = 500;

/** Quick-action suggestions shown before user sends first message. */
const SUGGESTIONS = [
  'What is the shortest gate queue?',
  'Where is the nearest restroom?',
  'Best concession stand right now?',
];

/**
 * ChatPage — primary AI assistant interface. Sends every user query
 * to Gemini with live venue context injected into the system prompt.
 * @returns {React.ReactElement}
 */
export default function ChatPage() {
  const { user } = useAuth();
  const { waitTimes, crowdDensity } = useWaitTimes();
  const { reports, addReport } = useCrowdReports();
  const seat = user?.seat || 'Unknown Location';

  const { messages, isTyping, sendMessage } = useAssistant(seat, waitTimes, crowdDensity, reports);
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = useCallback((e) => {
    e.preventDefault();
    const trimmed = inputMsg.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('/report ')) {
      addReport(trimmed.slice(8));
    } else {
      sendMessage(trimmed);
    }
    setInputMsg('');
  }, [inputMsg, sendMessage, addReport]);

  const handleSuggestion = useCallback((text) => {
    sendMessage(text);
  }, [sendMessage]);

  const topWaits = useMemo(() => waitTimes.slice(0, 4), [waitTimes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <header style={{ padding: '16px 16px 0', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc', fontWeight: 700 }}>
          NaviStadium <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 500 }}>AI</span>
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
          Seat: <strong style={{ color: '#3b82f6' }}>{seat}</strong>
        </p>
      </header>

      {/* Live wait-time ribbon */}
      <section aria-label="Live wait times" style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '12px 16px', flexShrink: 0 }}>
        {topWaits.map((w) => (
          <WaitTimeCard key={w.zone} zone={w.zone} time={w.time} />
        ))}
      </section>

      {/* Messages */}
      <section aria-label="Conversation" style={{
        flex: 1, overflowY: 'auto', padding: '0 16px 16px',
        display: 'flex', flexDirection: 'column',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '32px', animation: 'fadeInUp 0.4s ease' }}>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>
              Hi{user?.name ? ` ${user.name}` : ''}! Ask anything about the stadium.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  style={{
                    padding: '8px 14px', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.3)',
                    background: 'rgba(59,130,246,0.08)', color: '#93c5fd', fontSize: '0.82rem',
                    cursor: 'pointer', transition: 'all 200ms', fontFamily: 'inherit',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}

        {isTyping && (
          <div aria-live="polite" style={{ display: 'flex', gap: '6px', padding: '12px' }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: '#3b82f6',
                animation: `typingDot 1.4s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </section>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        display: 'flex', gap: '8px', padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(148,163,184,0.1)',
      }}>
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          maxLength={MAX_INPUT_LENGTH}
          placeholder="Ask a question or /report a crowd..."
          aria-label="Ask NaviStadium"
          aria-required="true"
          autoComplete="off"
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '24px',
            border: '1px solid rgba(148,163,184,0.15)', background: '#1e293b',
            color: '#f8fafc', fontSize: '0.9rem', fontFamily: 'inherit',
            outline: 'none', transition: 'border-color 200ms',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.15)'; }}
        />
        <button
          type="submit"
          disabled={!inputMsg.trim()}
          aria-label="Send message"
          style={{
            padding: '0 20px', borderRadius: '24px', border: 'none', fontFamily: 'inherit',
            background: inputMsg.trim() ? '#3b82f6' : '#334155',
            color: '#fff', fontWeight: 600, cursor: inputMsg.trim() ? 'pointer' : 'default',
            transition: 'background 200ms',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
