export type ProjectType =
  | 'website'
  | 'web-app'
  | 'landing-page'
  | 'ecommerce'
  | 'dashboard'
  | 'portfolio'
  | 'blog'
  | 'other';

export type ProjectStatus = 'draft' | 'generating' | 'generated' | 'error';

export interface Instruction {
  id: string;
  text: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  instructions: Instruction[];
  previewHtml: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AIProvider = 'openai' | 'anthropic' | 'groq' | 'custom' | '';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  endpoint: string;
}

export interface GitHubSettings {
  username: string;
  token: string;
}

export interface AppSettings {
  ai: AISettings;
  github: GitHubSettings;
}

export type ViewType = 'dashboard' | 'editor' | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
