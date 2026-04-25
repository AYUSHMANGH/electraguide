// ─── Offline fallback (only used when API is truly unavailable) ───────────────
const getOfflineFallback = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! I'm Electra, your AI Election Assistant 🗳️. What would you like to know about the Indian electoral process?";
  }
  if (msg.includes('register') || msg.includes('voter id')) {
    return "To register to vote in India, you need to be a citizen aged 18+. Apply online at **[voters.eci.gov.in](https://voters.eci.gov.in)** using Form 6 with proof of age and address.";
  }
  if (msg.includes('how') && msg.includes('work')) {
    return "Elections in India use a **First-Past-The-Post** system. The country is divided into constituencies; the candidate with the most votes in each wins a seat in the Lok Sabha or State Assembly.";
  }
  if (msg.includes('evm') || msg.includes('machine')) {
    return "An **EVM (Electronic Voting Machine)** records votes securely. Press the blue button next to your candidate's symbol. A VVPAT machine prints a slip so you can verify your vote.";
  }
  if (msg.includes('who') && msg.includes('vote')) {
    return "Every Indian citizen aged **18 or above** whose name appears on the electoral roll is eligible to vote.";
  }
  return "I'm having trouble connecting to my AI backend. Please try again in a moment, or explore the **Timeline** and **Quiz** pages!";
};

/**
 * AI Chat Response via Server Proxy
 * Calls /api/chat which uses the server-side GROQ_API_KEY
 */
export const getGroqChatResponse = async (message, history = []) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch AI response');
    }

    const data = await response.json();
    return data.response;
  } catch (err) {
    console.error('[Groq Proxy] Chat error:', err);
    return getOfflineFallback(message);
  }
};

/**
 * Single AI Prompt Response via Server Proxy
 * Calls /api/prompt which uses the server-side GROQ_API_KEY
 */
export const getGroqResponse = async (prompt) => {
  try {
    const response = await fetch('/api/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch AI response');
    }

    const data = await response.json();
    return data.response;
  } catch (err) {
    console.error('[Groq Proxy] Response error:', err);
    return 'Information is currently unavailable.';
  }
};
