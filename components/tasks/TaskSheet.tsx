'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Trash2, X } from 'lucide-react';
import type { TaskCategory, TaskItem, TaskPriority } from '@/types';
import { getTodayKey } from '@/utils/dateUtils';

interface TaskSheetProps {
  open: boolean;
  editingTask: TaskItem | null;
  onClose: () => void;
  onSave: (data: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES: TaskCategory[] = ['Study', 'Work', 'Personal', 'Health', 'Other'];
const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];

function TaskSheetForm({
  editingTask,
  onClose,
  onSave,
  onDelete,
}: Omit<TaskSheetProps, 'open'>) {
  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(editingTask?.description ?? '');
  const [category, setCategory] = useState<TaskCategory>(
    editingTask?.category ?? 'Personal'
  );
  const [priority, setPriority] = useState<TaskPriority>(
    editingTask?.priority ?? 'Medium'
  );
  const [date, setDate] = useState(editingTask?.date || getTodayKey());
  const [dueTime, setDueTime] = useState(editingTask?.dueTime ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a task title.');
      return;
    }
    onSave({
      title: trimmed,
      description: description.trim(),
      category,
      priority,
      date: date || getTodayKey(),
      dueTime,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] p-6 pb-8 sm:pb-6 shadow-xl max-h-[90vh] overflow-y-auto"
    >
      <div className="sm:hidden w-10 h-1 bg-[var(--mornin-divider)] rounded-full mx-auto mb-4" />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--mornin-text)]">
          {editingTask ? 'Edit Task' : 'New Task'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close task form"
          className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="task-title-input"
            className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5"
          >
            Task title
          </label>
          <input
            id="task-title-input"
            type="text"
            autoFocus
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder="What needs your focus today?"
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
          />
          {error && (
            <p className="mt-1.5 text-xs text-[#C97C72] dark:text-[#D88A80]">
              {error}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="task-desc-input"
            className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5"
          >
            Notes (optional)
          </label>
          <textarea
            id="task-desc-input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add helpful context..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D] resize-none"
          />
        </div>

        <div>
          <span className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5">
            Category
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-[#E9D58D] text-[#242424] font-semibold'
                    : 'bg-[var(--mornin-bg-secondary)] text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5">
            Priority
          </span>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--mornin-bg-secondary)]">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`min-h-[36px] rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  priority === p
                    ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                    : 'text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="task-date-input"
              className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5"
            >
              Date
            </label>
            <input
              id="task-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm tabular-nums text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
            />
          </div>
          <div>
            <label
              htmlFor="task-time-input"
              className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5"
            >
              Time (optional)
            </label>
            <input
              id="task-time-input"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm tabular-nums text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          {editingTask && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(editingTask.id);
                onClose();
              }}
              className="min-h-[44px] px-3.5 inline-flex items-center gap-1.5 text-sm font-medium text-[#C97C72] dark:text-[#D88A80] hover:bg-[#C97C72]/10 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="min-h-[46px] px-6 rounded-xl bg-[#E9D58D] text-[#242424] text-sm font-semibold hover:bg-[#e1ca78] transition-colors cursor-pointer"
          >
            Save Task
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export function TaskSheet({
  open,
  editingTask,
  onClose,
  onSave,
  onDelete,
}: TaskSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingTask ? 'Edit task' : 'Add task'}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-black/35 backdrop-blur-xs"
            onClick={onClose}
          />
          <TaskSheetForm
            key={editingTask?.id ?? 'new'}
            editingTask={editingTask}
            onClose={onClose}
            onSave={onSave}
            onDelete={onDelete}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
