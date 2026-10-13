export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'sprint' | 'in_progress' | 'review' | 'done';
export type TaskCategory = 'Engineering' | 'Design' | 'Product' | 'Operations' | 'Research';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  estimateMinutes: number;
  loggedMinutes: number;
  dueDate: string;
  subtasks: Subtask[];
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  mode: 'focus' | 'short_break' | 'long_break';
  durationMinutes: number;
  completedAt: string;
  ambientSound: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // '09:00'
  endTime: string;   // '10:30'
  category: TaskCategory;
  date: string;      // 'YYYY-MM-DD'
  color: string;
  taskId?: string;
  completed?: boolean;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: 'daily' | 'weekdays' | '3x_weekly';
  streak: number;
  bestStreak: number;
  createdAt: string;
  completions: Record<string, boolean>; // 'YYYY-MM-DD' -> true
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  updatedAt: string;
}

export interface UserSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  soundVolume: number;
  soundPreset: 'none' | 'brown' | 'rain' | 'alpha' | 'cafe';
  theme: 'light' | 'dark';
}

export interface WorkspaceData {
  tasks: Task[];
  focusSessions: FocusSession[];
  timeBlocks: TimeBlock[];
  habits: Habit[];
  notes: Note[];
  settings: UserSettings;
}
