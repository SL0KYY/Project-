import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Plus } from 'lucide-react';
import { soundEngine } from '../services/audioService';

interface HeaderProps {
  activeTab: 'sprint' | 'focus' | 'schedule' | 'habits' | 'notes' | 'analytics';
  onTabChange: (tab: 'sprint' | 'focus' | 'schedule' | 'habits' | 'notes' | 'analytics') => void;
  onOpenNewTask: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  soundPreset: string;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTask,
  isDark,
  onToggleTheme,
  soundPreset,
  onToggleSound,
}) => {
  const isAudioActive = soundPreset !== 'none';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element, one line) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('sprint')}
            className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <div className="w-5 h-5 bg-neutral-900 dark:bg-neutral-100 rounded-sm flex items-center justify-center text-white dark:text-neutral-900 text-[10px] font-mono font-bold">
              K
            </div>
            <span>Kinetix Studio</span>
          </button>
        </div>

        {/* Zone 2: Single-line concise nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onTabChange('sprint')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'sprint'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Sprint
          </button>
          <button
            onClick={() => onTabChange('focus')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'focus'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => onTabChange('schedule')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'schedule'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => onTabChange('habits')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'habits'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Habits
          </button>
          <button
            onClick={() => onTabChange('notes')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'notes'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'analytics'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-neutral-900 dark:border-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Analytics
          </button>
        </nav>

        {/* Zone 3: Primary action + quick control cluster */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSound}
            title={isAudioActive ? `Ambient Audio: ${soundPreset}` : 'Turn on Brown Noise'}
            className={`p-2 rounded-lg text-xs transition-colors border ${
              isAudioActive
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 border-transparent'
            }`}
            aria-label="Toggle ambient noise"
          >
            {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
