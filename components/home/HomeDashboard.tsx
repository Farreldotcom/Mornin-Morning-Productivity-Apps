'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  AlarmClock,
  CheckSquare,
  ChevronRight,
  Cloud,
  CloudRain,
  Coffee,
  Compass,
  ListTodo,
  Sun,
} from 'lucide-react';
import { useMornin } from '@/context/MorninContext';
import { useClock } from '@/hooks/useClock';
import { formatLongDate, getDayOfYear } from '@/utils/dateUtils';
import {
  formatClockParts,
  formatTimeString,
  getDepartureCountdown,
  getGreetingPrefix,
} from '@/utils/timeUtils';
import { getNextEnabledAlarm } from '@/services/alarmService';
import { BREAKFAST_DATABASE } from '@/services/breakfastService';

const DAILY_MOTIVATIONS = [
  'Small steps make great mornings.',
  'A fresh start begins with you.',
  'Make today count.',
  'One thing at a time.',
  'Quiet mornings build steady days.',
  'Start calm, stay clear.',
  'Give today your calmest focus.',
];

export function HomeDashboard() {
  const {
    hydrated,
    user,
    alarms,
    todayTasks,
    checklist,
    daily,
    progress,
    weather,
    updateUser,
    refreshWeather,
  } = useMornin();

  const now = useClock(1000);
  const [editingDeparture, setEditingDeparture] = useState(false);
  const [draftDeparture, setDraftDeparture] = useState(user.departureTime);

  const clock = formatClockParts(now, user.timeFormat);
  const greetingPrefix = getGreetingPrefix(now);
  const displayName = user.name.trim() || 'there';
  const dateLabel = formatLongDate(now);
  const departure = getDepartureCountdown(user.departureTime, now);
  const nextAlarm = getNextEnabledAlarm(alarms, now);

  const completedTasksCount = todayTasks.filter((t) => t.completed).length;
  const validChecklistIds = new Set(checklist.map((i) => i.id));
  const checkedCount = daily.checkedChecklistItemIds.filter((id) =>
    validChecklistIds.has(id)
  ).length;

  const selectedBreakfast = daily.selectedBreakfastId
    ? BREAKFAST_DATABASE.find((b) => b.id === daily.selectedBreakfastId)
    : undefined;

  const motivation =
    DAILY_MOTIVATIONS[getDayOfYear(now) % DAILY_MOTIVATIONS.length];

  const handleOpenDepartureEdit = () => {
    setDraftDeparture(user.departureTime);
    setEditingDeparture(true);
  };

  const handleSaveDeparture = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftDeparture) {
      updateUser({ departureTime: draftDeparture });
    }
    setEditingDeparture(false);
  };

  const renderWeatherIcon = () => {
    const code = weather.code ?? 0;
    if (code >= 51) return <CloudRain className="w-4 h-4 text-[var(--mornin-text-muted)]" />;
    if (code >= 2) return <Cloud className="w-4 h-4 text-[var(--mornin-text-muted)]" />;
    return <Sun className="w-4 h-4 text-[#C5A948]" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 md:space-y-10"
    >
      {/* Top Greeting + Real-Time Clock Hero */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start pt-2">
        <div className="md:col-span-7 space-y-5">
          <div className="space-y-1.5">
            <p className="text-sm text-[var(--mornin-text-muted)]" suppressHydrationWarning>
              {dateLabel}
            </p>
            <h1
              className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--mornin-text)] text-balance"
              suppressHydrationWarning
            >
              {greetingPrefix}, {displayName}.
            </h1>
            <p className="text-sm text-[var(--mornin-text-muted)]">
              {progress.percentage === 100
                ? "You're all set. Have a wonderful day!"
                : 'Ready for a calm and organized start?'}
            </p>
          </div>

          {/* Real-time Digital Clock */}
          <div className="pt-2 pb-1">
            <div className="flex items-baseline gap-2.5 tabular-nums">
              <span
                className="text-6xl sm:text-7xl lg:text-8xl font-medium tracking-tight leading-none text-[var(--mornin-text)]"
                suppressHydrationWarning
              >
                {clock.time}
              </span>
              <div className="flex flex-col text-sm sm:text-base font-medium text-[var(--mornin-text-muted)] leading-tight">
                {clock.period && <span suppressHydrationWarning>{clock.period}</span>}
                <span className="text-xs opacity-75" suppressHydrationWarning>
                  {clock.seconds}s
                </span>
              </div>
            </div>
          </div>

          {/* Compact Weather Summary */}
          <div className="flex items-center gap-2.5 text-sm text-[var(--mornin-text-muted)] pt-1">
            {weather.status === 'ready' && weather.temperatureC !== undefined ? (
              <>
                {renderWeatherIcon()}
                <span className="font-medium text-[var(--mornin-text)] tabular-nums">
                  {weather.temperatureC}°C
                </span>
                <span aria-hidden="true">·</span>
                <span>{weather.condition}</span>
                {weather.highC !== undefined && weather.lowC !== undefined && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      H:{weather.highC}° L:{weather.lowC}°
                    </span>
                  </>
                )}
              </>
            ) : weather.status === 'loading' ? (
              <>
                <Cloud className="w-4 h-4 animate-pulse" />
                <span>Checking local weather…</span>
              </>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <Cloud className="w-4 h-4 shrink-0" />
                <span>Local weather unavailable</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    updateUser({ weatherEnabled: true });
                    void refreshWeather();
                  }}
                  className="text-[var(--mornin-text)] underline underline-offset-4 decoration-[var(--mornin-divider)] hover:decoration-[#E9D58D] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Use current location
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column on Desktop: Time to Leave + Morning Progress */}
        <div className="md:col-span-5 space-y-5">
          {/* Signature Time to Leave Block */}
          <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-[var(--mornin-text-muted)]">
                Time to leave
              </span>
              {!editingDeparture && (
                <button
                  type="button"
                  onClick={handleOpenDepartureEdit}
                  className="text-xs font-medium text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] transition-colors cursor-pointer py-1 px-2 -mr-2 rounded-lg"
                >
                  Edit
                </button>
              )}
            </div>

            {editingDeparture ? (
              <form onSubmit={handleSaveDeparture} className="mt-3 space-y-3">
                <input
                  type="time"
                  value={draftDeparture}
                  onChange={(e) => setDraftDeparture(e.target.value)}
                  aria-label="Planned departure time"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-base tabular-nums text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDeparture(false)}
                    className="min-h-[40px] px-3 text-xs font-medium text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[40px] px-4 rounded-xl bg-[#E9D58D] text-[#242424] text-xs font-semibold hover:bg-[#e1ca78] transition-colors cursor-pointer"
                  >
                    Save time
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div
                  className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-[var(--mornin-text)]"
                  suppressHydrationWarning
                >
                  {formatTimeString(user.departureTime, user.timeFormat)}
                </div>
                <p
                  className={`mt-1.5 text-sm ${
                    departure.status === 'passed'
                      ? 'text-[#C97C72] dark:text-[#D88A80]'
                      : departure.status === 'imminent' || departure.status === 'now'
                      ? 'text-[#9F8220] dark:text-[#E9D58D] font-medium'
                      : 'text-[var(--mornin-text-muted)]'
                  }`}
                  suppressHydrationWarning
                >
                  {departure.label}
                </p>
              </>
            )}
          </div>

          {/* Morning Progress Bar */}
          <div className="rounded-2xl bg-[var(--mornin-bg-secondary)] p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[var(--mornin-text)]">
                {hydrated
                  ? `Your morning is ${progress.percentage}% ready.`
                  : 'Loading your morning…'}
              </span>
              <span className="text-xs font-medium tabular-nums text-[var(--mornin-text-muted)]">
                {hydrated ? `${progress.percentage}%` : '—'}
              </span>
            </div>
            <div
              className="mt-3 h-2 w-full rounded-full bg-[var(--mornin-divider)] overflow-hidden"
              role="progressbar"
              aria-valuenow={hydrated ? progress.percentage : 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Morning readiness progress"
            >
              <div
                className="h-full rounded-full bg-[#E9D58D] transition-all duration-300 ease-out"
                style={{ width: `${hydrated ? progress.percentage : 0}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs text-[var(--mornin-text-muted)]">
              Based on wake-up alarm, daily tasks, breakfast, and essentials.
            </p>
          </div>
        </div>
      </section>

      {/* Today's Overview — Clean Hairline Rows */}
      <section aria-labelledby="overview-heading">
        <div className="flex items-baseline justify-between mb-3">
          <h2
            id="overview-heading"
            className="text-base font-medium text-[var(--mornin-text)]"
          >
            Today&apos;s Overview
          </h2>
          <span className="text-xs text-[var(--mornin-text-muted)]">
            {progress.completedPillars} of {progress.totalPillars} completed
          </span>
        </div>

        <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] divide-y divide-[var(--mornin-divider)] overflow-hidden">
          <Link
            href="/alarm"
            className="min-h-[60px] px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--mornin-bg-secondary)]/50 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <AlarmClock className="w-[18px] h-[18px] text-[var(--mornin-text-muted)] shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--mornin-text)]">
                  Next Alarm
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)] truncate">
                  {nextAlarm
                    ? `${formatTimeString(nextAlarm.alarm.time, user.timeFormat)} · ${
                        nextAlarm.dayLabel
                      }${nextAlarm.alarm.label ? ` · ${nextAlarm.alarm.label}` : ''}`
                    : 'No active alarm scheduled'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-[var(--mornin-text-muted)]">
                {daily.alarmDismissed ? 'Awake' : nextAlarm ? 'Scheduled' : 'Off'}
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--mornin-text-muted)]" />
            </div>
          </Link>

          <Link
            href="/my-day"
            className="min-h-[60px] px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--mornin-bg-secondary)]/50 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <ListTodo className="w-[18px] h-[18px] text-[var(--mornin-text-muted)] shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--mornin-text)]">
                  My Day
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)] truncate tabular-nums">
                  {todayTasks.length === 0
                    ? 'No tasks planned for today'
                    : `${completedTasksCount} of ${todayTasks.length} tasks completed`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium tabular-nums text-[var(--mornin-text-muted)]">
                {todayTasks.length - completedTasksCount > 0
                  ? `${todayTasks.length - completedTasksCount} left`
                  : todayTasks.length > 0
                  ? 'Done'
                  : 'Add'}
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--mornin-text-muted)]" />
            </div>
          </Link>

          <Link
            href="/breakfast"
            className="min-h-[60px] px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--mornin-bg-secondary)]/50 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Coffee className="w-[18px] h-[18px] text-[var(--mornin-text-muted)] shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--mornin-text)]">
                  Breakfast
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)] truncate">
                  {daily.breakfastCompleted
                    ? selectedBreakfast
                      ? `Completed · ${selectedBreakfast.name}`
                      : 'Completed for today'
                    : 'Discover a quick morning meal'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-medium ${
                  daily.breakfastCompleted
                    ? 'text-[#7D9B7B] dark:text-[#8FAE8D]'
                    : 'text-[var(--mornin-text-muted)]'
                }`}
              >
                {daily.breakfastCompleted ? 'Done' : 'Pending'}
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--mornin-text-muted)]" />
            </div>
          </Link>

          <Link
            href="/checklist"
            className="min-h-[60px] px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--mornin-bg-secondary)]/50 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <CheckSquare className="w-[18px] h-[18px] text-[var(--mornin-text-muted)] shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--mornin-text)]">
                  Don&apos;t Forget
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)] truncate tabular-nums">
                  {checklist.length === 0
                    ? 'No essentials listed'
                    : `${checkedCount} of ${checklist.length} essentials checked`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-medium tabular-nums ${
                  checklist.length > 0 && checkedCount === checklist.length
                    ? 'text-[#7D9B7B] dark:text-[#8FAE8D]'
                    : 'text-[var(--mornin-text-muted)]'
                }`}
              >
                {checklist.length > 0 && checkedCount === checklist.length
                  ? 'All set'
                  : `${checklist.length - checkedCount} left`}
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--mornin-text-muted)]" />
            </div>
          </Link>

          <button
            type="button"
            onClick={handleOpenDepartureEdit}
            className="w-full min-h-[60px] px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--mornin-bg-secondary)]/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Compass className="w-[18px] h-[18px] text-[var(--mornin-text-muted)] shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--mornin-text)]">
                  Planned Departure
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)] truncate" suppressHydrationWarning>
                  {formatTimeString(user.departureTime, user.timeFormat)} · {departure.label}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-[var(--mornin-text-muted)]">
                Adjust
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--mornin-text-muted)]" />
            </div>
          </button>
        </div>
      </section>

      {/* Quiet Daily Motivation */}
      <footer className="pt-2 pb-4 text-center">
        <p className="text-xs text-[var(--mornin-text-muted)] italic">
          &ldquo;{motivation}&rdquo;
        </p>
      </footer>
    </motion.div>
  );
}
