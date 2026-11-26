import type {
  AlarmItem,
  ChecklistItem,
  DailyProgress,
  TaskItem,
  UserProfile,
} from '@/types';
import { getTodayKey } from '@/utils/dateUtils';

export const STORAGE_KEYS = {
  SEEDED: 'mornin_seeded_v1',
  USER: 'mornin_user_v1',
  ALARMS: 'mornin_alarms_v1',
  TASKS: 'mornin_tasks_v1',
  CHECKLIST: 'mornin_checklist_v1',
  DAILY: 'mornin_daily_v1',
} as const;

export function createDefaultUser(): UserProfile {
  return {
    id: 'local-user-1',
    name: 'Farrel',
    email: '',
    avatarDataUrl: undefined,
    preferredWakeUpTime: '06:00',
    departureTime: '07:30',
    timeFormat: '12h',
    defaultSnoozeDuration: 5,
    theme: 'light',
    remindersEnabled: false,
    weatherEnabled: false,
  };
}

export function createDefaultAlarms(): AlarmItem[] {
  return [
    {
      id: 'alarm-morning-routine',
      time: '06:00',
      label: 'Morning Routine',
      repeatDays: [1, 2, 3, 4, 5],
      enabled: true,
      challengeType: 'math',
      challengeDifficulty: 'easy',
      snoozeDuration: 5,
      snoozedUntil: null,
    },
  ];
}

export function createDefaultTasks(todayKey: string = getTodayKey()): TaskItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'task-1',
      title: "Review today's schedule",
      description: 'Look over morning priorities and calendar blocks.',
      date: todayKey,
      dueTime: '07:00',
      category: 'Work',
      priority: 'High',
      completed: false,
      createdAt: now,
    },
    {
      id: 'task-2',
      title: 'Attend university class',
      description: 'Bring notebook and review lecture notes beforehand.',
      date: todayKey,
      dueTime: '08:30',
      category: 'Study',
      priority: 'High',
      completed: false,
      createdAt: now,
    },
    {
      id: 'task-3',
      title: 'Complete project assignment',
      description: 'Finish draft sections and verify deliverables.',
      date: todayKey,
      dueTime: '13:00',
      category: 'Study',
      priority: 'Medium',
      completed: false,
      createdAt: now,
    },
    {
      id: 'task-4',
      title: 'Check emails',
      description: 'Respond to urgent messages and clear inbox.',
      date: todayKey,
      dueTime: '10:30',
      category: 'Work',
      priority: 'Low',
      completed: false,
      createdAt: now,
    },
    {
      id: 'task-5',
      title: 'Exercise',
      description: '30 minutes of brisk walking or light stretching.',
      date: todayKey,
      dueTime: '17:30',
      category: 'Health',
      priority: 'Medium',
      completed: false,
      createdAt: now,
    },
  ];
}

export function createDefaultChecklistItems(): ChecklistItem[] {
  const now = new Date().toISOString();
  const items: Array<{ id: string; name: string; category: ChecklistItem['category'] }> = [
    { id: 'chk-smartphone', name: 'Smartphone', category: 'Essentials' },
    { id: 'chk-wallet', name: 'Wallet', category: 'Essentials' },
    { id: 'chk-keys', name: 'House Keys', category: 'Essentials' },
    { id: 'chk-id-card', name: 'ID Card', category: 'Essentials' },
    { id: 'chk-laptop', name: 'Laptop', category: 'Electronics' },
    { id: 'chk-charger', name: 'Charger', category: 'Electronics' },
    { id: 'chk-earphones', name: 'Earphones', category: 'Electronics' },
    { id: 'chk-powerbank', name: 'Power Bank', category: 'Electronics' },
    { id: 'chk-notebook', name: 'Notebook', category: 'Work & Study' },
    { id: 'chk-pen', name: 'Pen', category: 'Work & Study' },
    { id: 'chk-documents', name: 'Documents', category: 'Work & Study' },
    { id: 'chk-water', name: 'Water Bottle', category: 'Personal' },
    { id: 'chk-umbrella', name: 'Umbrella', category: 'Personal' },
    { id: 'chk-jacket', name: 'Jacket', category: 'Personal' },
  ];

  return items.map((item) => ({
    ...item,
    isDefault: true,
    createdAt: now,
  }));
}

export function createDefaultDailyProgress(todayKey: string = getTodayKey()): DailyProgress {
  return {
    date: todayKey,
    alarmDismissed: false,
    breakfastCompleted: false,
    selectedBreakfastId: undefined,
    checkedChecklistItemIds: [],
  };
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export interface HydratedState {
  user: UserProfile;
  alarms: AlarmItem[];
  tasks: TaskItem[];
  checklist: ChecklistItem[];
  daily: DailyProgress;
}

export function hydrateInitialState(): HydratedState {
  const todayKey = getTodayKey();
  if (typeof window === 'undefined') {
    return {
      user: createDefaultUser(),
      alarms: createDefaultAlarms(),
      tasks: createDefaultTasks(todayKey),
      checklist: createDefaultChecklistItems(),
      daily: createDefaultDailyProgress(todayKey),
    };
  }

  const alreadySeeded = window.localStorage.getItem(STORAGE_KEYS.SEEDED) === 'true';

  if (!alreadySeeded) {
    const user = createDefaultUser();
    const alarms = createDefaultAlarms();
    const tasks = createDefaultTasks(todayKey);
    const checklist = createDefaultChecklistItems();
    const daily = createDefaultDailyProgress(todayKey);

    writeStorage(STORAGE_KEYS.USER, user);
    writeStorage(STORAGE_KEYS.ALARMS, alarms);
    writeStorage(STORAGE_KEYS.TASKS, tasks);
    writeStorage(STORAGE_KEYS.CHECKLIST, checklist);
    writeStorage(STORAGE_KEYS.DAILY, daily);
    window.localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');

    return { user, alarms, tasks, checklist, daily };
  }

  const user = { ...createDefaultUser(), ...readStorage<Partial<UserProfile>>(STORAGE_KEYS.USER, {}) };
  const alarms = readStorage<AlarmItem[]>(STORAGE_KEYS.ALARMS, []);
  const tasks = readStorage<TaskItem[]>(STORAGE_KEYS.TASKS, []);
  const checklist = readStorage<ChecklistItem[]>(STORAGE_KEYS.CHECKLIST, []);
  const storedDaily = readStorage<DailyProgress>(
    STORAGE_KEYS.DAILY,
    createDefaultDailyProgress(todayKey)
  );

  // Automatically roll over daily progress when a new calendar day starts
  const daily =
    storedDaily.date === todayKey
      ? storedDaily
      : createDefaultDailyProgress(todayKey);

  if (storedDaily.date !== todayKey) {
    writeStorage(STORAGE_KEYS.DAILY, daily);
  }

  return {
    user,
    alarms: Array.isArray(alarms) ? alarms : [],
    tasks: Array.isArray(tasks) ? tasks : [],
    checklist: Array.isArray(checklist) ? checklist : [],
    daily,
  };
}

export function clearAllAppStorage(): HydratedState {
  if (typeof window !== 'undefined') {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
  }
  return hydrateInitialState();
}
