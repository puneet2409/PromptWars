import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ChatPage from '../pages/ChatPage';
import { useAssistant } from '../hooks/useAssistant';

// Mock dependencies safely since components depend on them
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { name: 'Test', seat: '12A' } }))
}));
vi.mock('../hooks/useWaitTimes', () => ({
  useWaitTimes: vi.fn(() => ({ waitTimes: [], crowdDensity: [] }))
}));
vi.mock('../hooks/useCrowdReports', () => ({
  useCrowdReports: vi.fn(() => ({ reports: [], addReport: vi.fn() }))
}));
vi.mock('../hooks/useAssistant', () => ({
  useAssistant: vi.fn(() => ({ 
    messages: [], 
    isTyping: false, 
    sendMessage: vi.fn() 
  }))
}));

describe('ChatPage', () => {
  it('renders input, sends message on form submit', () => {
    const mockSendMessage = vi.fn();
    useAssistant.mockImplementation(() => ({
      messages: [],
      isTyping: false,
      sendMessage: mockSendMessage
    }));

    render(<ChatPage />);

    const input = screen.getByPlaceholderText(/Ask a question/i);
    const btn = screen.getByText(/Send/i);
    
    fireEvent.change(input, { target: { value: 'Where is gate B?' } });
    fireEvent.click(btn);

    expect(mockSendMessage).toHaveBeenCalledWith('Where is gate B?');
  });
});
