'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatResponse = (response) => {
    return response.replace(/\n/g, '\n\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://gp-llm.onrender.com/api/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: formatResponse(data.response)
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] text-white overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/5 via-transparent to-gray-900/5 pointer-events-none" />

      {/* Main Container */}
      <div className="relative h-full max-w-4xl mx-auto px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="bg-black/40 rounded-t-2xl p-6 backdrop-blur-xl border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white mt-10">
                AI Career Coach
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Your guide to tech career growth
              </p>
            </div>
            <button
              onClick={() => {
                setMessages([]);
                localStorage.removeItem('chatHistory');
              }}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-black/20 backdrop-blur-xl border-x border-white/5 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-white/10 text-white ml-4'
                      : 'bg-black/40 text-white mr-4'
                  }`}
                >
                  <ReactMarkdown 
                    className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-li:my-1"
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-black/40 p-4 rounded-2xl">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <form 
          onSubmit={handleSubmit}
          className="bg-black/40 rounded-b-2xl backdrop-blur-xl border border-white/5 p-4 flex gap-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tech careers, interview prep, or company insights..."
            className="flex-1 bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/5 placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-white/10 hover:bg-white/20 text-white px-6 rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;