import { useState, useRef, useEffect } from 'react';
import type { Project } from '@/types';
import { PROJECT_TYPE_LABELS } from '@/lib/constants';
import {
  ArrowLeft,
  Send,
  Download,
  Github,
  Eye,
  Code2,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Zap,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface EditorViewProps {
  project: Project;
  aiConfigured: boolean;
  githubConfigured: boolean;
  onBack: () => void;
  onAddInstruction: (projectId: string, text: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onExport: (project: Project) => void;
  onGoToSettings: () => void;
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
type RightPanelTab = 'preview' | 'code';

const PLACEHOLDER_HTML = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Anteprima</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      color: #0f172a;
    }
    .container {
      text-align: center;
      padding: 3rem;
      max-width: 500px;
    }
    .icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: white;
    }
    h1 {
      font-size: 1.75rem;
      margin-bottom: 0.75rem;
    }
    p {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .badge {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      font-size: 0.875rem;
      color: #0891b2;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">&#9889;</div>
    <h1>Il tuo progetto &egrave; pronto</h1>
    <p>Configura un modello IA per generare l'anteprima della tua applicazione. Nel frattempo, puoi aggiungere istruzioni per definire i dettagli.</p>
    <span class="badge">In attesa di generazione</span>
  </div>
</body>
</html>`;

export default function EditorView({
  project,
  aiConfigured,
  githubConfigured,
  onBack,
  onAddInstruction,
  onUpdateProject,
  onExport,
  onGoToSettings,
}: EditorViewProps) {
  const [instruction, setInstruction] = useState('');
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [activeTab, setActiveTab] = useState<RightPanelTab>('preview');
  const [generating, setGenerating] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const instructionsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (instructionsEndRef.current) {
      instructionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [project.instructions.length]);

  const previewHtml = project.previewHtml ?? PLACEHOLDER_HTML;

  const handleSendInstruction = () => {
    const text = instruction.trim();
    if (!text) return;
    onAddInstruction(project.id, text);
    setInstruction('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendInstruction();
    }
  };

  const handleGenerate = async () => {
    if (!aiConfigured) {
      onGoToSettings();
      return;
    }

    setGenerating(true);
    onUpdateProject(project.id, { status: 'generating' });

    // Simulated generation — real AI integration requires backend proxy
    await new Promise((resolve) => setTimeout(resolve, 2500));

    onUpdateProject(project.id, {
      status: 'generated',
      previewHtml: PLACEHOLDER_HTML,
    });
    setGenerating(false);
    setIframeKey((k) => k + 1);
    setActiveTab('preview');
  };

  const deviceWidths: Record<PreviewDevice, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const deviceIcons: Record<PreviewDevice, typeof Monitor> = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row pb-16 lg:pb-0 overflow-hidden">
      {/* Left panel — Instructions & details */}
      <div className="w-full lg:w-[400px] lg:flex-shrink-0 glass-strong border-r border-surface-800/60 flex flex-col h-[50vh] lg:h-full">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-surface-800/60 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-surface-800/60 hover:bg-surface-700/60 text-surface-400 hover:text-surface-200 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Torna alla dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{project.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-1.5 py-0.5 rounded bg-surface-800/60 text-surface-400 font-medium">
                {PROJECT_TYPE_LABELS[project.type]}
              </span>
              <StatusBadge status={project.status} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 py-3 border-b border-surface-800/60">
          <p className="text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wide">
            Descrizione
          </p>
          <p className="text-sm text-surface-300 leading-relaxed">{project.description}</p>
        </div>

        {/* Instructions history */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
          <p className="text-xs font-medium text-surface-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Istruzioni ({project.instructions.length})
          </p>
          {project.instructions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-surface-600">
                Nessuna istruzione. Scrivi sotto per iniziare a modificare il progetto.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {project.instructions.map((inst, i) => (
                <div
                  key={inst.id}
                  className="flex gap-2.5 animate-slide-up"
                >
                  <div className="w-6 h-6 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-accent-400">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-200 leading-relaxed">{inst.text}</p>
                    <p className="text-xs text-surface-600 mt-1">
                      {new Date(inst.timestamp).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={instructionsEndRef} />
            </div>
          )}
        </div>

        {/* Instruction input */}
        <div className="px-4 py-3 border-t border-surface-800/60">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un'istruzione per modificare il progetto..."
              rows={3}
              className="w-full px-3 py-2.5 pr-12 rounded-xl bg-surface-800/60 border border-surface-700/60 text-white text-sm placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 transition-colors resize-none scrollbar-thin"
              maxLength={1000}
            />
            <button
              onClick={handleSendInstruction}
              disabled={!instruction.trim()}
              className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Invia istruzione"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-surface-600 mt-2">
            Premi Ctrl+Invio per inviare
          </p>
        </div>

        {/* Action buttons */}
        <div className="px-4 py-3 border-t border-surface-800/60 space-y-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-500 to-accent-600 text-surface-950 hover:from-accent-400 hover:to-accent-500 transition-all disabled:opacity-60 glow-accent"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generazione in corso...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {aiConfigured ? 'Genera con IA' : 'Configura IA per generare'}
              </>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onExport(project)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-surface-800/60 border border-surface-700/40 text-surface-300 hover:text-white hover:border-surface-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Esporta
            </button>
            <button
              onClick={() => githubConfigured ? null : onGoToSettings()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-surface-800/60 border border-surface-700/40 text-surface-300 hover:text-white hover:border-surface-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              {githubConfigured ? 'GitHub' : 'Collega GitHub'}
            </button>
          </div>
        </div>
      </div>

      {/* Right panel — Preview & Code */}
      <div className="flex-1 flex flex-col h-[50vh] lg:h-full overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-surface-800/60 flex items-center justify-between gap-3 glass">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surface-800/40 rounded-lg p-0.5">
            <TabButton
              active={activeTab === 'preview'}
              onClick={() => setActiveTab('preview')}
              icon={Eye}
              label="Anteprima"
            />
            <TabButton
              active={activeTab === 'code'}
              onClick={() => setActiveTab('code')}
              icon={Code2}
              label="Codice"
            />
          </div>

          {/* Device selector (preview only) */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 bg-surface-800/40 rounded-lg p-0.5">
              {(Object.keys(deviceWidths) as PreviewDevice[]).map((d) => {
                const Icon = deviceIcons[d];
                return (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={`w-8 h-7 rounded-md flex items-center justify-center transition-colors ${
                      device === d
                        ? 'bg-surface-700 text-accent-300'
                        : 'text-surface-500 hover:text-surface-300'
                    }`}
                    aria-label={d}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Refresh */}
          {activeTab === 'preview' && (
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="w-8 h-8 rounded-lg bg-surface-800/40 text-surface-400 hover:text-surface-200 flex items-center justify-center transition-colors"
              aria-label="Aggiorna anteprima"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden bg-surface-950 relative">
          {activeTab === 'preview' ? (
            <div className="h-full flex items-start justify-center overflow-y-auto scrollbar-thin p-0 lg:p-4">
              <div
                className="bg-white transition-all duration-300 h-full lg:h-auto lg:min-h-full w-full lg:rounded-xl overflow-hidden shadow-2xl"
                style={{
                  maxWidth: deviceWidths[device],
                  width: '100%',
                }}
              >
                <iframe
                  key={iframeKey}
                  srcDoc={previewHtml}
                  title="Anteprima del progetto"
                  className="w-full h-full min-h-[50vh] border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto scrollbar-thin">
              <pre className="p-4 text-sm font-mono text-surface-300 leading-relaxed whitespace-pre-wrap break-words">
                <code>{previewHtml}</code>
              </pre>
            </div>
          )}

          {/* AI not configured overlay */}
          {!aiConfigured && project.status === 'draft' && activeTab === 'preview' && (
            <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Modello IA non configurato
                </h3>
                <p className="text-sm text-surface-400 mb-5 leading-relaxed">
                  Per generare l'anteprima della tua applicazione, configura un provider IA.
                  Puoi usare OpenAI, Anthropic, Groq o un endpoint personalizzato.
                </p>
                <button
                  onClick={onGoToSettings}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Vai alle impostazioni
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Project['status'] }) {
  const config: Record<Project['status'], { label: string; class: string; icon: typeof CheckCircle2 }> = {
    draft: { label: 'Bozza', class: 'text-surface-400 bg-surface-800/60', icon: CheckCircle2 },
    generating: { label: 'In generazione', class: 'text-amber-400 bg-amber-500/10', icon: Loader2 },
    generated: { label: 'Pronto', class: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
    error: { label: 'Errore', class: 'text-red-400 bg-red-500/10', icon: AlertCircle },
  };
  const cfg = config[status];
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${cfg.class}`}>
      <cfg.icon className={`w-3 h-3 ${status === 'generating' ? 'animate-spin' : ''}`} />
      {cfg.label}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Eye;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active ? 'bg-surface-700 text-white' : 'text-surface-500 hover:text-surface-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
