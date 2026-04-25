// Groq API client — initialized lazily on first call so Vite env vars are ready
let groqClient = null;

const getClient = async () => {
  if (groqClient) return groqClient;

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.error('[Groq] VITE_GROQ_API_KEY is not set in .env');
    return null;
  }

  try {
    const { default: Groq } = await import('groq-sdk');
    groqClient = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    console.log('[Groq] Client initialized successfully');
    return groqClient;
  } catch (err) {
    console.error('[Groq] Failed to initialize Groq SDK:', err);
    return null;
  }
};

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

// ─── Chat (multi-turn) ────────────────────────────────────────────────────────
export const getGroqChatResponse = async (message, history = []) => {
  try {
    const client = await getClient();

    if (!client) {
      console.warn('[Groq] No client — using offline fallback for chat');
      return getOfflineFallback(message);
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are Electra, a friendly and knowledgeable AI Election Assistant for India. ' +
          'Explain democratic processes, voting rights, and election facts clearly and impartially. ' +
          'Use Markdown formatting (bold, bullet lists, headers) to make your answers easy to read. ' +
          'Keep answers concise but thorough.',
      },
      // Convert history: role 'model' → 'assistant' for Groq
      ...history.map((m) => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: typeof m.parts === 'string' ? m.parts : m.content ?? '',
      })),
      { role: 'user', content: message },
    ];

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    });

    return completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
  } catch (err) {
    console.error('[Groq] Chat error:', err);
    return getOfflineFallback(message);
  }
};

// ─── Single prompt (used by Timeline / Map) ───────────────────────────────────
export const getGroqResponse = async (prompt) => {
  try {
    const client = await getClient();

    if (!client) {
      console.warn('[Groq] No client — returning unavailable message');
      return 'Information is currently unavailable.';
    }

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are an expert on Indian Elections and democracy.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content ?? 'Information unavailable.';
  } catch (err) {
    console.error('[Groq] Response error:', err);
    return 'Information unavailable.';
  }
};
