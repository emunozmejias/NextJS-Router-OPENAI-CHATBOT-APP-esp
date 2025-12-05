'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, User, Bot } from 'lucide-react';
import { Message } from 'ai';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <div
      className={`group flex gap-3 px-4 py-4 ${
        isUser
          ? 'bg-slate-800/30'
          : 'bg-slate-900/50'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-violet-500 to-purple-600'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {isStreaming && (
            <span className="text-xs text-emerald-400 animate-pulse">
              typing...
            </span>
          )}
        </div>

        <div className="prose prose-invert prose-sm max-w-none">
          {isUser ? (
            <p className="text-slate-200 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                pre: ({ children }) => (
                  <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto my-3">
                    {children}
                  </pre>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      className="px-1.5 py-0.5 bg-slate-800 rounded text-emerald-300 text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code className={`${className} text-sm`} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="text-slate-200 leading-relaxed my-2">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-2 text-slate-200">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-2 text-slate-200">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-slate-200">{children}</li>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-slate-100 mt-4 mb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-slate-100 mt-3 mb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold text-slate-100 mt-2 mb-1">
                    {children}
                  </h3>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-100">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-slate-300">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-emerald-500 pl-4 my-3 text-slate-300 italic">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={`flex-shrink-0 p-2 rounded-lg transition-all ${
          copied
            ? 'bg-emerald-600/20 text-emerald-400'
            : 'opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
        }`}
        aria-label={copied ? 'Copied!' : 'Copy message'}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

