'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({
  message,
  onRetry,
  onDismiss,
  className = '',
}: ErrorDisplayProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 bg-red-950/50 border border-red-800/50 rounded-xl ${className}`}
      role="alert"
    >
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-200 font-medium">Something went wrong</p>
        <p className="text-sm text-red-300/80 mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-sm font-medium text-red-200 bg-red-900/50 hover:bg-red-900/70 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 text-red-400 hover:text-red-300 transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-red-400 ${className}`}
      role="alert"
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

