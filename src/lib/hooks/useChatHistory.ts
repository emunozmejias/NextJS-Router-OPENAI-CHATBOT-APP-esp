'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message } from 'ai';
import { LOCAL_STORAGE_KEYS, ModelType, DEFAULT_MODEL } from '@/lib/types';

interface ChatHistoryState {
  messages: Message[];
  model: ModelType;
}

export function useChatHistory() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelType>(DEFAULT_MODEL);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load chat history
      const savedHistory = window.localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY);
      if (savedHistory) {
        const parsed: ChatHistoryState = JSON.parse(savedHistory);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          setMessages(parsed.messages);
        }
      }

      // Load selected model
      const savedModel = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_MODEL);
      if (savedModel) {
        const model = JSON.parse(savedModel) as ModelType;
        if (model === 'gpt-4o' || model === 'gpt-3.5-turbo') {
          setSelectedModel(model);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }

    setIsLoaded(true);
  }, []);

  // Save messages to localStorage
  const saveMessages = useCallback((newMessages: Message[]) => {
    if (typeof window === 'undefined') return;

    try {
      const state: ChatHistoryState = {
        messages: newMessages,
        model: selectedModel,
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(state));
      setMessages(newMessages);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [selectedModel]);

  // Save model selection
  const saveModel = useCallback((model: ModelType) => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_MODEL, JSON.stringify(model));
      setSelectedModel(model);
    } catch (error) {
      console.error('Error saving model selection:', error);
    }
  }, []);

  // Clear chat history
  const clearHistory = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }, []);

  return {
    messages,
    selectedModel,
    isLoaded,
    saveMessages,
    saveModel,
    clearHistory,
    setMessages,
  };
}

