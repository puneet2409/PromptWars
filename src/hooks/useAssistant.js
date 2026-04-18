import { useState, useCallback } from 'react';
import { fetchAssistantResponse } from '../services/gemini';
import { buildSystemPrompt } from '../utils/buildSystemPrompt';

export const useAssistant = (seat, waitTimes, crowdDensity, reports) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Append user message immediately
    const newMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    // Build the dynamic prompt with fresh data
    const systemPrompt = buildSystemPrompt(seat, waitTimes, crowdDensity, reports);

    // Fetch response via Gemini logic
    const replyText = await fetchAssistantResponse(systemPrompt, messages, text);
    
    setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
    setIsTyping(false);
  }, [seat, waitTimes, crowdDensity, reports, messages]);

  return { messages, isTyping, sendMessage };
};
