// Groq API client — used directly ONLY in local development
let groqClient = null;

const getClient = async () => {
  if (groqClient) return groqClient;
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const { default: Groq } = await import('groq-sdk');
    groqClient = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    return groqClient;
  } catch (err) {
    return null;
  }
};

const getOfflineFallback = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi')) return "Hello! I'm Electra 🗳️. How can I help you today?";
  return "I'm having trouble connecting to my AI backend. Please check your internet or try again later!";
};

/**
 * AI Chat Response
 * Automatically chooses between direct SDK (local) or Server Proxy (production)
 */
export const getGroqChatResponse = async (message, history = []) => {
  // 1. Try direct SDK first (for local npm run dev)
  if (import.meta.env.DEV) {
    try {
      const client = await getClient();
      if (client) {
        const messages = [
          { role: 'system', content: 'You are Electra, an AI Election Assistant for India.' },
          ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.parts || m.content || '' })),
          { role: 'user', content: message }
        ];
        const completion = await client.chat.completions.create({ model: 'llama-3.1-8b-instant', messages });
        return completion.choices[0]?.message?.content;
      }
    } catch (e) { console.warn("Local Groq failed, trying proxy..."); }
  }

  // 2. Fallback to Proxy (for Cloud Run)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const data = await response.json();
    return data.response;
  } catch (err) {
    return getOfflineFallback(message);
  }
};

/**
 * Single AI Prompt
 */
export const getGroqResponse = async (prompt) => {
  if (import.meta.env.DEV) {
    try {
      const client = await getClient();
      if (client) {
        const completion = await client.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }]
        });
        return completion.choices[0]?.message?.content;
      }
    } catch (e) {}
  }

  try {
    const response = await fetch('/api/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    return data.response;
  } catch (err) {
    return 'Information unavailable.';
  }
};
