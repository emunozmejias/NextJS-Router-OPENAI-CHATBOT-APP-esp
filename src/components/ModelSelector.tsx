'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Zap, Sparkles } from 'lucide-react';
import { ModelType, AVAILABLE_MODELS } from '@/lib/types';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  disabled?: boolean;
  className?: string;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
  className = '',
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedModelInfo = AVAILABLE_MODELS.find((m) => m.id === selectedModel);

  const getModelIcon = (modelId: ModelType) => {
    switch (modelId) {
      case 'gpt-4o':
        return <Sparkles className="w-4 h-4 text-violet-400" />;
      case 'gpt-3.5-turbo':
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'ring-2 ring-emerald-500/50 border-emerald-500/50' : ''}`}
      >
        {getModelIcon(selectedModel)}
        <span className="text-sm font-medium text-slate-200">
          {selectedModelInfo?.name || selectedModel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/20 overflow-hidden z-50">
          <div className="p-2">
            <p className="px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
              Select Model
            </p>
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  selectedModel === model.id
                    ? 'bg-emerald-600/20 text-emerald-100'
                    : 'hover:bg-slate-700/50 text-slate-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getModelIcon(model.id)}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {selectedModel === model.id && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {model.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

