'use client';

import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Square, Loader2 } from 'lucide-react';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function InputField({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading,
  disabled = false,
  placeholder = 'Type your message...',
  className = '',
}: InputFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !isLoading && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className={`border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
            
            {/* Character count indicator for long messages */}
            {value.length > 500 && (
              <span className="absolute right-3 bottom-1.5 text-xs text-slate-500">
                {value.length}
              </span>
            )}
          </div>

          {/* Submit/Stop Button */}
          {isLoading && onStop ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
              aria-label="Stop generating"
            >
              <Square className="w-5 h-5" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || isLoading || disabled}
              className="flex-shrink-0 p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Helper text */}
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-xs text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd> to send,{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Shift + Enter</kbd> for new line
          </p>
          {isLoading && (
            <p className="text-xs text-emerald-400 animate-pulse">
              AI is responding...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

