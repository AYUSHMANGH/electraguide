import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Send, Bot, User, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import DOMPurify from 'dompurify';
import { getGroqChatResponse } from '../lib/groq';
import ReactMarkdown from 'react-markdown';

const Assistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: "Hello! I'm Electra, your AI Election Assistant. I can explain the election process, help you understand voter registration, or answer any questions you have about democracy. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', parts: userMessage }]);
    setIsLoading(true);

    try {
      // Gemini expects history to start with a user message and alternate.
      // We skip the first message if it's our hardcoded greeting.
      const historyToPass = messages.length > 0 && messages[0].role === 'model' 
        ? messages.slice(1) 
        : messages;

      const chatHistory = historyToPass.map(msg => ({
        role: msg.role,
        content: msg.parts
      }));

      const response = await getGroqChatResponse(userMessage, chatHistory);
      
      setMessages(prev => [...prev, { role: 'model', parts: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: "I'm sorry, I encountered an error. Please try asking your question again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionChips = [
    "How do elections work in India?",
    "What is voter registration?",
    "Teach me elections like I'm a beginner",
    "What happens on voting day?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 text-slate-800">
          <BrainCircuit className="text-primary-600" size={32} />
          AI Election Assistant
        </h1>
        <p className="text-slate-500 mt-2">Ask anything about the electoral process.</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  message.role === 'user' 
                    ? 'bg-secondary-100 text-secondary-600' 
                    : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                }`}>
                  {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-secondary-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none prose prose-sm sm:prose-base prose-p:leading-relaxed prose-a:text-primary-600'
                }`}>
                  {message.role === 'user' ? (
                    message.parts
                  ) : (
                    <ReactMarkdown>{DOMPurify.sanitize(message.parts)}</ReactMarkdown>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shadow-md">
                  <Bot size={20} />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-primary-500" />
                  <span className="text-slate-500 text-sm font-medium">Electra is thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(chip)}
                  className="text-xs sm:text-sm px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-primary-500" />
                  {chip}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              aria-label="Ask a question about elections"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0"
            >
              <Send size={18} className={input.trim() && !isLoading ? 'translate-x-0.5' : ''} />
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-3">
            AI can make mistakes. Consider verifying important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
