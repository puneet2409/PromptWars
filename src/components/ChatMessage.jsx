import React from 'react';

/**
 * ChatMessage — renders a single conversation bubble.
 * @param {{ role: 'user'|'assistant', content: string }} props
 * @returns {React.ReactElement}
 */
export const ChatMessage = ({ role, content }) => {
  const isAssistant = role === 'assistant';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isAssistant ? 'flex-start' : 'flex-end',
        margin: '6px 0',
        animation: 'fadeInUp 0.25s ease',
      }}
    >
      {isAssistant && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#1e293b',
          border: '1px solid rgba(59,130,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', marginRight: '8px', flexShrink: 0, marginTop: '4px',
        }} aria-hidden="true">
          🤖
        </div>
      )}
      <div
        style={{
          maxWidth: '78%',
          padding: '10px 14px',
          borderRadius: '16px',
          borderBottomLeftRadius: isAssistant ? '4px' : '16px',
          borderBottomRightRadius: isAssistant ? '16px' : '4px',
          background: isAssistant
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: '#f8fafc',
          border: isAssistant ? '1px solid rgba(148,163,184,0.1)' : 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
        role={isAssistant ? 'status' : undefined}
      >
        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
          {content}
        </p>
      </div>
    </div>
  );
};
