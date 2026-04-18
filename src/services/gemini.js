import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Sends a message to the Gemini API with full conversation context.
 * Falls back to simulated response when no key is configured.
 * @param {string} prompt - Dynamic system prompt with live venue data
 * @param {Array<{role: string, content: string}>} history - Conversation history
 * @param {string} userMessage - The fan's current question
 * @returns {Promise<string>} AI response text
 */
export const fetchAssistantResponse = async (prompt, history, userMessage) => {
  if (!apiKey) {
    return new Promise((resolve) =>
      setTimeout(() => resolve('Please set VITE_GEMINI_API_KEY in your .env file to enable AI responses.'), 800)
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: prompt 
    });

    const formattedHistory = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return text || 'I could not generate a response. Please try again.';
  } catch (error) {
    console.error('Gemini API Error:', error?.message || error);

    if (error?.message?.includes('API_KEY_INVALID')) {
      return 'Your Gemini API key seems invalid. Please check your .env file.';
    }
    if (error?.message?.includes('quota')) {
      return 'API quota exceeded. Please wait a moment and try again.';
    }

    return `AI error: ${error?.message || 'Unknown error'}. Please try again.`;
  }
};
