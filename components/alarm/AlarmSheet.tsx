'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Trash2, X } from 'lucide-react';
import type {
  AlarmItem,
  ChallengeDifficulty,
  ChallengeType,
  SnoozeDuration,
} from '@/types';
import { DAY_INITIALS } from '@/utils/dateUtils';

interface AlarmSheetProps {
  open: boolean;
  editingAlarm: AlarmItem | null;
  defaultSnooze: SnoozeDuration;
  onClose: () => void;
  onSave: (data: Omit<AlarmItem, 'id'>) => void;
  onDelete?: (id: string) => void;
}

const CHALLENGE_TYPES: Array<{ value: ChallengeType; label: string }> = [
  { value: 'math', label: 'Math' },
  { value: 'memory', label: 'Memory' },
  { value: 'pattern', label: 'Pattern' },
];

const DIFFICULTIES: Array<{ value: ChallengeDifficulty; label: string }> = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const SNOOZE_OPTIONS: SnoozeDuration[] = [5, 10, 15];

function AlarmSheetForm({
  editingAlarm,
  defaultSnooze,
  onClose,
  onSave,
  onDelete,
}: Omit<AlarmSheetProps, 'open'>) {
  const [time, setTime] = useState(editingAlarm?.time ?? '06:30');
  const [label, setLabel] = useState(editingAlarm?.label ?? 'Morning Routine');
  const [repeatDays, setRepeatDays] = useState<number[]>(
    editingAlarm?.repeatDays ?? [1, 2, 3, 4, 5]
  );
  const [challengeType, setChallengeType] = useState<ChallengeType>(
    editingAlarm?.challengeType ?? 'math'
  );
  const [challengeDifficulty, setChallengeDifficulty] =
    useState<ChallengeDifficulty>(editingAlarm?.challengeDifficulty ?? 'easy');
  const [snoozeDuration, setSnoozeDuration] = useState<SnoozeDuration>(
    editingAlarm?.snoozeDuration ?? defaultSnooze
  );

  const toggleDay = (dayIdx: number) => {
    setRepeatDays((prev) =>
      prev.includes(dayIdx)
        ? prev.filter((d) => d !== dayIdx)
        : [...prev, dayIdx].sort((a, b) => a - b)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;
    onSave({
      time,
      label: label.trim() || 'Alarm',
      repeatDays,
      enabled: editingAlarm ? editingAlarm.enabled : true,
      challengeType,
      challengeDifficulty,
      snoozeDuration,
      snoozedUntil: null,
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
          {editingAlarm ? 'Edit Alarm' : 'Add Alarm'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alarm editor"
          className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div>
          <label
            htmlFor="alarm-time-input"
            className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-2"
          >
            Time
          </label>
          <input
            id="alarm-time-input"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full min-h-[56px] px-4 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-3xl font-medium tabular-nums text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
          />
        </div>

        <div>
          <label
            htmlFor="alarm-label-input"
            className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-2"
          >
            Label
          </label>
          <input
            id="alarm-label-input"
            type="text"
            maxLength={40}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Morning Routine"
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
          />
        </div>

        <div>
          <span className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-2">
            Repeat
          </span>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_INITIALS.map((initial, idx) => {
              const active = repeatDays.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`min-h-[42px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#E9D58D] text-[#242424]'
                      : 'bg-[var(--mornin-bg-secondary)] text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
                  }`}
                >
                  {initial}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-2">
            Wake-up Challenge
          </span>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--mornin-bg-secondary)]">
            {CHALLENGE_TYPES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setChallengeType(item.value)}
                className={`min-h-[38px] rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  challengeType === item.value
                    ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                    : 'text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-2">
              Difficulty
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[var(--mornin-bg-secondary)]">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setChallengeDifficulty(d.value)}
                  className={`min-h-[36px] rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    challengeDifficulty === d.value
                      ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                      : 'text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-2">
              Snooze
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[var(--mornin-bg-secondary)]">
              {SNOOZE_OPTIONS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSnoozeDuration(mins)}
                  className={`min-h-[36px] rounded-lg text-[11px] font-medium tabular-nums transition-colors cursor-pointer ${
                    snoozeDuration === mins
                      ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                      : 'text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          {editingAlarm && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(editingAlarm.id);
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
            Save Alarm
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export function AlarmSheet({
  open,
  editingAlarm,
  defaultSnooze,
  onClose,
  onSave,
  onDelete,
}: AlarmSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingAlarm ? 'Edit alarm' : 'New alarm'}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-black/35 backdrop-blur-xs"
            onClick={onClose}
          />
          <AlarmSheetForm
            key={editingAlarm?.id ?? 'new'}
            editingAlarm={editingAlarm}
            defaultSnooze={defaultSnooze}
            onClose={onClose}
            onSave={onSave}
            onDelete={onDelete}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
