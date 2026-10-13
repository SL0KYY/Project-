import React, { useState } from 'react';
import { Habit } from '../types';
import { Plus, Check, Flame, Trophy, Calendar, Sparkles } from 'lucide-react';
import { HabitModal } from './HabitModal';

interface HabitTrackerProps {
  habits: Habit[];
  onSaveHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleHabitDay: (habitId: string, dateStr: string) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  onSaveHabit,
  onDeleteHabit,
  onToggleHabitDay,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Generate last 7 days list for the daily toggle row
  const last7Days: { dateStr: string; dayLabel: string; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString([], { weekday: 'short' });
    last7Days.push({
      dateStr,
      dayLabel,
      isToday: i === 0,
    });
  }

  // Generate last 24 weeks data for commit-style heatmap grid
  const WEEKS_COUNT = 24;
  const heatmapDays: { dateStr: string; count: number }[] = [];
  const totalDays = WEEKS_COUNT * 7;
  const startDate = new Date();
  startDate.setDate(today.getDate() - totalDays + 1);

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    const dateStr = current.toISOString().split('T')[0];

    // Count how many habits completed on this date
    let count = 0;
    habits.forEach((h) => {
      if (h.completions && h.completions[dateStr]) {
        count++;
      }
    });

    heatmapDays.push({ dateStr, count });
  }

  // Group into columns of 7 days
  const heatmapWeeks: { dateStr: string; count: number }[][] = [];
  for (let w = 0; w < WEEKS_COUNT; w++) {
    heatmapWeeks.push(heatmapDays.slice(w * 7, (w + 1) * 7));
  }

  // Overall completion metrics
  const totalCompletionsLogged = habits.reduce((acc, h) => {
    return acc + Object.values(h.completions || {}).filter(Boolean).length;
  }, 0);

  const highestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || h.streak), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner: Metrics & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Habit Streaks & Discipline Heatmap
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
              <span>{habits.length} active tracks</span>
              <span>·</span>
              <span className="font-mono tabular-nums">{totalCompletionsLogged} lifetime logs</span>
              <span>·</span>
              <span className="font-mono tabular-nums">Best streak: {highestStreak} days</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingHabit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Habit</span>
        </button>
      </div>

      {/* 24-Week Consistency Heatmap */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Consistency Matrix (Last 24 Weeks)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-neutral-100 dark:bg-neutral-800" />
            <div className="w-2.5 h-2.5 rounded-xs bg-neutral-300 dark:bg-neutral-600" />
            <div className="w-2.5 h-2.5 rounded-xs bg-neutral-600 dark:bg-neutral-400" />
            <div className="w-2.5 h-2.5 rounded-xs bg-neutral-900 dark:bg-neutral-100" />
            <span>More</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[680px]">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => {
                  let bgClass = 'bg-neutral-100 dark:bg-neutral-800/80';
                  if (day.count === 1) bgClass = 'bg-neutral-300 dark:bg-neutral-700';
                  if (day.count === 2) bgClass = 'bg-neutral-500 dark:bg-neutral-500';
                  if (day.count >= 3) bgClass = 'bg-neutral-900 dark:bg-neutral-200';

                  return (
                    <div
                      key={day.dateStr}
                      className={`w-3 h-3 rounded-xs ${bgClass} transition-colors hover:ring-2 hover:ring-neutral-400 cursor-pointer`}
                      title={`${day.dateStr}: ${day.count} habits completed`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Habits List with 7-Day Quick-Action Loggers */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
            Active Routines & Recent Days
          </h3>
        </div>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
            >
              {/* Left Column: Habit Title & Metadata */}
              <div
                className="cursor-pointer max-w-sm"
                onClick={() => {
                  setEditingHabit(habit);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
                    {habit.title}
                  </h4>
                </div>

                {/* Zero-Pill Unboxed Metadata */}
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                  <span>{habit.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{habit.frequency.replace('_', ' ')}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono tabular-nums text-amber-600 dark:text-amber-400">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{habit.streak}d streak</span>
                  </span>
                </div>
              </div>

              {/* Right Column: 7-Day Interactive Toggle Buttons */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                {last7Days.map((day) => {
                  const isDone = Boolean(habit.completions && habit.completions[day.dateStr]);
                  return (
                    <div key={day.dateStr} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-neutral-400">
                        {day.dayLabel}
                      </span>
                      <button
                        onClick={() => onToggleHabitDay(habit.id, day.dateStr)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-transparent hover:border-neutral-400 dark:hover:border-neutral-500'
                        } ${day.isToday ? 'ring-1 ring-neutral-400 dark:ring-neutral-500' : ''}`}
                        title={`${habit.title} on ${day.dateStr} - Click to toggle`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveHabit}
        onDelete={onDeleteHabit}
        initialHabit={editingHabit}
      />
    </div>
  );
};
