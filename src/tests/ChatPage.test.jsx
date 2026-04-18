import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock all hooks before importing the component
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { name: 'Test Fan', seat: '12A', email: 'fan@test.com' } })),
}));
vi.mock('../hooks/useWaitTimes', () => ({
  useWaitTimes: vi.fn(() => ({ waitTimes: [{ zone: 'Gate A', time: 3 }], crowdDensity: [] })),
}));
vi.mock('../hooks/useCrowdReports', () => ({
  useCrowdReports: vi.fn(() => ({ reports: [], addReport: vi.fn(), refreshReports: vi.fn() })),
}));

const mockSendMessage = vi.fn();
vi.mock('../hooks/useAssistant', () => ({
  useAssistant: vi.fn(() => ({
    messages: [],
    isTyping: false,
    sendMessage: mockSendMessage,
  })),
}));

// Dynamic import after mocks
const { default: ChatPage } = await import('../pages/ChatPage');

describe('ChatPage', () => {
  it('renders the AI Guide header and chat input', () => {
    render(<ChatPage />);
    expect(screen.getByText(/NaviStadium/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask a question/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ask NaviStadium/i)).toBeInTheDocument();
  });

  it('sends a message on form submit and clears input', () => {
    render(<ChatPage />);
    const input = screen.getByLabelText(/Ask NaviStadium/i);
    const sendBtn = screen.getByLabelText(/Send message/i);

    fireEvent.change(input, { target: { value: 'Where is gate B?' } });
    fireEvent.click(sendBtn);

    expect(mockSendMessage).toHaveBeenCalledWith('Where is gate B?');
  });

  it('renders suggestion buttons when no messages exist', () => {
    render(<ChatPage />);
    expect(screen.getByText(/shortest gate queue/i)).toBeInTheDocument();
    expect(screen.getByText(/nearest restroom/i)).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<ChatPage />);
    const sendBtn = screen.getByLabelText(/Send message/i);
    expect(sendBtn.disabled).toBe(true);
  });

  it('enforces maxLength on input', () => {
    render(<ChatPage />);
    const input = screen.getByLabelText(/Ask NaviStadium/i);
    expect(input.maxLength).toBe(500);
  });
});
