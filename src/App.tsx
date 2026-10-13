import React, { useState, useEffect } from 'react';
import { 
  WorkspaceData, 
  Task, 
  FocusSession, 
  TimeBlock, 
  Habit, 
  Note, 
  UserSettings, 
  TaskStatus 
} from './types';
import { 
  loadWorkspaceData, 
  saveWorkspaceData, 
  resetWorkspaceData, 
  getTodayDateString 
} from './services/storageService';
import { soundEngine } from './services/audioService';
import { Header } from './components/Header';
import { SprintBoard } from './components/SprintBoard';
import { FocusEngine } from './components/FocusEngine';
import { TimePlanner } from './components/TimePlanner';
import { HabitTracker } from './components/HabitTracker';
import { Scratchpad } from './components/Scratchpad';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { SettingsModal } from './components/SettingsModal';
import { Sliders, Download } from 'lucide-react';

export default function App() {
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>(() => loadWorkspaceData());
  const [activeTab, setActiveTab] = useState<'sprint' | 'focus' | 'schedule' | 'habits' | 'notes' | 'analytics'>('sprint');
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskDefaultStatus, setNewTaskDefaultStatus] = useState<TaskStatus>('sprint');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active task for focus session
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);

  // Theme synchronization
  const isDark = workspaceData.settings.theme === 'dark';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Persist state to local storage on update
  useEffect(() => {
    saveWorkspaceData(workspaceData);
  }, [workspaceData]);

  // Sound Engine synchronization
  useEffect(() => {
    soundEngine.setVolume(workspaceData.settings.soundVolume);
  }, [workspaceData.settings.soundVolume]);

  const handleToggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setWorkspaceData((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme: nextTheme },
    }));
  };

  const handleToggleSound = () => {
    const current = workspaceData.settings.soundPreset;
    const next = current === 'none' ? 'brown' : 'none';
    setWorkspaceData((prev) => ({
      ...prev,
      settings: { ...prev.settings, soundPreset: next },
    }));
    if (next === 'none') {
      soundEngine.stopAmbient();
    } else {
      soundEngine.playAmbient(next);
    }
  };

  // Task Handlers
  const handleSaveTask = (task: Task) => {
    setWorkspaceData((prev) => {
      const exists = prev.tasks.some((t) => t.id === task.id);
      const updatedTasks = exists
        ? prev.tasks.map((t) => (t.id === task.id ? task : t))
        : [task, ...prev.tasks];
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setWorkspaceData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
    if (activeFocusTask?.id === taskId) {
      setActiveFocusTask(null);
    }
  };

  const handleStartFocusFromTask = (task: Task) => {
    setActiveFocusTask(task);
    setActiveTab('focus');
  };

  const handleOpenNewTask = (status: TaskStatus = 'sprint') => {
    setEditingTask(null);
    setNewTaskDefaultStatus(status);
    setIsTaskModalOpen(true);
  };

  // Focus Session Handlers
  const handleSessionComplete = (session: FocusSession, task?: Task) => {
    setWorkspaceData((prev) => {
      const updatedSessions = [session, ...prev.focusSessions];
      let updatedTasks = prev.tasks;
      if (task) {
        updatedTasks = prev.tasks.map((t) =>
          t.id === task.id
            ? { ...t, loggedMinutes: t.loggedMinutes + session.durationMinutes }
            : t
        );
      }
      return {
        ...prev,
        focusSessions: updatedSessions,
        tasks: updatedTasks,
      };
    });
  };

  // Time Block Handlers
  const handleSaveTimeBlock = (block: TimeBlock) => {
    setWorkspaceData((prev) => {
      const exists = prev.timeBlocks.some((b) => b.id === block.id);
      const updated = exists
        ? prev.timeBlocks.map((b) => (b.id === block.id ? block : b))
        : [...prev.timeBlocks, block];
      return { ...prev, timeBlocks: updated };
    });
  };

  const handleDeleteTimeBlock = (blockId: string) => {
    setWorkspaceData((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.filter((b) => b.id !== blockId),
    }));
  };

  const handleToggleTimeBlockComplete = (blockId: string) => {
    setWorkspaceData((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((b) =>
        b.id === blockId ? { ...b, completed: !b.completed } : b
      ),
    }));
  };

  // Habit Handlers
  const handleSaveHabit = (habit: Habit) => {
    setWorkspaceData((prev) => {
      const exists = prev.habits.some((h) => h.id === habit.id);
      const updated = exists
        ? prev.habits.map((h) => (h.id === habit.id ? habit : h))
        : [...prev.habits, habit];
      return { ...prev, habits: updated };
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    setWorkspaceData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
  };

  const handleToggleHabitDay = (habitId: string, dateStr: string) => {
    setWorkspaceData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== habitId) return h;
        const currentCompletions = { ...(h.completions || {}) };
        const nextVal = !currentCompletions[dateStr];
        currentCompletions[dateStr] = nextVal;

        // Recalculate streak
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const s = d.toISOString().split('T')[0];
          if (currentCompletions[s]) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }

        const bestStreak = Math.max(h.bestStreak || 0, streak);

        return {
          ...h,
          completions: currentCompletions,
          streak,
          bestStreak,
        };
      }),
    }));
  };

  // Note Handlers
  const handleSaveNote = (note: Note) => {
    setWorkspaceData((prev) => {
      const exists = prev.notes.some((n) => n.id === note.id);
      const updated = exists
        ? prev.notes.map((n) => (n.id === note.id ? note : n))
        : [note, ...prev.notes];
      return { ...prev, notes: updated };
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setWorkspaceData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
  };

  const handleConvertNoteToTask = (note: Note) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: note.title || 'Task from scratchpad',
      description: note.content,
      status: 'sprint',
      priority: 'high',
      category: 'Product',
      estimateMinutes: 45,
      loggedMinutes: 0,
      dueDate: getTodayDateString(),
      subtasks: [],
      createdAt: getTodayDateString(),
    };
    handleSaveTask(newTask);
    setActiveTab('sprint');
  };

  // Reset & Import Handlers
  const handleResetData = () => {
    const fresh = resetWorkspaceData();
    setWorkspaceData(fresh);
  };

  const handleImportData = (data: WorkspaceData) => {
    setWorkspaceData(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar Header strictly following 3-Zone Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTask={() => handleOpenNewTask('sprint')}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        soundPreset={workspaceData.settings.soundPreset}
        onToggleSound={handleToggleSound}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'sprint' && (
          <SprintBoard
            tasks={workspaceData.tasks}
            onUpdateTask={handleSaveTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onNewTaskWithStatus={handleOpenNewTask}
            onStartFocus={handleStartFocusFromTask}
          />
        )}

        {activeTab === 'focus' && (
          <FocusEngine
            tasks={workspaceData.tasks}
            activeTask={activeFocusTask}
            onSelectTask={setActiveFocusTask}
            onSessionComplete={handleSessionComplete}
            sessions={workspaceData.focusSessions}
            settings={workspaceData.settings}
          />
        )}

        {activeTab === 'schedule' && (
          <TimePlanner
            timeBlocks={workspaceData.timeBlocks}
            tasks={workspaceData.tasks}
            onSaveTimeBlock={handleSaveTimeBlock}
            onDeleteTimeBlock={handleDeleteTimeBlock}
            onToggleTimeBlockComplete={handleToggleTimeBlockComplete}
          />
        )}

        {activeTab === 'habits' && (
          <HabitTracker
            habits={workspaceData.habits}
            onSaveHabit={handleSaveHabit}
            onDeleteHabit={handleDeleteHabit}
            onToggleHabitDay={handleToggleHabitDay}
          />
        )}

        {activeTab === 'notes' && (
          <Scratchpad
            notes={workspaceData.notes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onConvertToTask={handleConvertNoteToTask}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            tasks={workspaceData.tasks}
            sessions={workspaceData.focusSessions}
            habits={workspaceData.habits}
            timeBlocks={workspaceData.timeBlocks}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">Kinetix Studio</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{workspaceData.tasks.length} tasks</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{workspaceData.focusSessions.length} focus sessions</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/kinetix-studio-source.zip"
              download="kinetix-studio-source.zip"
              className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              title="Download source code archive"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Code (.ZIP)</span>
            </a>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings & Backup</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={editingTask}
        defaultStatus={newTaskDefaultStatus}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={workspaceData.settings}
        onUpdateSettings={(nextSettings) =>
          setWorkspaceData((prev) => ({ ...prev, settings: nextSettings }))
        }
        fullData={workspaceData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
    </div>
  );
}
