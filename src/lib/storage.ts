import type { Project, AppSettings } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

const DEFAULT_SETTINGS: AppSettings = {
  ai: {
    provider: '',
    apiKey: '',
    model: '',
    endpoint: '',
  },
  github: {
    username: '',
    token: '',
  },
};

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Project[];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Errore nel salvataggio dei progetti:', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ai: { ...DEFAULT_SETTINGS.ai, ...parsed.ai },
      github: { ...DEFAULT_SETTINGS.github, ...parsed.github },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Errore nel salvataggio delle impostazioni:', e);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
