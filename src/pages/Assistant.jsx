import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import DOMPurify from 'dompurify';
import { getGroqChatResponse } from '../lib/groq';
import ReactMarkdown from 'react-markdown';

/** Initial greeting from the AI assistant */
const INITIAL_MESSAGE = {
  role: 'model',
  parts: "Hello! I'm **Electra**, your AI Election Assistant 🗳️. I can explain the election process, help you understand voter registration, or answer any questions you have about democracy in India. How can I help you today?",
};

/** Quick-start suggestion chips shown before the first user message */
const SUGGESTION_CHIPS = [
  'How do elections work in India?',
  'What is voter registration?',
  'Teach me elections like I\'m a beginner',
  'What happens on voting day?',
];

/**
 * AI chat assistant page.
 * Uses Groq (llama-3.1-8b-instant) for fast, high-quality responses.
 * Falls back to curated offline answers when the API is unavailable.
 */
const Assistant = () => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  /** Scrolls the message list to the bottom smoothly */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  /**
   * Submits the user message to the AI and appends the response.
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', parts: userMessage }]);
    setIsLoading(true);

    try {
      // Build history for Groq — skip the initial model greeting (index 0)
      const history = messages
        .slice(messages[0].role === 'model' ? 1 : 0)
        .map((m) => ({ role: m.role, parts: m.parts }));

      const response = await getGroqChatResponse(userMessage, history);
      setMessages((prev) => [...prev, { role: 'model', parts: response }]);
    } catch (err) {
      console.error('[Assistant] Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: "I'm sorry, I encountered an error. Please try asking again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  /** Fills the input with a suggestion chip */
  const handleChipClick = useCallback((chip) => {
    setInput(chip);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 text-slate-800">
          <BrainCircuit className="text-primary-600" size={32} aria-hidden="true" />
          AI Election Assistant
        </h1>
        <p className="text-slate-500 mt-2">Ask anything about the electoral process — powered by Groq AI.</p>
      </header>

      {/* Chat container */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">

        {/* Message list — aria-live so screen readers announce new messages */}
        <div
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  aria-hidden="true"
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    message.role === 'user'
                      ? 'bg-secondary-100 text-secondary-600'
                      : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                  }`}
                >
                  {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-secondary-600 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none prose prose-sm sm:prose-base prose-p:leading-relaxed prose-a:text-primary-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    message.parts
                  ) : (
                    <ReactMarkdown>{DOMPurify.sanitize(message.parts)}</ReactMarkdown>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Thinking indicator */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
                aria-label="Electra is thinking"
              >
                <div aria-hidden="true" className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shadow-md">
                  <Bot size={20} />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-primary-500" aria-hidden="true" />
                  <span className="text-slate-500 text-sm font-medium">Electra is thinking…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Input area */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {/* Suggestion chips — only shown before any user message */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Suggested questions">
              {SUGGESTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="text-xs sm:text-sm px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <Sparkles size={14} className="text-primary-500" aria-hidden="true" />
                  {chip}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3" role="search" aria-label="Chat input">
            <label htmlFor="chat-input" className="sr-only">Ask a question about elections</label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here…"
              aria-label="Ask a question about elections"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-3">
            AI can make mistakes. Verify important information from official sources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(Assistant);
