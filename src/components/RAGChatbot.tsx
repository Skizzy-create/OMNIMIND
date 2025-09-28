import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Database, AlertCircle, Loader2 } from 'lucide-react';
import { RAGService, RAGResponse } from '../services/ragService';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'error';
  content: string;
  timestamp: Date;
  sources?: Array<{
    content: string;
    score: number;
    metadata?: any;
  }>;
}

interface RAGChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  dataId: string;
  datasetName: string;
}

const RAGChatbot: React.FC<RAGChatbotProps> = ({ isOpen, onClose, dataId, datasetName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ragService] = useState(() => new RAGService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add welcome message when component mounts
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'bot',
        content: `Hello! I'm your AI assistant for ${datasetName}. I can help you explore this dataset using the Data ID: ${dataId}. What would you like to know?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, dataId, datasetName, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response: RAGResponse = await ragService.queryByDataId(dataId, userMessage.content, 5);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInMessage {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slideInMessage 0.3s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes typing {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .typing-indicator::after {
          content: '...';
          animation: typing 1.5s infinite;
        }
      `}</style>
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }}
      >
      <div 
        className="bg-white border max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl transform transition-all duration-300 ease-out"
        style={{
          background: '#ffffff',
          border: '2px solid #000000',
          maxWidth: '64rem',
          width: '100%',
          maxHeight: '95vh',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b bg-gradient-to-r"
          style={{
            padding: '1.5rem',
            borderBottom: '2px solid #000000',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }}
        >
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 border-2 flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                border: '2px solid #000000',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              <Bot className="w-6 h-6" style={{ color: '#ffffff' }} />
            </div>
            <div>
              <h2 
                className="text-2xl font-bold mb-1"
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#000000',
                  marginBottom: '0.25rem'
                }}
              >
                AI Assistant
              </h2>
              <p 
                className="text-sm font-medium"
                style={{
                  fontSize: '0.875rem',
                  color: '#374151',
                  fontWeight: '500'
                }}
              >
                {datasetName}
              </p>
              <p 
                className="text-xs text-gray-500 mt-1"
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.25rem'
                }}
              >
                Data ID: {dataId.substring(0, 24)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 border-2 hover:bg-gray-100 transition-colors duration-200"
            style={{
              background: '#ffffff',
              border: '2px solid #000000',
              padding: '0.75rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <X className="w-5 h-5" style={{ color: '#000000' }} />
          </button>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)'
          }}
        >
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div
                className={`max-w-[80%] p-5 border-2 shadow-lg ${
                  message.type === 'user' 
                    ? 'ml-12 rounded-t-2xl rounded-bl-2xl' 
                    : message.type === 'error'
                    ? 'mr-12 rounded-t-2xl rounded-br-2xl border-red-300'
                    : 'mr-12 rounded-t-2xl rounded-br-2xl'
                }`}
                style={{
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' 
                    : message.type === 'error'
                    ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  color: message.type === 'user' 
                    ? '#ffffff' 
                    : '#000000',
                  border: message.type === 'error'
                    ? '2px solid #fca5a5'
                    : message.type === 'user'
                    ? '2px solid #000000'
                    : '2px solid #e5e7eb',
                  padding: '1.25rem',
                  borderRadius: message.type === 'user' 
                    ? '16px 16px 4px 16px' 
                    : message.type === 'error'
                    ? '16px 16px 16px 4px'
                    : '16px 16px 16px 4px',
                  boxShadow: message.type === 'user'
                    ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-10 h-10 border-2 flex items-center justify-center flex-shrink-0 shadow-md"
                    style={{
                      background: message.type === 'user' 
                        ? 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)' 
                        : message.type === 'error'
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: message.type === 'user' 
                        ? '#000000' 
                        : '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '50%',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {message.type === 'user' ? (
                      <User className="w-5 h-5" style={{ color: '#000000' }} />
                    ) : message.type === 'error' ? (
                      <AlertCircle className="w-5 h-5" style={{ color: '#ffffff' }} />
                    ) : (
                      <Bot className="w-5 h-5" style={{ color: '#ffffff' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t-2" style={{ borderColor: '#e5e7eb' }}>
                        <p 
                          className="text-sm font-bold mb-3 flex items-center"
                          style={{ color: '#374151' }}
                        >
                          <Database className="w-4 h-4 mr-2" style={{ color: '#22c55e' }} />
                          Sources ({message.sources.length})
                        </p>
                        <div className="space-y-3">
                          {message.sources.slice(0, 3).map((source, index) => (
                            <div
                              key={index}
                              className="p-3 border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                              style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                                border: '2px solid #e5e7eb',
                                padding: '0.75rem',
                                borderRadius: '8px'
                              }}
                            >
                              <p className="mb-2 text-sm leading-relaxed">{source.content.substring(0, 150)}...</p>
                              <div className="flex items-center justify-between">
                                <p 
                                  className="text-xs font-medium px-2 py-1 rounded-full"
                                  style={{ 
                                    color: '#059669',
                                    background: '#d1fae5'
                                  }}
                                >
                                  Relevance: {(source.score * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p 
                      className="text-xs mt-2"
                      style={{ color: '#666666' }}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div 
                className="max-w-[80%] p-5 border-2 mr-12 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '2px solid #e5e7eb',
                  padding: '1.25rem',
                  borderRadius: '16px 16px 16px 4px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-10 h-10 border-2 flex items-center justify-center shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '50%',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Bot className="w-5 h-5" style={{ color: '#ffffff' }} />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#22c55e' }} />
                    <span className="text-sm font-medium typing-indicator" style={{ color: '#374151' }}>
                      AI is thinking
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div 
          className="p-6 border-t-2 bg-gradient-to-r"
          style={{
            padding: '1.5rem',
            borderTop: '2px solid #000000',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }}
        >
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about this dataset..."
                disabled={isLoading}
                className="w-full p-4 border-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20"
                style={{
                  background: '#ffffff',
                  border: '2px solid #e5e7eb',
                  padding: '1rem',
                  color: '#000000',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#22c55e';
                  e.target.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-4 border-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isLoading 
                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' 
                  : 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                color: '#ffffff',
                border: '2px solid #000000',
                padding: '1rem',
                fontWeight: '700',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#ffffff' }} />
              ) : (
                <Send className="w-6 h-6" style={{ color: '#ffffff' }} />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p 
              className="text-xs font-medium"
              style={{ color: '#6b7280' }}
            >
              Press Enter to send, Shift+Enter for new line
            </p>
            <div className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ background: '#22c55e' }}
              />
              <span 
                className="text-xs font-medium"
                style={{ color: '#059669' }}
              >
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default RAGChatbot;
