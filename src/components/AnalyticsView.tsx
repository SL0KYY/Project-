import React from 'react';
import { Task, FocusSession, Habit, TimeBlock } from '../types';
import { BarChart3, Clock, CheckCircle2, Flame, PieChart, TrendingUp } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  sessions: FocusSession[];
  habits: Habit[];
  timeBlocks: TimeBlock[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  sessions,
  habits,
  timeBlocks,
}) => {
  // Real metrics calculation
  const totalCompletedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Compute last 7 days focus minutes
  const last7DaysData: { dateStr: string; label: string; minutes: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString([], { weekday: 'short' });

    const dayMinutes = sessions
      .filter((s) => s.completedAt.startsWith(dateStr) && s.mode === 'focus')
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    last7DaysData.push({ dateStr, label, minutes: dayMinutes });
  }

  const maxDailyMinutes = Math.max(60, ...last7DaysData.map((d) => d.minutes));

  // Category breakdown of tasks
  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  // Habit metrics
  const activeHabitsCount = habits.length;
  const avgStreak = activeHabitsCount > 0
    ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / activeHabitsCount)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Executive Performance & Velocity Ledger
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Deterministic execution statistics derived from active sprints and session logs
        </p>
      </div>

      {/* Top 4 KPI Cards Strip (Single Elevation Depth, Clean Borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Total Focus Time</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {totalFocusMinutes} <span className="text-sm font-normal text-neutral-500">mins</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            {sessions.length} completed focus cycles
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Task Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {taskCompletionRate}%
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            {totalCompletedTasks} of {totalTasks} sprint items delivered
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Average Habit Streak</span>
            <Flame className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {avgStreak} <span className="text-sm font-normal text-neutral-500">days</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Across {activeHabitsCount} active daily habits
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Scheduled Time Blocks</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {timeBlocks.length}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            {timeBlocks.filter((b) => b.completed).length} completed blocks
          </p>
        </div>
      </div>

      {/* Focus Minutes Daily Bar Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 7-Day Focus Minutes Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Focus Time Velocity (Last 7 Days)
            </h3>
            <span className="text-xs font-mono tabular-nums text-neutral-400">
              Minutes / Day
            </span>
          </div>

          <div className="mt-6 flex items-end justify-between gap-3 h-52 pt-6 pb-2 px-2">
            {last7DaysData.map((d) => {
              const heightPct = Math.round((d.minutes / maxDailyMinutes) * 100);
              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono tabular-nums text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.minutes}m
                  </span>
                  <div className="w-full max-w-[42px] bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden flex items-end h-full">
                    <div
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                      className="w-full bg-neutral-900 dark:bg-neutral-100 rounded-md transition-all duration-300"
                    />
                  </div>
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Task Category Breakdown (1 col) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Category Distribution
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Task distribution by domain
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / totalTasks) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{cat}</span>
                    <span className="font-mono tabular-nums text-neutral-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-900 dark:bg-neutral-100 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
