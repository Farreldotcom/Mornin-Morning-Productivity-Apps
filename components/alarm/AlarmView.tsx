'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Plus } from 'lucide-react';
import { useMornin } from '@/context/MorninContext';
import { useClock } from '@/hooks/useClock';
import type { AlarmItem } from '@/types';
import { formatRepeatDays } from '@/utils/dateUtils';
import { formatTimeString } from '@/utils/timeUtils';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';
import { AlarmSheet } from '@/components/alarm/AlarmSheet';

export function AlarmView() {
  const {
    alarms,
    user,
    addAlarm,
    updateAlarm,
    toggleAlarm,
    deleteAlarm,
    simulateAlarm,
  } = useMornin();

  const now = useClock(10000);
  const nowMs = now.getTime();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<AlarmItem | null>(null);

  const openCreate = () => {
    setEditingAlarm(null);
    setSheetOpen(true);
  };

  const openEdit = (alarm: AlarmItem) => {
    setEditingAlarm(alarm);
    setSheetOpen(true);
  };

  const handleSave = (data: Omit<AlarmItem, 'id'>) => {
    if (editingAlarm) {
      updateAlarm(editingAlarm.id, data);
    } else {
      addAlarm(data);
    }
  };

  const challengeLabel = (type: AlarmItem['challengeType']) => {
    if (type === 'math') return 'Math challenge';
    if (type === 'memory') return 'Memory match';
    return 'Pattern recognition';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--mornin-text)]">
            Alarm
          </h1>
          <p className="mt-1 text-sm text-[var(--mornin-text-muted)]">
            Wake up actively with a quick morning challenge.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E9D58D] text-[#242424] text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[#e1ca78] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Alarm
        </button>
      </div>

      {alarms.length === 0 ? (
        <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] p-10 text-center">
          <p className="text-base font-medium text-[var(--mornin-text)]">
            No alarms yet
          </p>
          <p className="mt-1.5 text-sm text-[var(--mornin-text-muted)]">
            Add a wake-up alarm and choose a math, memory, or pattern challenge.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-5 min-h-[44px] px-5 py-2 rounded-xl bg-[#E9D58D] text-[#242424] text-sm font-semibold hover:bg-[#e1ca78] transition-colors cursor-pointer"
          >
            Create First Alarm
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] divide-y divide-[var(--mornin-divider)] overflow-hidden">
          {alarms.map((alarm) => {
            const formatted = formatTimeString(alarm.time, user.timeFormat);
            const [timeMain, timePeriod] = formatted.split(' ');
            const isSnoozed =
              typeof alarm.snoozedUntil === 'number' && alarm.snoozedUntil > nowMs;

            return (
              <div
                key={alarm.id}
                className={`px-5 py-4 flex items-center justify-between gap-4 transition-opacity ${
                  alarm.enabled ? 'opacity-100' : 'opacity-65'
                }`}
              >
                <button
                  type="button"
                  onClick={() => openEdit(alarm)}
                  className="flex-1 min-w-0 text-left cursor-pointer py-1"
                >
                  <div className="flex items-baseline gap-1.5 tabular-nums">
                    <span className="text-3xl sm:text-4xl font-medium tracking-tight text-[var(--mornin-text)]">
                      {timeMain}
                    </span>
                    {timePeriod && (
                      <span className="text-sm font-medium text-[var(--mornin-text-muted)]">
                        {timePeriod}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--mornin-text-muted)] flex-wrap">
                    <span className="font-medium text-[var(--mornin-text)]">
                      {alarm.label || 'Alarm'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatRepeatDays(alarm.repeatDays)}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {challengeLabel(alarm.challengeType)} ({alarm.challengeDifficulty})
                    </span>
                  </div>
                  {isSnoozed && alarm.snoozedUntil && (
                    <p className="mt-1 text-xs font-medium text-[#9F8220] dark:text-[#E9D58D]">
                      Snoozed until{' '}
                      {new Date(alarm.snoozedUntil).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => simulateAlarm(alarm)}
                    title="Test alarm now"
                    aria-label={`Test ${alarm.label || 'alarm'} now`}
                    className="min-h-[44px] px-3 rounded-xl text-xs font-medium text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] hover:bg-[var(--mornin-bg-secondary)] inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Test Alarm</span>
                    <span className="sm:hidden">Test</span>
                  </button>

                  <ToggleSwitch
                    checked={alarm.enabled}
                    onChange={() => toggleAlarm(alarm.id)}
                    ariaLabel={`Toggle ${alarm.label || 'alarm'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs leading-relaxed text-[var(--mornin-text-muted)]">
        Web alarms trigger reliably while MORNIN is open in your browser. Use{' '}
        <span className="font-medium text-[var(--mornin-text)]">Test Alarm</span> anytime to
        preview the chime and wake-up challenge.
      </p>

      <AlarmSheet
        open={sheetOpen}
        editingAlarm={editingAlarm}
        defaultSnooze={user.defaultSnoozeDuration}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
        onDelete={deleteAlarm}
      />
    </motion.div>
  );
}
