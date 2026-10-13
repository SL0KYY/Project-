import React, { useState } from 'react';
import { Task, TaskPriority, TaskCategory, TaskStatus, Subtask } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  initialTask?: Task | null;
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  defaultStatus = 'sprint',
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || 'medium');
  const [category, setCategory] = useState<TaskCategory>(initialTask?.category || 'Engineering');
  const [estimateMinutes, setEstimateMinutes] = useState(initialTask?.estimateMinutes || 45);
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || new Date().toISOString().split('T')[0]);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialTask?.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskText.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st)));
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const task: Task = {
      id: initialTask?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      estimateMinutes: Number(estimateMinutes) || 30,
      loggedMinutes: initialTask?.loggedMinutes || 0,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      subtasks,
      createdAt: initialTask?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(task);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architect WebSocket Protocol"
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context, specifications, and acceptance criteria..."
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-2.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              >
                <option value="backlog">Backlog</option>
                <option value="sprint">Sprint</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-2.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-2.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Operations">Operations</option>
                <option value="Research">Research</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Est. Minutes
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimateMinutes}
                onChange={(e) => setEstimateMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Target Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Subtask Checklist ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>
            <div className="space-y-2 mb-2 max-h-36 overflow-y-auto">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-md"
                >
                  <label className="flex items-center gap-2.5 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-0"
                    />
                    <span className={st.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                    title="Remove subtask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            {initialTask && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this task?')) {
                    onDelete(initialTask.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                Delete Task
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors"
              >
                {initialTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
