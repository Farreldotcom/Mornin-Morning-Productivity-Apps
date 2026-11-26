export type TimeFormat = '12h' | '24h';
export type SnoozeDuration = 5 | 10 | 15;
export type ThemeMode = 'light' | 'dark';

export type ChallengeType = 'math' | 'memory' | 'pattern';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export type TaskCategory = 'Study' | 'Work' | 'Personal' | 'Health' | 'Other';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskFilter = 'all' | 'pending' | 'completed';

export type PrepTimeFilter = 'all' | 'under-5' | '5-10' | '10-20';
export type BreakfastDifficulty = 'Easy' | 'Moderate';

export type ChecklistCategory = 'Essentials' | 'Electronics' | 'Work & Study' | 'Personal';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarDataUrl?: string;
  preferredWakeUpTime: string; // "HH:mm"
  departureTime: string; // "HH:mm"
  timeFormat: TimeFormat;
  defaultSnoozeDuration: SnoozeDuration;
  theme: ThemeMode;
  remindersEnabled: boolean;
  weatherEnabled: boolean;
}

export interface AlarmItem {
  id: string;
  time: string; // "HH:mm" 24h canonical
  label: string;
  repeatDays: number[]; // 0 (Sun) - 6 (Sat)
  enabled: boolean;
  challengeType: ChallengeType;
  challengeDifficulty: ChallengeDifficulty;
  snoozeDuration: SnoozeDuration;
  snoozedUntil?: number | null; // epoch ms if currently snoozed
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  dueTime: string; // "HH:mm" or ""
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
}

export interface BreakfastItem {
  id: string;
  name: string;
  description: string;
  imageKey: string;
  preparationTime: number; // minutes
  timeBucket: Exclude<PrepTimeFilter, 'all'>;
  difficulty: BreakfastDifficulty;
  ingredients: string[];
  category: 'Savory' | 'Sweet' | 'Fresh' | 'Warm Bowl';
}

export interface ChecklistItem {
  id: string;
  name: string;
  category: ChecklistCategory;
  isDefault: boolean;
  createdAt: string;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  alarmDismissed: boolean;
  breakfastCompleted: boolean;
  selectedBreakfastId?: string;
  checkedChecklistItemIds: string[];
  lastDismissedAlarmMinute?: string; // "YYYY-MM-DD HH:mm" to prevent double firing in same minute
}

export interface WeatherInfo {
  status: 'unavailable' | 'loading' | 'ready' | 'denied';
  temperatureC?: number;
  condition?: string;
  code?: number;
  highC?: number;
  lowC?: number;
  locationLabel?: string;
  errorMessage?: string;
}
