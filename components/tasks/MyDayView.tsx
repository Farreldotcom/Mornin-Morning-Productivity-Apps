'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMornin } from '@/context/MorninContext';
import type { TaskFilter, TaskItem } from '@/types';
import { formatLongDate } from '@/utils/dateUtils';
import { formatTimeString } from '@/utils/timeUtils';
import { TaskSheet } from '@/components/tasks/TaskSheet';

const FILTERS: Array<{ value: TaskFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export function MyDayView() {
  const {
    todayTasks,
    user,
    addTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
  } = useMornin();

  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const remainingCount = todayTasks.length - completedCount;
  const pct =
    todayTasks.length === 0
      ? 0
      : Math.round((completedCount / todayTasks.length) * 100);

  const filteredTasks = useMemo(() => {
    if (filter === 'pending') return todayTasks.filter((t) => !t.completed);
    if (filter === 'completed') return todayTasks.filter((t) => t.completed);
    return todayTasks;
  }, [todayTasks, filter]);

  const openCreate = () => {
    setEditingTask(null);
    setSheetOpen(true);
  };

  const openEdit = (task: TaskItem) => {
    setEditingTask(task);
    setSheetOpen(true);
  };

  const handleSave = (data: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <p className="text-xs text-[var(--mornin-text-muted)]" suppressHydrationWarning>
            {formatLongDate()}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-medium tracking-tight text-[var(--mornin-text)]">
            My Day
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E9D58D] text-[#242424] text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[#e1ca78] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Progress & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--mornin-text-muted)] tabular-nums">
            <span>
              {completedCount} of {todayTasks.length} completed
            </span>
            <span>{remainingCount} remaining</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--mornin-divider)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#E9D58D] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Filter tasks"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--mornin-bg-secondary)] self-start sm:self-auto"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`min-h-[36px] px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filter === f.value
                  ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                  : 'text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] p-10 text-center">
          <p className="text-base font-medium text-[var(--mornin-text)]">
            {todayTasks.length === 0
              ? 'Your day is open'
              : filter === 'pending'
              ? 'All tasks completed'
              : 'No completed tasks yet'}
          </p>
          <p className="mt-1.5 text-sm text-[var(--mornin-text-muted)]">
            {todayTasks.length === 0
              ? 'Add a few priorities to keep your morning focused.'
              : 'Switch filters or add another priority.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] divide-y divide-[var(--mornin-divider)] overflow-hidden">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="px-4 sm:px-5 py-3.5 flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleTaskComplete(task.id)}
                  aria-label={
                    task.completed
                      ? `Mark "${task.title}" incomplete`
                      : `Mark "${task.title}" complete`
                  }
                  className="min-h-[44px] min-w-[44px] -ml-2 -mt-1.5 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <span
                    className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-[#7D9B7B] border-[#7D9B7B] text-white'
                        : 'border-[#C6C5BE] dark:border-[#55554F] hover:border-[#242424] dark:hover:border-[#E9D58D]'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(task)}
                  className="flex-1 min-w-0 text-left py-0.5 cursor-pointer"
                >
                  <div
                    className={`text-[15px] font-medium leading-snug transition-colors ${
                      task.completed
                        ? 'line-through text-[var(--mornin-text-muted)]'
                        : 'text-[var(--mornin-text)]'
                    }`}
                  >
                    {task.title}
                  </div>

                  {task.description && (
                    <p className="mt-0.5 text-xs text-[var(--mornin-text-muted)] line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--mornin-text-muted)] flex-wrap">
                    <span>{task.category}</span>
                    {task.dueTime && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {formatTimeString(task.dueTime, user.timeFormat)}
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        task.priority === 'High' && !task.completed
                          ? 'text-[#C97C72] dark:text-[#D88A80] font-medium'
                          : ''
                      }
                    >
                      {task.priority} priority
                    </span>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(task)}
                  aria-label={`Edit ${task.title}`}
                  className="min-h-[44px] min-w-[40px] flex items-center justify-center rounded-xl text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                  className="min-h-[44px] min-w-[40px] flex items-center justify-center rounded-xl text-[var(--mornin-text-muted)] hover:text-[#C97C72] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskSheet
        open={sheetOpen}
        editingTask={editingTask}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
        onDelete={deleteTask}
      />
    </motion.div>
  );
}
