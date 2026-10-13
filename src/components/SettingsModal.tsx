import React, { useRef } from 'react';
import { UserSettings, WorkspaceData } from '../types';
import { X, Download, Upload, RotateCcw, Sliders } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  fullData: WorkspaceData;
  onImportData: (data: WorkspaceData) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  fullData,
  onImportData,
  onResetData,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kinetix-workspace-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tasks && parsed.habits) {
          onImportData(parsed);
          alert('Workspace data restored successfully!');
          onClose();
        } else {
          alert('Invalid backup JSON format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-neutral-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Workspace Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Defaults */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Focus & Break Durations
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Focus (min)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.focusDuration}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, focusDuration: Number(e.target.value) || 25 })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Short Break (min)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, shortBreakDuration: Number(e.target.value) || 5 })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Long Break (min)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, longBreakDuration: Number(e.target.value) || 15 })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Backup & Data Persistence
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Data</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Backup</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          <div>
            <a
              href="/kinetix-studio-source.zip"
              download="kinetix-studio-source.zip"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project Code (.ZIP)</span>
            </a>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm('Reset workspace to initial sample sprint and habits data?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
