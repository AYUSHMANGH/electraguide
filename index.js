import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// ── API: Chat proxy (keeps GROQ_API_KEY server-side) ─────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'AI service not configured (missing GROQ_API_KEY)' });

    const { default: Groq } = await import('groq-sdk');
    const groq = new Groq({ apiKey });

    const messages = [
      {
        role: 'system',
        content:
          'You are Electra, a friendly AI Election Assistant for India. ' +
          'Explain democratic processes, voting rights, and election facts clearly. ' +
          'Use Markdown formatting. Keep answers concise but thorough.',
      },
      ...history.map((m) => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts || m.content || '',
      })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    });

    res.json({ response: completion.choices[0]?.message?.content ?? "Sorry, I couldn't respond." });
  } catch (err) {
    console.error('[/api/chat]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── API: Single prompt proxy (Timeline / Map) ─────────────────────────────────
app.post('/api/prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'AI service not configured (missing GROQ_API_KEY)' });

    const { default: Groq } = await import('groq-sdk');
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are an expert on Indian Elections and democracy.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    res.json({ response: completion.choices[0]?.message?.content ?? 'Information unavailable.' });
  } catch (err) {
    console.error('[/api/prompt]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Static files (Vite build output) ─────────────────────────────────────────
app.use(express.static(join(__dirname, 'dist')));

app.get('/{*splat}', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ElectraGuide running on port ${PORT}`);
});
