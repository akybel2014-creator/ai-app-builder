import { useState } from 'react';
import type { AppSettings, AIProvider } from '@/types';
import { AI_PROVIDERS } from '@/lib/constants';
import {
  Zap,
  Github,
  Check,
  ExternalLink,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Cpu,
  Link,
  Shield,
  Info,
  Save,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateAI: (updates: Partial<AppSettings['ai']>) => void;
  onUpdateGitHub: (updates: Partial<AppSettings['github']>) => void;
}

export default function SettingsView({
  settings,
  onUpdateAI,
  onUpdateGitHub,
}: SettingsViewProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const aiConfigured = Boolean(settings.ai.provider && settings.ai.apiKey);
  const githubConfigured = Boolean(settings.github.username && settings.github.token);

  const handleSaveAI = () => {
    setSavedSection('ai');
    setTimeout(() => setSavedSection(null), 2500);
  };

  const handleSaveGitHub = () => {
    setSavedSection('github');
    setTimeout(() => setSavedSection(null), 2500);
  };

  const handleProviderChange = (provider: AIProvider) => {
    const providerInfo = AI_PROVIDERS.find((p) => p.id === provider);
    onUpdateAI({
      provider,
      model: providerInfo && providerInfo.models.length > 0 ? providerInfo.models[0] : '',
      endpoint: providerInfo ? providerInfo.defaultEndpoint : '',
    });
  };

  const currentProvider = AI_PROVIDERS.find((p) => p.id === settings.ai.provider);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Impostazioni</h1>
        <p className="text-surface-400 text-sm sm:text-base mt-2">
          Configura le integrazioni per attivare la generazione automatica e il collegamento a GitHub.
        </p>
      </div>

      {/* AI Configuration */}
      <section className="mb-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 border border-accent-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Modello IA</h2>
            <p className="text-sm text-surface-500">
              Configura il provider per generare applicazioni
            </p>
          </div>
          {aiConfigured ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10">
              <Check className="w-3.5 h-3.5" />
              Configurato
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10">
              <AlertCircle className="w-3.5 h-3.5" />
              Richiede configurazione
            </span>
          )}
        </div>

        <div className="glass border border-surface-800/60 rounded-2xl p-5 space-y-5">
          {/* Provider selection */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2.5">
              <Cpu className="w-4 h-4 inline mr-1.5 text-surface-500" />
              Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    settings.ai.provider === p.id
                      ? 'border-accent-500/50 bg-accent-500/10 text-accent-300'
                      : 'border-surface-800 bg-surface-800/30 text-surface-400 hover:border-surface-700'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {settings.ai.provider && (
            <>
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  <Key className="w-4 h-4 inline mr-1.5 text-surface-500" />
                  Chiave API
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.ai.apiKey}
                    onChange={(e) => onUpdateAI({ apiKey: e.target.value })}
                    placeholder="Inserisci la tua chiave API"
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-surface-800/60 border border-surface-700/60 text-white text-sm placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 transition-colors font-mono"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                    aria-label={showApiKey ? 'Nascondi chiave' : 'Mostra chiave'}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {currentProvider && currentProvider.docsUrl && (
                  <a
                    href={currentProvider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 mt-2 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ottieni una chiave API da {currentProvider.name}
                  </a>
                )}
              </div>

              {/* Model */}
              {currentProvider && currentProvider.models.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Modello
                  </label>
                  <select
                    value={settings.ai.model}
                    onChange={(e) => onUpdateAI({ model: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-surface-700/60 text-white text-sm focus:outline-none focus:border-accent-500/50 transition-colors cursor-pointer"
                  >
                    {currentProvider.models.map((m) => (
                      <option key={m} value={m} className="bg-surface-900">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom model input */}
              {settings.ai.provider === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Nome modello
                  </label>
                  <input
                    type="text"
                    value={settings.ai.model}
                    onChange={(e) => onUpdateAI({ model: e.target.value })}
                    placeholder="es. mio-modello-personalizzato"
                    className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-surface-700/60 text-white text-sm placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 transition-colors"
                  />
                </div>
              )}

              {/* Endpoint */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  <Link className="w-4 h-4 inline mr-1.5 text-surface-500" />
                  Endpoint API
                </label>
                <input
                  type="text"
                  value={settings.ai.endpoint}
                  onChange={(e) => onUpdateAI({ endpoint: e.target.value })}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-surface-700/60 text-white text-sm placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 transition-colors font-mono"
                />
              </div>

              {/* Save button */}
              <div className="flex items-center justify-between pt-1">
                {savedSection === 'ai' ? (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-400 animate-fade-in">
                    <Check className="w-4 h-4" />
                    Impostazioni salvate
                  </span>
                ) : (
                  <p className="text-xs text-surface-600">
                    Le impostazioni vengono salvate localmente nel browser
                  </p>
                )}
                <button
                  onClick={handleSaveAI}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Salva
                </button>
              </div>
            </>
          )}

          {!settings.ai.provider && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-800/40">
              <Info className="w-4 h-4 text-surface-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-surface-400 leading-relaxed">
                Seleziona un provider per iniziare. Tutti i provider supportati offrono piani
                gratuiti o trial. La chiave API viene salvata solo nel tuo browser e non viene
                mai inviata a server di terzi.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Security note */}
      <div className="mb-8 flex items-start gap-3 p-4 rounded-xl bg-surface-800/30 border border-surface-800/60 animate-fade-in">
        <Shield className="w-5 h-5 text-surface-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-surface-300">Sicurezza delle credenziali</p>
          <p className="text-sm text-surface-500 mt-1 leading-relaxed">
            Le chiavi API e i token vengono salvati esclusivamente nel tuo browser (localStorage)
            e non vengono trasmessi a server esterni. Quando l'integrazione IA sarà attiva, le
            chiamate saranno effettuate tramite un proxy sicuro per proteggere le tue credenziali.
          </p>
        </div>
      </div>

      {/* GitHub Configuration */}
      <section className="animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-700 to-surface-800 border border-surface-600/40 flex items-center justify-center">
            <Github className="w-5 h-5 text-surface-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">GitHub</h2>
            <p className="text-sm text-surface-500">
              Collega il tuo account per esportare i progetti su repository
            </p>
          </div>
          {githubConfigured ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10">
              <Check className="w-3.5 h-3.5" />
              Collegato
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10">
              <AlertCircle className="w-3.5 h-3.5" />
              Non configurato
            </span>
          )}
        </div>

        <div className="glass border border-surface-800/60 rounded-2xl p-5 space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Nome utente GitHub
            </label>
            <input
              type="text"
              value={settings.github.username}
              onChange={(e) => onUpdateGitHub({ username: e.target.value })}
              placeholder="es. mario-rossi"
              className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-surface-700/60 text-white text-sm placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>

          {/* Token */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              <Key className="w-4 h-4 inline mr-1.5 text-surface-500" />
              Token di accesso personale
            </label>
            <div className="relative">
              <input
                type={showGithubToken ? 'text' : 'password'}
                value={settings.github.token}
                onChange={(e) => onUpdateGitHub({ token: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-surface-800/60 border border-surface-700/60 text-white text-sm placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 transition-colors font-mono"
              />
              <button
                onClick={() => setShowGithubToken(!showGithubToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                aria-label={showGithubToken ? 'Nascondi token' : 'Mostra token'}
              >
                {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <a
              href="https://github.com/settings/tokens/new?description=AI%20App%20Builder&scopes=repo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 mt-2 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Crea un token di accesso su GitHub
            </a>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-800/40">
            <Info className="w-4 h-4 text-surface-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-surface-400 leading-relaxed">
              Il token deve avere il permesso <code className="text-xs px-1 py-0.5 rounded bg-surface-900 text-accent-300">repo</code> per
              creare e gestire i repository. Le credenziali vengono salvate solo nel tuo browser.
            </p>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-between pt-1">
            {savedSection === 'github' ? (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400 animate-fade-in">
                <Check className="w-4 h-4" />
                Impostazioni salvate
              </span>
            ) : (
              <p className="text-xs text-surface-600">
                Configurazione futura — l'integrazione sarà attiva a breve
              </p>
            )}
            <button
              onClick={handleSaveGitHub}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-surface-800/60 border border-surface-700/40 text-surface-200 hover:text-white hover:border-surface-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              Salva
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
