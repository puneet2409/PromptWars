import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssistant } from '../hooks/useAssistant';

vi.mock('../services/gemini', () => ({
  fetchAssistantResponse: vi.fn().mockResolvedValue('Mocked AI Reply')
}));

describe('useAssistant', () => {
  it('appends messages and hits mock API correctly', async () => {
    const { result } = renderHook(() => useAssistant('12A', [], [], []));
    
    await act(async () => {
      await result.current.sendMessage('Is there a bathroom nearby?');
    });

    // Check message state
    expect(result.current.messages[0]).toEqual({ role: 'user', content: 'Is there a bathroom nearby?' });
    expect(result.current.messages[1]).toEqual({ role: 'assistant', content: 'Mocked AI Reply' });
  });
});
