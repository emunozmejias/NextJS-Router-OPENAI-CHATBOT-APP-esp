'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useChat } from 'ai/react';
import { Trash2, MessageSquarePlus, Settings } from 'lucide-react';
import { MessageList } from './MessageList';
import { InputField } from './InputField';
import { ModelSelector } from './ModelSelector';
import { ErrorDisplay } from './ErrorDisplay';
import { PageLoader } from './LoadingIndicator';
import { ModelType, DEFAULT_MODEL, LOCAL_STORAGE_KEYS } from '@/lib/types';

export function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState<ModelType>(DEFAULT_MODEL);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load saved model and messages from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedModel = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_MODEL);
        if (savedModel) {
          const model = JSON.parse(savedModel) as ModelType;
          if (model === 'gpt-4o' || model === 'gpt-3.5-turbo') {
            setSelectedModel(model);
          }
        }
      } catch (error) {
        console.error('Error loading saved model:', error);
      }
      setIsHydrated(true);
    }
  }, []);

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
    setMessages,
  } = useChat({
    api: '/api/openai/chat',
    body: {
      model: selectedModel,
    },
    initialMessages: [],
    onFinish: (message) => {
      // Save messages to localStorage after each response
      saveMessagesToStorage([...messages, message]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Load messages from localStorage after hydration
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY);
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          if (parsed.messages && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            setMessages(parsed.messages);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, [isHydrated, setMessages]);

  // Save messages to localStorage
  const saveMessagesToStorage = useCallback((messagesToSave: typeof messages) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.CHAT_HISTORY,
          JSON.stringify({ messages: messagesToSave, model: selectedModel })
        );
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }
  }, [selectedModel]);

  // Save messages when they change (for user messages)
  useEffect(() => {
    if (isHydrated && messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages, isHydrated, saveMessagesToStorage]);

  // Handle model change
  const handleModelChange = useCallback((model: ModelType) => {
    setSelectedModel(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_MODEL, JSON.stringify(model));
    }
  }, []);

  // Handle clear chat
  const handleClearChat = useCallback(() => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY);
    }
  }, [setMessages]);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    handleClearChat();
  }, [handleClearChat]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (messages.length > 0) {
      reload();
    }
  }, [messages.length, reload]);

  // Handle form submission
  const onSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (input.trim()) {
        handleSubmit(e);
      }
    },
    [input, handleSubmit]
  );

  // Show loading state during hydration
  if (!isHydrated) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-100">
                  AI Chat
                </h1>
                <p className="text-xs text-slate-400">
                  Powered by OpenAI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                disabled={isLoading}
              />

              {/* Settings Toggle (Mobile) */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="sm:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Action Buttons */}
              <div className={`flex items-center gap-2 ${showSettings ? 'flex' : 'hidden sm:flex'}`}>
                <button
                  onClick={handleNewChat}
                  disabled={isLoading || messages.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="New Chat"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span className="hidden lg:inline">New Chat</span>
                </button>

                <button
                  onClick={handleClearChat}
                  disabled={isLoading || messages.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden lg:inline">Clear</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4">
          <ErrorDisplay
            message={error.message || 'An error occurred. Please try again.'}
            onRetry={handleRetry}
            onDismiss={() => {}}
          />
        </div>
      )}

      {/* Message List */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        className="flex-1"
      />

      {/* Input Field */}
      <InputField
        value={input}
        onChange={setInput}
        onSubmit={onSubmit}
        onStop={stop}
        isLoading={isLoading}
        placeholder="Ask me anything..."
      />
    </div>
  );
}

