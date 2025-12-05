'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from 'ai';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './LoadingIndicator';
import { MessageSquare } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  className?: string;
}

export function MessageList({
  messages,
  isLoading,
  className = '',
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto ${className}`}
    >
      <div className="divide-y divide-slate-800/50">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={
              isLoading &&
              message.role === 'assistant' &&
              index === messages.length - 1
            }
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="bg-slate-900/50">
            <TypingIndicator />
          </div>
        )}
      </div>
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center px-4 py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-6">
        <MessageSquare className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-100 mb-2">
        Start a Conversation
      </h3>
      <p className="text-slate-400 max-w-sm mx-auto">
        Send a message to begin chatting with the AI assistant. Ask questions,
        get help with coding, or just have a conversation.
      </p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {SUGGESTED_PROMPTS.map((prompt, index) => (
          <SuggestedPrompt key={index} text={prompt} />
        ))}
      </div>
    </div>
  );
}

const SUGGESTED_PROMPTS = [
  'Explain quantum computing in simple terms',
  'Help me write a Python function',
  'What are the best practices for React?',
  'Summarize the key points of machine learning',
];

function SuggestedPrompt({ text }: { text: string }) {
  return (
    <div className="p-3 text-sm text-left text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-default transition-colors">
      {text}
    </div>
  );
}

