import { useState, useEffect, useCallback } from 'react';
import type { Project, AppSettings } from '@/types';
import { loadProjects, saveProjects, loadSettings, saveSettings, generateId } from '@/lib/storage';
import { showToast } from '@/lib/toast';

export function useProjectStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const createProject = useCallback(
    (data: { name: string; description: string; type: Project['type'] }): Project => {
      const now = new Date().toISOString();
      const project: Project = {
        id: generateId(),
        name: data.name,
        description: data.description,
        type: data.type,
        status: 'draft',
        instructions: [],
        previewHtml: null,
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [project, ...prev]);
      showToast('success', `Progetto "${data.name}" creato con successo`);
      return project;
    },
    [],
  );

  const updateProject = useCallback((id: string, updates: Partial<Project>): void => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
      ),
    );
  }, []);

  const addInstruction = useCallback(
    (projectId: string, text: string): void => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            instructions: [
              ...p.instructions,
              { id: generateId(), text, timestamp: new Date().toISOString() },
            ],
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const deleteProject = useCallback((id: string): void => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast('info', 'Progetto eliminato');
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>): void => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateAISettings = useCallback(
    (updates: Partial<AppSettings['ai']>): void => {
      setSettings((prev) => ({
        ...prev,
        ai: { ...prev.ai, ...updates },
      }));
    },
    [],
  );

  const updateGitHubSettings = useCallback(
    (updates: Partial<AppSettings['github']>): void => {
      setSettings((prev) => ({
        ...prev,
        github: { ...prev.github, ...updates },
      }));
    },
    [],
  );

  const exportProjectCode = useCallback(
    (project: Project): void => {
      const code = generateProjectCode(project);
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', 'Codice esportato come file di testo');
    },
    [],
  );

  return {
    projects,
    settings,
    createProject,
    updateProject,
    addInstruction,
    deleteProject,
    updateSettings,
    updateAISettings,
    updateGitHubSettings,
    exportProjectCode,
  };
}

export type ProjectStore = ReturnType<typeof useProjectStore>;

function generateProjectCode(project: Project): string {
  const lines: string[] = [];
  lines.push(`# Progetto: ${project.name}`);
  lines.push(`# Tipo: ${project.type}`);
  lines.push(`# Creato: ${project.createdAt}`);
  lines.push(`# Ultima modifica: ${project.updatedAt}`);
  lines.push('');
  lines.push('## Descrizione');
  lines.push(project.description);
  lines.push('');
  lines.push('## Istruzioni fornite');
  if (project.instructions.length === 0) {
    lines.push('(Nessuna istruzione fornita)');
  } else {
    project.instructions.forEach((inst, i) => {
      lines.push(`${i + 1}. [${inst.timestamp}] ${inst.text}`);
    });
  }
  lines.push('');
  lines.push('## Anteprima HTML');
  lines.push(project.previewHtml ?? '(Nessuna anteprima disponibile)');
  return lines.join('\n');
}
