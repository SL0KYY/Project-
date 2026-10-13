import React, { useState, useEffect } from 'react';
import { TimeBlock, Task } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check, 
  Clock, 
  Calendar as CalendarIcon,
  ArrowRight
} from 'lucide-react';
import { TimeBlockModal } from './TimeBlockModal';

interface TimePlannerProps {
  timeBlocks: TimeBlock[];
  tasks: Task[];
  onSaveTimeBlock: (block: TimeBlock) => void;
  onDeleteTimeBlock: (blockId: string) => void;
  onToggleTimeBlockComplete: (blockId: string) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 to 22:00

export const TimePlanner: React.FC<TimePlannerProps> = ({
  timeBlocks,
  tasks,
  onSaveTimeBlock,
  onDeleteTimeBlock,
  onToggleTimeBlockComplete,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [modalDefaultStartTime, setModalDefaultStartTime] = useState<string>('09:00');
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(0);

  // Calculate live current time position in minutes from midnight
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Filter blocks for selected date
  const dayBlocks = timeBlocks.filter((b) => b.date === selectedDate);

  // Helper to convert 'HH:MM' into minutes from 07:00
  const getMinutesFrom7AM = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - 7) * 60 + m;
  };

  const handleOpenAddModal = (startTimeStr?: string) => {
    setEditingBlock(null);
    setModalDefaultStartTime(startTimeStr || '09:00');
    setIsModalOpen(true);
  };

  const handleEditBlock = (block: TimeBlock) => {
    setEditingBlock(block);
    setIsModalOpen(true);
  };

  // Convert minutes into CSS top offset percentage
  const totalDayMinutes = 15 * 60; // 07:00 to 22:00 is 15 hours = 900 minutes
  const currentOffsetPct = ((currentTimeMinutes - 7 * 60) / totalDayMinutes) * 100;

  // Unscheduled sprint tasks
  const unscheduledTasks = tasks.filter(
    (t) => t.status !== 'done' && !dayBlocks.some((b) => b.taskId === t.id)
  );

  return (
    <div className="space-y-6">
      {/* Header Bar: Date Switcher & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isToday
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => changeDateBy(1)}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-neutral-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 text-xs font-mono tabular-nums bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
            />
          </div>
        </div>

        <button
          onClick={() => handleOpenAddModal('10:00')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Time Block</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Visual Timeline Schedule (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-6 shadow-xs relative">
          <div className="relative min-h-[900px]">
            {/* Hour Guidelines */}
            {HOURS.map((hour) => {
              const hourStr = `${String(hour).padStart(2, '0')}:00`;
              return (
                <div
                  key={hour}
                  className="flex items-start h-[60px] border-t border-neutral-100 dark:border-neutral-800/80 group cursor-pointer"
                  onClick={() => handleOpenAddModal(hourStr)}
                  title={`Click to schedule block at ${hourStr}`}
                >
                  <span className="w-16 -mt-2.5 text-xs font-mono tabular-nums text-neutral-400 dark:text-neutral-500 select-none">
                    {hourStr}
                  </span>
                  <div className="flex-1 h-full hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors" />
                </div>
              );
            })}

            {/* Current Time Indicator Red Line (only shown on today) */}
            {isToday && currentOffsetPct >= 0 && currentOffsetPct <= 100 && (
              <div
                className="absolute left-16 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                style={{ top: `${currentOffsetPct}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 ring-4 ring-red-500/20" />
                <span className="ml-2 text-[10px] font-mono tabular-nums text-red-500 bg-white dark:bg-neutral-900 px-1 rounded-sm shadow-xs border border-red-200 dark:border-red-900/60">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            {/* Rendered Time Blocks Overlay */}
            <div className="absolute top-0 left-16 right-0 h-full pointer-events-none">
              {dayBlocks.map((block) => {
                const startMins = getMinutesFrom7AM(block.startTime);
                const endMins = getMinutesFrom7AM(block.endTime);
                const duration = Math.max(20, endMins - startMins);

                const topPx = (startMins / 60) * 60;
                const heightPx = (duration / 60) * 60;

                return (
                  <div
                    key={block.id}
                    onClick={() => handleEditBlock(block)}
                    style={{
                      top: `${Math.max(0, topPx)}px`,
                      height: `${Math.max(34, heightPx - 4)}px`,
                    }}
                    className={`absolute left-2 right-2 rounded-lg p-3 pointer-events-auto cursor-pointer transition-all border shadow-xs hover:shadow-sm ${
                      block.completed
                        ? 'bg-neutral-100 dark:bg-neutral-800/70 border-neutral-300 dark:border-neutral-700 opacity-75'
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 h-full overflow-hidden">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTimeBlockComplete(block.id);
                          }}
                          className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors shrink-0 ${
                            block.completed
                              ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 text-white dark:text-neutral-900'
                              : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-900 dark:hover:border-neutral-100'
                          }`}
                        >
                          {block.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <h4
                            className={`text-xs font-semibold leading-snug truncate ${
                              block.completed
                                ? 'line-through text-neutral-400 dark:text-neutral-500'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {block.title}
                          </h4>

                          {/* Zero-Pill Unboxed Metadata */}
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5 truncate">
                            <span className="font-mono tabular-nums">
                              {block.startTime} – {block.endTime}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{block.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Unscheduled Sprint Tasks Side Drawer (1 col) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Unscheduled Sprint Tasks
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select any active task to block out focused time
            </p>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {unscheduledTasks.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-4 text-center">
                All sprint tasks are scheduled!
              </p>
            ) : (
              unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-2 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <div className="flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimateMinutes}m</span>
                    </div>

                    <button
                      onClick={() => {
                        setEditingBlock(null);
                        setModalDefaultStartTime('14:00');
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 hover:underline"
                    >
                      <span>Schedule</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Time Block Modal */}
      <TimeBlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveTimeBlock}
        onDelete={onDeleteTimeBlock}
        initialBlock={editingBlock}
        selectedDate={selectedDate}
        defaultStartTime={modalDefaultStartTime}
        availableTasks={tasks}
      />
    </div>
  );
};
