import React, { useState, useEffect, useRef } from 'react';
import { Task, FocusSession, UserSettings } from '../types';
import { soundEngine } from '../services/audioService';
import { Play, Pause, RotateCcw, SkipForward, Volume2, Check, Sparkles, Clock, Headphones } from 'lucide-react';

interface FocusEngineProps {
  tasks: Task[];
  activeTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  onSessionComplete: (session: FocusSession, task?: Task) => void;
  sessions: FocusSession[];
  settings: UserSettings;
}

type TimerMode = 'focus' | 'short_break' | 'long_break';

export const FocusEngine: React.FC<FocusEngineProps> = ({
  tasks,
  activeTask,
  onSelectTask,
  onSessionComplete,
  sessions,
  settings,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(settings.focusDuration * 60);
  const [totalTime, setTotalTime] = useState<number>(settings.focusDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'brown' | 'rain' | 'alpha' | 'cafe'>(settings.soundPreset);
  const [volume, setVolume] = useState<number>(settings.soundVolume);

  const timerRef = useRef<number | null>(null);

  // Sync mode changes with time duration
  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    let seconds = 25 * 60;
    if (newMode === 'focus') seconds = settings.focusDuration * 60;
    if (newMode === 'short_break') seconds = settings.shortBreakDuration * 60;
    if (newMode === 'long_break') seconds = settings.longBreakDuration * 60;
    setTotalTime(seconds);
    setTimeLeft(seconds);
  };

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, activeTask]);

  // Ambient sound synthesis management
  useEffect(() => {
    soundEngine.setVolume(volume);
    if (isRunning && ambientSound !== 'none') {
      soundEngine.playAmbient(ambientSound);
    } else {
      soundEngine.stopAmbient();
    }
  }, [isRunning, ambientSound, volume]);

  const handleComplete = () => {
    setIsRunning(false);
    soundEngine.playChime();

    const durationMin = Math.round(totalTime / 60);
    const newSession: FocusSession = {
      id: `fs-${Date.now()}`,
      taskId: activeTask?.id,
      taskTitle: activeTask?.title || 'General Deep Focus',
      mode,
      durationMinutes: durationMin,
      completedAt: new Date().toISOString(),
      ambientSound,
    };

    onSessionComplete(newSession, activeTask || undefined);

    // Auto transition to break or next focus
    if (mode === 'focus') {
      switchMode('short_break');
    } else {
      switchMode('focus');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const skipTimer = () => {
    if (confirm('Skip to end of current timer?')) {
      handleComplete();
    }
  };

  // Time string formatting
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressRatio = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const strokeDashoffset = 2 * Math.PI * 135 * (1 - progressRatio);

  // Today's total logged minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayFocusMinutes = sessions
    .filter((s) => s.completedAt.startsWith(todayStr) && s.mode === 'focus')
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Upper Mode Selector & Active Task Attachment */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        {/* Mode Tabs */}
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <button
            onClick={() => switchMode('focus')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'focus'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Deep Focus ({settings.focusDuration}m)
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'short_break'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Short Break ({settings.shortBreakDuration}m)
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'long_break'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Long Break ({settings.longBreakDuration}m)
          </button>
        </div>

        {/* Task Linker */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-500 whitespace-nowrap">Target Task:</span>
          <select
            value={activeTask?.id || ''}
            onChange={(e) => {
              const selected = tasks.find((t) => t.id === e.target.value) || null;
              onSelectTask(selected);
            }}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-hidden truncate"
          >
            <option value="">(No specific task / General Focus)</option>
            {tasks
              .filter((t) => t.status !== 'done')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.estimateMinutes}m)
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Primary Circular Timer Display */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Circular SVG Ring */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 300 300">
            {/* Background Track */}
            <circle
              cx="150"
              cy="150"
              r="135"
              className="text-neutral-100 dark:text-neutral-800 stroke-current"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="150"
              cy="150"
              r="135"
              className="text-neutral-900 dark:text-neutral-100 stroke-current transition-all duration-300"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 135}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span className="text-5xl sm:text-6xl font-mono font-semibold tracking-tighter tabular-nums text-neutral-900 dark:text-neutral-100">
              {formattedTime}
            </span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {mode === 'focus' ? 'Deep Work Session' : 'Rest & Recharge'}
            </span>
            {activeTask && (
              <span className="mt-1 text-xs text-neutral-700 dark:text-neutral-300 max-w-[200px] truncate">
                {activeTask.title}
              </span>
            )}
          </div>
        </div>

        {/* Primary Controls */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className="flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-md hover:scale-105 active:scale-95"
            title={isRunning ? 'Pause session' : 'Start session'}
          >
            {isRunning ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={skipTimer}
            className="p-3 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Complete & Skip"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Synthesizer Soundscape & Audio Controls */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Headphones className="w-4 h-4 text-neutral-500" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Web Audio Synthesized Soundscapes
              </h4>
              <p className="text-xs text-neutral-500">
                Pure browser synthesized acoustic frequencies without external files
              </p>
            </div>
          </div>

          {/* Master Volume */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Volume2 className="w-4 h-4 text-neutral-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
            />
            <span className="text-xs font-mono tabular-nums text-neutral-400 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Ambient Preset Switcher Buttons */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { id: 'none', label: 'Silence' },
            { id: 'brown', label: 'Brown Noise' },
            { id: 'rain', label: 'Rain Storm' },
            { id: 'alpha', label: '432Hz Alpha Waves' },
            { id: 'cafe', label: 'Cafe Ambience' },
          ].map((preset) => {
            const isSelected = ambientSound === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setAmbientSound(preset.id as any)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focus Session History & Velocity Ledger */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Session Ledger
            </h4>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
              <span>Today's Total:</span>
              <span className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                {todayFocusMinutes} min
              </span>
              <span>·</span>
              <span>{sessions.filter((s) => s.completedAt.startsWith(todayStr)).length} cycles completed</span>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-neutral-400 font-semibold border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <tr>
                <th className="py-2 px-3">Session Focus</th>
                <th className="py-2 px-3">Mode</th>
                <th className="py-2 px-3">Duration</th>
                <th className="py-2 px-3">Soundscape</th>
                <th className="py-2 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {sessions.slice(0, 8).map((s) => (
                <tr key={s.id} className="text-neutral-700 dark:text-neutral-300">
                  <td className="py-2.5 px-3 font-medium text-neutral-900 dark:text-neutral-100 max-w-xs truncate">
                    {s.taskTitle || 'General Focus'}
                  </td>
                  <td className="py-2.5 px-3 capitalize">
                    {s.mode.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">
                    {s.durationMinutes} min
                  </td>
                  <td className="py-2.5 px-3 capitalize text-neutral-500">
                    {s.ambientSound === 'none' ? 'Silence' : s.ambientSound}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-400">
                    {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
