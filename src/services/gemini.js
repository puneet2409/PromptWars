import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'MOCK_KEY';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Sends a message to the Gemini API
 * @param {string} prompt Complete system prompt with context
 * @param {Array} history Conversation history
 * @param {string} userMessage The current query
 * @returns {Promise<string>} Response text
 */
export const fetchAssistantResponse = async (prompt, history, userMessage) => {
  if (apiKey === 'MOCK_KEY') {
    return new Promise((resolve) => 
      setTimeout(() => resolve("Simulated AI response: Please set VITE_GEMINI_API_KEY in .env to use real Gemini model."), 1000)
    );
  }

  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: "SYSTEM PROMPT: " + prompt }] },
        { role: 'model', parts: [{ text: "Understood." }] },
        ...formattedHistory
      ],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
      }
    });

    const result = await chat.sendMessage([{ text: userMessage }]);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my neural net. Please try again.";
  }
};
