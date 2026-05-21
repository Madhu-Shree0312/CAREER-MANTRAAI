import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import API_BASE_URL from '../config/api';

const QUICK_PROMPTS = [
  "How do I switch to Web Development?",
  "What should my resume include for a fresher?",
  "How do I prepare for a technical interview?",
  "Which skills are most in-demand in 2025?",
];

const SYSTEM_PROMPT = `You are Career Mantra AI, an expert career coach and mentor. You provide personalized career guidance, resume feedback, interview preparation, career transition advice, and skill development recommendations. Be supportive, professional, insightful, and actionable in your responses. Use a warm, encouraging tone.`;

// Copy button with transient "copied" state
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title="Copy response"
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/80"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ChatInterface({ sessionId, onFirstMessage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [sessionId]);

  const sendMessage = useCallback(async (text) => {
    const content = (text ?? input).trim();
    if (!content || isStreaming) return;

    const userMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (messages.length === 0) onFirstMessage(sessionId, content);
    setInput('');
    setIsStreaming(true);

    // Placeholder for streaming AI message
    const aiIndex = updatedMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, systemPrompt: SYSTEM_PROMPT }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              setMessages(prev => {
                const next = [...prev];
                next[aiIndex] = { ...next[aiIndex], content: next[aiIndex].content + parsed.token };
                return next;
              });
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Stream error:', err);
      setMessages(prev => {
        const next = [...prev];
        next[aiIndex] = { role: 'assistant', content: "I'm having trouble connecting right now. Please make sure the backend is running and try again." };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, sessionId, onFirstMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-blue-900/50">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          /* ── Empty state with quick-start prompts ── */
          <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <img src="/logo.svg" alt="Career Mantra AI" className="w-20 h-20 rounded-2xl mb-4 shadow-lg mx-auto animate-float" />
              <h2 className="text-2xl font-bold text-white mb-1">Career Mantra AI</h2>
              <p className="text-white/60 text-sm">Ask me anything about your career journey</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="flex items-start gap-2 text-left px-4 py-3 bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/30 rounded-xl text-white/80 hover:text-white text-sm transition-all group"
                >
                  <Sparkles className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0 group-hover:text-blue-300" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Message bubbles ── */
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI avatar */}
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                    <img src="/logo.svg" alt="AI" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className={`group flex flex-col gap-1 max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md rounded-br-sm'
                        : 'bg-gray-800/80 border border-white/10 text-white/90 shadow-sm rounded-bl-sm'
                    }`}
                  >
                    {message.content}
                    {/* Blinking cursor while streaming this message */}
                    {message.role === 'assistant' && isStreaming && index === messages.length - 1 && (
                      <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>

                  {/* Copy button for AI messages */}
                  {message.role === 'assistant' && message.content && (
                    <CopyButton text={message.content} />
                  )}
                </div>

                {/* User avatar */}
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md text-white text-xs font-bold">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator before first token arrives */}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img src="/logo.svg" alt="AI" className="w-full h-full object-cover" />
                </div>
                <div className="bg-gray-800/80 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-white/20 bg-white/10 backdrop-blur-lg px-4 py-4 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your career..."
              className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-sm"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
            >
              {isStreaming
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;
