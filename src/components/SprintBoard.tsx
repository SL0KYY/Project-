import React, { useState } from 'react';
import { Task, TaskPriority, TaskCategory, TaskStatus } from '../types';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  LayoutGrid, 
  List as ListIcon, 
  Calendar,
  CheckSquare
} from 'lucide-react';

interface SprintBoardProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onNewTaskWithStatus: (status: TaskStatus) => void;
  onStartFocus: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'sprint', label: 'Priority Sprint' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Completed' },
];

export const SprintBoard: React.FC<SprintBoardProps> = ({
  tasks,
  onUpdateTask,
  onEditTask,
  onNewTaskWithStatus,
  onStartFocus,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const moveTask = (task: Task, direction: 'prev' | 'next') => {
    const statusOrder: TaskStatus[] = ['backlog', 'sprint', 'in_progress', 'review', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < statusOrder.length) {
      onUpdateTask({ ...task, status: statusOrder[newIndex] });
    }
  };

  const toggleSubtask = (task: Task, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Toolbar: Filters & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Live Search */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-600"
            />
          </div>

          {/* Interactive Priority Filter segmented control */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedPriority === p
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="Operations">Operations</option>
            <option value="Research">Research</option>
          </select>
        </div>

        {/* View Switcher: Board vs List */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
              }`}
              title="Kanban Board View"
              aria-label="Board view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
              }`}
              title="Table List View"
              aria-label="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-neutral-100/60 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800/80 rounded-xl p-3 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-neutral-200/80 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      {col.label}
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-neutral-400 dark:text-neutral-500">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => onNewTaskWithStatus(col.id)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Task Cards Column */}
                <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="py-8 px-2 text-center text-xs text-neutral-400 dark:text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                      No active tasks in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const completedCount = task.subtasks.filter((s) => s.completed).length;
                      const totalSubtasks = task.subtasks.length;
                      return (
                        <div
                          key={task.id}
                          onClick={() => onEditTask(task)}
                          className="group cursor-pointer bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-lg p-3.5 shadow-xs transition-all hover:shadow-sm"
                        >
                          {/* Unboxed Metadata (Zero-Pill Discipline) */}
                          <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800/60">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                {task.category}
                              </span>
                              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">·</span>
                              <span className={task.priority === 'urgent' ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}>
                                {getPriorityLabel(task.priority)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 font-mono tabular-nums text-[11px] shrink-0 text-neutral-400">
                              <Clock className="w-3 h-3" />
                              <span>{task.estimateMinutes}m</span>
                            </div>
                          </div>

                          {/* Task Title */}
                          <h4 className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug group-hover:text-neutral-700 dark:group-hover:text-white transition-colors">
                            {task.title}
                          </h4>

                          {/* Task Description Snippet */}
                          {task.description && (
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks summary */}
                          {totalSubtasks > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 font-mono tabular-nums">
                                <span className="flex items-center gap-1">
                                  <CheckSquare className="w-3 h-3" />
                                  <span>Subtasks</span>
                                </span>
                                <span>{completedCount}/{totalSubtasks}</span>
                              </div>
                              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-neutral-900 dark:bg-neutral-100 h-full rounded-full transition-all"
                                  style={{ width: `${(completedCount / totalSubtasks) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Due Date & Action Bar */}
                          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono tabular-nums">
                              <Calendar className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                            </div>

                            {/* Control triggers */}
                            <div className="flex items-center gap-1">
                              {/* Start Focus Timer Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStartFocus(task);
                                }}
                                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                title="Start Focus Session on this task"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </button>

                              {/* Stage navigation */}
                              {col.id !== 'backlog' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTask(task, 'prev');
                                  }}
                                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                  title="Move to previous stage"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {col.id !== 'done' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTask(task, 'next');
                                  }}
                                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                  title="Move to next stage"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High Density Table List View */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subtasks</th>
                  <th className="py-3 px-4">Estimate</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100 max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 capitalize">
                      {task.status.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {getPriorityLabel(task.priority)}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      {task.category}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500">
                      {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500">
                      {task.estimateMinutes}m
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500">
                      {task.dueDate}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onStartFocus(task)}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                      >
                        Focus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
