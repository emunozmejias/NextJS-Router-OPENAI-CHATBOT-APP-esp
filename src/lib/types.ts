// Chat application types

export type ModelType = 'gpt-4o' | 'gpt-3.5-turbo';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: ModelType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedModel: ModelType;
  isLoading: boolean;
  error: string | null;
}

export interface ModelOption {
  id: ModelType;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Most capable model, best for complex tasks',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
  },
];

export const DEFAULT_MODEL: ModelType = 'gpt-4o';

export const LOCAL_STORAGE_KEYS = {
  SELECTED_MODEL: 'chatbot-selected-model',
  CHAT_HISTORY: 'chatbot-chat-history',
  ACTIVE_CONVERSATION: 'chatbot-active-conversation',
} as const;

