import React from 'react';

export const ChatMessage = ({ role, content }) => {
  const isAssistant = role === 'assistant';
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isAssistant ? 'flex-start' : 'flex-end',
        margin: '12px 0'
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: '16px',
          borderBottomLeftRadius: isAssistant ? '4px' : '16px',
          borderBottomRightRadius: isAssistant ? '16px' : '4px',
          background: isAssistant ? '#1e293b' : '#3b82f6',
          color: '#f8fafc',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        role={isAssistant ? "status" : "none"}
      >
        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>
          {content}
        </p>
      </div>
    </div>
  );
};
