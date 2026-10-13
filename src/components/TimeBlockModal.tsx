import React, { useState } from 'react';
import { TimeBlock, TaskCategory, Task } from '../types';
import { X, Trash2 } from 'lucide-react';

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: TimeBlock) => void;
  onDelete?: (blockId: string) => void;
  initialBlock?: TimeBlock | null;
  selectedDate: string;
  defaultStartTime?: string;
  availableTasks: Task[];
}

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialBlock,
  selectedDate,
  defaultStartTime = '10:00',
  availableTasks,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(initialBlock?.title || '');
  const [startTime, setStartTime] = useState(initialBlock?.startTime || defaultStartTime);
  const [endTime, setEndTime] = useState(initialBlock?.endTime || '11:00');
  const [category, setCategory] = useState<TaskCategory>(initialBlock?.category || 'Engineering');
  const [taskId, setTaskId] = useState<string>(initialBlock?.taskId || '');
  const [color, setColor] = useState<string>(initialBlock?.color || 'indigo');

  const handleSelectTask = (selectedTaskId: string) => {
    setTaskId(selectedTaskId);
    const matched = availableTasks.find((t) => t.id === selectedTaskId);
    if (matched && !title) {
      setTitle(matched.title);
      setCategory(matched.category);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const block: TimeBlock = {
      id: initialBlock?.id || `tb-${Date.now()}`,
      title: title.trim(),
      startTime,
      endTime,
      category,
      date: selectedDate,
      color,
      taskId: taskId || undefined,
      completed: initialBlock?.completed || false,
    };

    onSave(block);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {initialBlock ? 'Edit Time Block' : 'Schedule Time Block'}
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
              Link to Task (Optional)
            </label>
            <select
              value={taskId}
              onChange={(e) => handleSelectTask(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
            >
              <option value="">(Standalone focus block)</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category})
                </option>
              ))}
          </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Block Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Work: Protocol Sync"
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
            >
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Operations">Operations</option>
              <option value="Research">Research</option>
            </select>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            {initialBlock && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialBlock.id);
                  onClose();
                }}
                className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                Delete
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
                {initialBlock ? 'Update Block' : 'Schedule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
