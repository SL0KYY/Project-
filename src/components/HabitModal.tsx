import React, { useState } from 'react';
import { Habit } from '../types';
import { X, Trash2 } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  initialHabit?: Habit | null;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialHabit,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(initialHabit?.title || '');
  const [category, setCategory] = useState(initialHabit?.category || 'Focus');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | '3x_weekly'>(
    initialHabit?.frequency || 'daily'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const habit: Habit = {
      id: initialHabit?.id || `habit-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      frequency,
      streak: initialHabit?.streak || 0,
      bestStreak: initialHabit?.bestStreak || 0,
      createdAt: initialHabit?.createdAt || new Date().toISOString().split('T')[0],
      completions: initialHabit?.completions || {},
    };

    onSave(habit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {initialHabit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Focus Morning Block (90m)"
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
              >
                <option value="Focus">Focus</option>
                <option value="Engineering">Engineering</option>
                <option value="Learning">Learning</option>
                <option value="Health">Health</option>
                <option value="Routine">Routine</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Cadence
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="3x_weekly">3x per Week</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            {initialHabit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this habit?')) {
                    onDelete(initialHabit.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                Delete Habit
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                {initialHabit ? 'Save Habit' : 'Create Habit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
