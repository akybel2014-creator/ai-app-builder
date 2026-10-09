import { useState, useMemo } from 'react';
import type { ViewType, Project } from '@/types';
import { useProjectStore } from '@/lib/useProjectStore';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import Dashboard from '@/components/Dashboard';
import EditorView from '@/components/EditorView';
import SettingsView from '@/components/SettingsView';
import ToastContainer from '@/components/ToastContainer';

export default function App() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const store = useProjectStore();
  const { projects, settings } = store;

  const currentProject = useMemo(
    () => projects.find((p: Project) => p.id === currentProjectId) ?? null,
    [projects, currentProjectId],
  );

  const aiConfigured = Boolean(settings.ai.provider && settings.ai.apiKey);
  const githubConfigured = Boolean(settings.github.username && settings.github.token);

  const handleNavigate = (newView: ViewType) => {
    setView(newView);
    if (newView === 'dashboard') {
      setCurrentProjectId(null);
    }
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProjectId(project.id);
    setView('editor');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentProjectId(null);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar
        currentView={view}
        onNavigate={handleNavigate}
        aiConfigured={aiConfigured}
        githubConfigured={githubConfigured}
        projectCount={projects.length}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <MobileHeader
          currentView={view}
          currentProject={currentProject}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 overflow-hidden">
          {view === 'dashboard' && (
            <Dashboard
              projects={projects}
              aiConfigured={aiConfigured}
              onCreateProject={store.createProject}
              onOpenProject={handleOpenProject}
              onExportProject={store.exportProjectCode}
              onDeleteProject={(p) => store.deleteProject(p.id)}
              onGoToSettings={() => setView('settings')}
            />
          )}

          {view === 'editor' && currentProject && (
            <EditorView
              project={currentProject}
              aiConfigured={aiConfigured}
              githubConfigured={githubConfigured}
              onBack={handleBackToDashboard}
              onAddInstruction={store.addInstruction}
              onUpdateProject={store.updateProject}
              onExport={store.exportProjectCode}
              onGoToSettings={() => setView('settings')}
            />
          )}

          {view === 'editor' && !currentProject && (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center max-w-sm">
                <h2 className="text-lg font-semibold text-white mb-2">Nessun progetto selezionato</h2>
                <p className="text-sm text-surface-400 mb-5">
                  Apri un progetto dalla dashboard per iniziare a modificarlo.
                </p>
                <button
                  onClick={handleBackToDashboard}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 transition-colors"
                >
                  Torna alla dashboard
                </button>
              </div>
            </div>
          )}

          {view === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateAI={store.updateAISettings}
              onUpdateGitHub={store.updateGitHubSettings}
            />
          )}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
