'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AlarmItem,
  ChecklistCategory,
  ChecklistItem,
  DailyProgress,
  TaskItem,
  UserProfile,
  WeatherInfo,
} from '@/types';
import {
  clearAllAppStorage,
  createDefaultChecklistItems,
  createDefaultDailyProgress,
  createDefaultUser,
  hydrateInitialState,
  STORAGE_KEYS,
  writeStorage,
} from '@/services/storageService';
import { alarmAudioService } from '@/services/alarmAudioService';
import { sendAlarmNotification } from '@/services/alarmService';
import { fetchLocalWeather } from '@/services/weatherService';
import { getTodayKey } from '@/utils/dateUtils';
import { getCurrentHHMM } from '@/utils/timeUtils';
import {
  calculateMorningProgress,
  type MorningProgressBreakdown,
} from '@/utils/progressUtils';

interface MorninContextValue {
  hydrated: boolean;
  user: UserProfile;
  alarms: AlarmItem[];
  tasks: TaskItem[];
  todayTasks: TaskItem[];
  checklist: ChecklistItem[];
  daily: DailyProgress;
  progress: MorningProgressBreakdown;
  weather: WeatherInfo;
  ringingAlarm: AlarmItem | null;
  alarmAudioBlocked: boolean;

  updateUser: (patch: Partial<UserProfile>) => void;
  refreshWeather: () => Promise<void>;

  addAlarm: (alarm: Omit<AlarmItem, 'id'>) => void;
  updateAlarm: (id: string, patch: Partial<AlarmItem>) => void;
  toggleAlarm: (id: string) => void;
  deleteAlarm: (id: string) => void;
  simulateAlarm: (alarm: AlarmItem) => void;
  snoozeRingingAlarm: () => void;
  completeRingingAlarm: () => void;
  unlockRingingAudio: () => void;

  addTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, patch: Partial<TaskItem>) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;

  addChecklistItem: (name: string, category: ChecklistCategory) => void;
  updateChecklistItem: (id: string, patch: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;
  toggleChecklistChecked: (id: string) => void;
  resetTodayChecklist: () => void;
  restoreDefaultChecklist: () => void;

  markBreakfastComplete: (breakfastId: string) => void;
  resetBreakfastToday: () => void;

  resetTodayProgress: () => void;
  resetAllData: () => void;
}

const MorninContext = createContext<MorninContextValue | null>(null);

export function MorninProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<UserProfile>(() => createDefaultUser());
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [daily, setDaily] = useState<DailyProgress>(() => createDefaultDailyProgress());
  const [weather, setWeather] = useState<WeatherInfo>({ status: 'unavailable' });

  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);
  const [alarmAudioBlocked, setAlarmAudioBlocked] = useState(false);

  // Hydrate asynchronously after mount to keep SSR/CSR markup aligned and avoid cascading effect warnings
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      const initial = hydrateInitialState();
      setUser(initial.user);
      setAlarms(initial.alarms);
      setTasks(initial.tasks);
      setChecklist(initial.checklist);
      setDaily(initial.daily);
      setHydrated(true);

      if (initial.user.weatherEnabled) {
        void fetchLocalWeather().then((result) => {
          if (!cancelled) setWeather(result);
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (!hydrated || typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', user.theme === 'dark');
  }, [hydrated, user.theme]);

  // Persist slices when hydrated
  useEffect(() => {
    if (!hydrated) return;
    writeStorage(STORAGE_KEYS.USER, user);
  }, [hydrated, user]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(STORAGE_KEYS.ALARMS, alarms);
  }, [hydrated, alarms]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(STORAGE_KEYS.TASKS, tasks);
  }, [hydrated, tasks]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(STORAGE_KEYS.CHECKLIST, checklist);
  }, [hydrated, checklist]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(STORAGE_KEYS.DAILY, daily);
  }, [hydrated, daily]);

  const refreshWeather = useCallback(async () => {
    setWeather({ status: 'loading' });
    const result = await fetchLocalWeather();
    setWeather(result);
  }, []);

  const triggerAlarmNow = useCallback((alarm: AlarmItem) => {
    setRingingAlarm(alarm);
    const started = alarmAudioService.start();
    setAlarmAudioBlocked(!started);
    sendAlarmNotification(alarm);
  }, []);

  // Real-time browser alarm scheduler
  useEffect(() => {
    if (!hydrated) return;

    const checkAlarms = () => {
      if (ringingAlarm) return;

      const now = new Date();
      const todayKey = getTodayKey(now);
      const currentHHMM = getCurrentHHMM(now);
      const minuteStamp = `${todayKey} ${currentHHMM}`;
      const dayOfWeek = now.getDay();

      if (daily.date !== todayKey) {
        setDaily(createDefaultDailyProgress(todayKey));
      }

      const snoozedMatch = alarms.find(
        (a) => a.enabled && a.snoozedUntil && Date.now() >= a.snoozedUntil
      );
      if (snoozedMatch) {
        setAlarms((prev) =>
          prev.map((a) => (a.id === snoozedMatch.id ? { ...a, snoozedUntil: null } : a))
        );
        triggerAlarmNow(snoozedMatch);
        return;
      }

      if (daily.lastDismissedAlarmMinute === minuteStamp) return;

      const scheduledMatch = alarms.find((a) => {
        if (!a.enabled) return false;
        if (a.time !== currentHHMM) return false;
        if (a.repeatDays.length > 0 && !a.repeatDays.includes(dayOfWeek)) return false;
        return true;
      });

      if (scheduledMatch) {
        setDaily((prev) => ({
          ...prev,
          lastDismissedAlarmMinute: minuteStamp,
        }));
        triggerAlarmNow(scheduledMatch);
      }
    };

    const interval = window.setInterval(checkAlarms, 1000);
    return () => window.clearInterval(interval);
  }, [hydrated, alarms, daily.date, daily.lastDismissedAlarmMinute, ringingAlarm, triggerAlarmNow]);

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...patch }));
    if (patch.weatherEnabled === false) {
      setWeather({ status: 'unavailable' });
    }
  }, []);

  const addAlarm = useCallback((alarm: Omit<AlarmItem, 'id'>) => {
    const newAlarm: AlarmItem = {
      ...alarm,
      id: `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setAlarms((prev) => [...prev, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
  }, []);

  const updateAlarm = useCallback((id: string, patch: Partial<AlarmItem>) => {
    setAlarms((prev) =>
      prev
        .map((a) => (a.id === id ? { ...a, ...patch } : a))
        .sort((a, b) => a.time.localeCompare(b.time))
    );
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled, snoozedUntil: null } : a))
    );
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const simulateAlarm = useCallback(
    (alarm: AlarmItem) => {
      triggerAlarmNow(alarm);
    },
    [triggerAlarmNow]
  );

  const snoozeRingingAlarm = useCallback(() => {
    if (!ringingAlarm) return;
    alarmAudioService.stop();
    const snoozeMs = (ringingAlarm.snoozeDuration || 5) * 60 * 1000;
    const snoozedUntil = Date.now() + snoozeMs;
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === ringingAlarm.id ? { ...a, snoozedUntil, enabled: true } : a
      )
    );
    setRingingAlarm(null);
  }, [ringingAlarm]);

  const completeRingingAlarm = useCallback(() => {
    alarmAudioService.stop();
    if (ringingAlarm && ringingAlarm.repeatDays.length === 0) {
      setAlarms((prev) =>
        prev.map((a) => (a.id === ringingAlarm.id ? { ...a, snoozedUntil: null } : a))
      );
    }
    setDaily((prev) => ({
      ...prev,
      alarmDismissed: true,
    }));
    setRingingAlarm(null);
  }, [ringingAlarm]);

  const unlockRingingAudio = useCallback(() => {
    const ok = alarmAudioService.start();
    setAlarmAudioBlocked(!ok);
  }, []);

  const addTask = useCallback(
    (task: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => {
      const newTask: TaskItem = {
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    []
  );

  const updateTask = useCallback((id: string, patch: Partial<TaskItem>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addChecklistItem = useCallback((name: string, category: ChecklistCategory) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const item: ChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      category,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    setChecklist((prev) => [...prev, item]);
  }, []);

  const updateChecklistItem = useCallback((id: string, patch: Partial<ChecklistItem>) => {
    setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const deleteChecklistItem = useCallback((id: string) => {
    setChecklist((prev) => prev.filter((i) => i.id !== id));
    setDaily((prev) => ({
      ...prev,
      checkedChecklistItemIds: prev.checkedChecklistItemIds.filter((cid) => cid !== id),
    }));
  }, []);

  const toggleChecklistChecked = useCallback((id: string) => {
    setDaily((prev) => {
      const exists = prev.checkedChecklistItemIds.includes(id);
      return {
        ...prev,
        checkedChecklistItemIds: exists
          ? prev.checkedChecklistItemIds.filter((cid) => cid !== id)
          : [...prev.checkedChecklistItemIds, id],
      };
    });
  }, []);

  const resetTodayChecklist = useCallback(() => {
    setDaily((prev) => ({
      ...prev,
      checkedChecklistItemIds: [],
    }));
  }, []);

  const restoreDefaultChecklist = useCallback(() => {
    const defaults = createDefaultChecklistItems();
    setChecklist((prev) => {
      const customOnly = prev.filter((item) => !item.isDefault);
      return [...defaults, ...customOnly];
    });
  }, []);

  const markBreakfastComplete = useCallback((breakfastId: string) => {
    setDaily((prev) => ({
      ...prev,
      breakfastCompleted: true,
      selectedBreakfastId: breakfastId,
    }));
  }, []);

  const resetBreakfastToday = useCallback(() => {
    setDaily((prev) => ({
      ...prev,
      breakfastCompleted: false,
    }));
  }, []);

  const resetTodayProgress = useCallback(() => {
    const todayKey = getTodayKey();
    setDaily(createDefaultDailyProgress(todayKey));
    setTasks((prev) =>
      prev.map((t) => (t.date === todayKey ? { ...t, completed: false } : t))
    );
  }, []);

  const resetAllData = useCallback(() => {
    alarmAudioService.stop();
    setRingingAlarm(null);
    const fresh = clearAllAppStorage();
    setUser(fresh.user);
    setAlarms(fresh.alarms);
    setTasks(fresh.tasks);
    setChecklist(fresh.checklist);
    setDaily(fresh.daily);
    setWeather({ status: 'unavailable' });
  }, []);

  const todayKey = getTodayKey();
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.date === todayKey || !t.date),
    [tasks, todayKey]
  );

  const progress = useMemo(
    () => calculateMorningProgress(daily, todayTasks, checklist),
    [daily, todayTasks, checklist]
  );

  const value: MorninContextValue = {
    hydrated,
    user,
    alarms,
    tasks,
    todayTasks,
    checklist,
    daily,
    progress,
    weather,
    ringingAlarm,
    alarmAudioBlocked,
    updateUser,
    refreshWeather,
    addAlarm,
    updateAlarm,
    toggleAlarm,
    deleteAlarm,
    simulateAlarm,
    snoozeRingingAlarm,
    completeRingingAlarm,
    unlockRingingAudio,
    addTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    toggleChecklistChecked,
    resetTodayChecklist,
    restoreDefaultChecklist,
    markBreakfastComplete,
    resetBreakfastToday,
    resetTodayProgress,
    resetAllData,
  };

  return <MorninContext.Provider value={value}>{children}</MorninContext.Provider>;
}

export function useMornin() {
  const ctx = useContext(MorninContext);
  if (!ctx) {
    throw new Error('useMornin must be used within a MorninProvider');
  }
  return ctx;
}
