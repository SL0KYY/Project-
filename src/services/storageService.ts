import { WorkspaceData, Task, FocusSession, TimeBlock, Habit, Note, UserSettings } from '../types';

const STORAGE_KEY = 'kinetix_studio_workspace_v1';

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const INITIAL_SETTINGS: UserSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: true,
  soundVolume: 0.6,
  soundPreset: 'none',
  theme: 'light',
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Architect Real-time WebSocket Protocol',
    description: 'Finalize schema for bidirectional state synchronization and client reconnection backoff.',
    status: 'in_progress',
    priority: 'urgent',
    category: 'Engineering',
    estimateMinutes: 90,
    loggedMinutes: 50,
    dueDate: getTodayDateString(),
    subtasks: [
      { id: 'st-1', title: 'Define protobuf payload schema', completed: true },
      { id: 'st-2', title: 'Write reconnection jitter backoff', completed: true },
      { id: 'st-3', title: 'Stress test 5,000 concurrent sockets', completed: false },
    ],
    createdAt: getDateOffset(2),
  },
  {
    id: 'task-2',
    title: 'Audit Design System Hairline Borders',
    description: 'Ensure all card containers conform to single-elevation depth with neutral-200 border contrast.',
    status: 'sprint',
    priority: 'high',
    category: 'Design',
    estimateMinutes: 45,
    loggedMinutes: 0,
    dueDate: getTodayDateString(),
    subtasks: [
      { id: 'st-4', title: 'Inspect modal backdrop scrim values', completed: false },
      { id: 'st-5', title: 'Verify contrast on high-DPI displays', completed: false },
    ],
    createdAt: getDateOffset(1),
  },
  {
    id: 'task-3',
    title: 'Quarterly Infrastructure Capacity Review',
    description: 'Analyze p99 latency regressions and CPU saturation curves across EU/US clusters.',
    status: 'review',
    priority: 'medium',
    category: 'Operations',
    estimateMinutes: 60,
    loggedMinutes: 60,
    dueDate: getDateOffset(-1),
    subtasks: [
      { id: 'st-6', title: 'Pull Prometheus quantile exports', completed: true },
      { id: 'st-7', title: 'Draft cost-optimization memo', completed: true },
    ],
    createdAt: getDateOffset(4),
  },
  {
    id: 'task-4',
    title: 'Optimize Database Query Indexes on User Ledger',
    description: 'Add composite B-Tree indexes on tenant_id and created_at to drop execution time below 4ms.',
    status: 'done',
    priority: 'high',
    category: 'Engineering',
    estimateMinutes: 40,
    loggedMinutes: 40,
    dueDate: getDateOffset(1),
    subtasks: [
      { id: 'st-8', title: 'Run EXPLAIN ANALYZE on query plans', completed: true },
      { id: 'st-9', title: 'Run zero-downtime migration in staging', completed: true },
    ],
    createdAt: getDateOffset(5),
  },
  {
    id: 'task-5',
    title: 'Draft API v3 Migration Documentation',
    description: 'Write breaking change migration handbook for enterprise client developer integration.',
    status: 'backlog',
    priority: 'medium',
    category: 'Product',
    estimateMinutes: 75,
    loggedMinutes: 0,
    dueDate: getDateOffset(-3),
    subtasks: [
      { id: 'st-10', title: 'Create curl code examples', completed: false },
      { id: 'st-11', title: 'Review deprecation timeline schedule', completed: false },
    ],
    createdAt: getDateOffset(3),
  },
  {
    id: 'task-6',
    title: 'Evaluate Vector Similarity Search Indexing',
    description: 'Benchmark HNSW vs IVF-PQ on 1M test vectors for semantic document retrieval recall.',
    status: 'sprint',
    priority: 'low',
    category: 'Research',
    estimateMinutes: 120,
    loggedMinutes: 25,
    dueDate: getDateOffset(-2),
    subtasks: [
      { id: 'st-12', title: 'Generate test embedding matrix', completed: true },
      { id: 'st-13', title: 'Record recall vs throughput trade-off', completed: false },
    ],
    createdAt: getDateOffset(2),
  },
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Deep Focus Morning Block (90m)',
    category: 'Focus',
    frequency: 'daily',
    streak: 14,
    bestStreak: 21,
    createdAt: getDateOffset(30),
    completions: {
      [getDateOffset(0)]: true,
      [getDateOffset(1)]: true,
      [getDateOffset(2)]: true,
      [getDateOffset(3)]: true,
      [getDateOffset(4)]: true,
      [getDateOffset(5)]: true,
      [getDateOffset(6)]: true,
      [getDateOffset(7)]: true,
      [getDateOffset(8)]: true,
      [getDateOffset(9)]: true,
      [getDateOffset(10)]: true,
      [getDateOffset(11)]: true,
      [getDateOffset(12)]: true,
      [getDateOffset(13)]: true,
    },
  },
  {
    id: 'habit-2',
    title: 'Code Review & PR Triage',
    category: 'Engineering',
    frequency: 'weekdays',
    streak: 8,
    bestStreak: 15,
    createdAt: getDateOffset(20),
    completions: {
      [getDateOffset(0)]: true,
      [getDateOffset(1)]: true,
      [getDateOffset(2)]: true,
      [getDateOffset(3)]: true,
      [getDateOffset(4)]: false,
      [getDateOffset(5)]: true,
      [getDateOffset(6)]: true,
      [getDateOffset(7)]: true,
    },
  },
  {
    id: 'habit-3',
    title: 'Technical Reading (20 pages)',
    category: 'Learning',
    frequency: 'daily',
    streak: 5,
    bestStreak: 12,
    createdAt: getDateOffset(15),
    completions: {
      [getDateOffset(0)]: true,
      [getDateOffset(1)]: true,
      [getDateOffset(2)]: true,
      [getDateOffset(3)]: true,
      [getDateOffset(4)]: true,
      [getDateOffset(5)]: false,
      [getDateOffset(6)]: true,
    },
  },
  {
    id: 'habit-4',
    title: 'Hydration Target (2.5L)',
    category: 'Health',
    frequency: 'daily',
    streak: 11,
    bestStreak: 18,
    createdAt: getDateOffset(25),
    completions: {
      [getDateOffset(0)]: true,
      [getDateOffset(1)]: true,
      [getDateOffset(2)]: true,
      [getDateOffset(3)]: true,
      [getDateOffset(4)]: true,
      [getDateOffset(5)]: true,
      [getDateOffset(6)]: true,
      [getDateOffset(7)]: true,
    },
  },
];

export const INITIAL_TIME_BLOCKS: TimeBlock[] = [
  {
    id: 'tb-1',
    title: 'Morning Strategy & Standup',
    startTime: '09:00',
    endTime: '09:30',
    category: 'Operations',
    date: getTodayDateString(),
    color: 'emerald',
    completed: true,
  },
  {
    id: 'tb-2',
    title: 'Deep Work: WebSocket Architecture',
    startTime: '09:30',
    endTime: '11:30',
    category: 'Engineering',
    date: getTodayDateString(),
    color: 'indigo',
    taskId: 'task-1',
    completed: true,
  },
  {
    id: 'tb-3',
    title: 'Product Review & Design Polish',
    startTime: '13:00',
    endTime: '14:30',
    category: 'Design',
    date: getTodayDateString(),
    color: 'amber',
    taskId: 'task-2',
    completed: false,
  },
  {
    id: 'tb-4',
    title: 'Infrastructure Capacity Analysis',
    startTime: '15:00',
    endTime: '16:00',
    category: 'Operations',
    date: getTodayDateString(),
    color: 'rose',
    taskId: 'task-3',
    completed: false,
  },
  {
    id: 'tb-5',
    title: 'Vector Search Benchmarking',
    startTime: '16:30',
    endTime: '17:30',
    category: 'Research',
    date: getTodayDateString(),
    color: 'sky',
    taskId: 'task-6',
    completed: false,
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'System Invariants & Architecture Checklist',
    content: `# Architecture Principles

1. **Deterministic State Synchronization**
   - Every mutation has a client timestamp and idempotency token.
   - Reconnections request missing sequence numbers.

2. **Zero-Pill Visual Standards**
   - Use clean typographic delimiters (·) rather than enclosing metadata in bordered capsules.
   - Maintain 60-30-10 color balance.

3. **Latency Benchmarks**
   - p50 < 15ms
   - p99 < 85ms on cross-region DB lookups.`,
    tags: ['Architecture', 'System'],
    pinned: true,
    updatedAt: getDateOffset(1),
  },
  {
    id: 'note-2',
    title: 'Weekly Focus Review Notes',
    content: `## Reflection
- Great momentum on WebSocket protocols.
- Next week: migrate indexing layer to PostgreSQL 16 partition scheme.
- Remember to take 5-minute eye breaks after 50-minute deep sprints.`,
    tags: ['Review', 'Productivity'],
    pinned: false,
    updatedAt: getDateOffset(2),
  },
];

export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'fs-1',
    taskId: 'task-1',
    taskTitle: 'Architect Real-time WebSocket Protocol',
    mode: 'focus',
    durationMinutes: 25,
    completedAt: `${getDateOffset(0)}T10:00:00Z`,
    ambientSound: 'brown',
  },
  {
    id: 'fs-2',
    taskId: 'task-1',
    taskTitle: 'Architect Real-time WebSocket Protocol',
    mode: 'focus',
    durationMinutes: 25,
    completedAt: `${getDateOffset(0)}T11:00:00Z`,
    ambientSound: 'brown',
  },
  {
    id: 'fs-3',
    taskId: 'task-4',
    taskTitle: 'Optimize Database Query Indexes',
    mode: 'focus',
    durationMinutes: 25,
    completedAt: `${getDateOffset(1)}T14:30:00Z`,
    ambientSound: 'rain',
  },
  {
    id: 'fs-4',
    taskId: 'task-6',
    taskTitle: 'Evaluate Vector Similarity Search',
    mode: 'focus',
    durationMinutes: 25,
    completedAt: `${getDateOffset(2)}T16:00:00Z`,
    ambientSound: 'alpha',
  },
];

export function loadWorkspaceData(): WorkspaceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.habits)) {
        return {
          tasks: parsed.tasks,
          focusSessions: parsed.focusSessions || INITIAL_FOCUS_SESSIONS,
          timeBlocks: parsed.timeBlocks || INITIAL_TIME_BLOCKS,
          habits: parsed.habits,
          notes: parsed.notes || INITIAL_NOTES,
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    }
  } catch (err) {
    console.error('Failed to parse saved workspace data:', err);
  }

  return {
    tasks: INITIAL_TASKS,
    focusSessions: INITIAL_FOCUS_SESSIONS,
    timeBlocks: INITIAL_TIME_BLOCKS,
    habits: INITIAL_HABITS,
    notes: INITIAL_NOTES,
    settings: INITIAL_SETTINGS,
  };
}

export function saveWorkspaceData(data: WorkspaceData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save workspace data:', err);
  }
}

export function resetWorkspaceData(): WorkspaceData {
  const fresh: WorkspaceData = {
    tasks: INITIAL_TASKS,
    focusSessions: INITIAL_FOCUS_SESSIONS,
    timeBlocks: INITIAL_TIME_BLOCKS,
    habits: INITIAL_HABITS,
    notes: INITIAL_NOTES,
    settings: INITIAL_SETTINGS,
  };
  saveWorkspaceData(fresh);
  return fresh;
}
