import type { AlarmItem, ChallengeDifficulty } from '@/types';

export interface MathProblem {
  prompt: string;
  answer: number;
}

export interface PatternProblem {
  sequence: Array<number | null>;
  answer: number;
  hint: string;
}

export interface MemoryCard {
  id: string;
  symbolKey: string;
  flipped: boolean;
  matched: boolean;
}

export function generateMathProblem(difficulty: ChallengeDifficulty): MathProblem {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  if (difficulty === 'easy') {
    const a = rand(11, 45);
    const b = rand(10, 35);
    const isAdd = Math.random() > 0.4;
    if (isAdd) {
      return { prompt: `${a} + ${b}`, answer: a + b };
    }
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    return { prompt: `${big} − ${small}`, answer: big - small };
  }

  if (difficulty === 'medium') {
    const op = Math.random();
    if (op < 0.45) {
      const a = rand(6, 12);
      const b = rand(4, 12);
      return { prompt: `${a} × ${b}`, answer: a * b };
    }
    const a = rand(28, 89);
    const b = rand(17, 64);
    if (Math.random() > 0.5) {
      return { prompt: `${a} + ${b}`, answer: a + b };
    }
    const big = Math.max(a, b) + 15;
    const small = Math.min(a, b);
    return { prompt: `${big} − ${small}`, answer: big - small };
  }

  // Hard
  const a = rand(12, 19);
  const b = rand(6, 14);
  const c = rand(5, 25);
  if (Math.random() > 0.5) {
    return { prompt: `${a} × ${b} + ${c}`, answer: a * b + c };
  }
  return { prompt: `${a} × ${b} − ${c}`, answer: a * b - c };
}

export function generatePatternProblem(difficulty: ChallengeDifficulty): PatternProblem {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  if (difficulty === 'easy') {
    const start = rand(2, 12);
    const step = rand(2, 6);
    const seq = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
    const missingIdx = rand(1, 3);
    const answer = seq[missingIdx];
    return {
      sequence: seq.map((n, i) => (i === missingIdx ? null : n)),
      answer,
      hint: 'Steady step pattern',
    };
  }

  if (difficulty === 'medium') {
    const start = rand(3, 9);
    const mult = rand(2, 3);
    if (Math.random() > 0.5) {
      // Growing differences: +2, +4, +6, +8
      const base = rand(2, 8);
      const d = rand(2, 4);
      const seq = [
        base,
        base + d,
        base + d * 3,
        base + d * 6,
        base + d * 10,
      ];
      const missingIdx = rand(2, 4);
      return {
        sequence: seq.map((n, i) => (i === missingIdx ? null : n)),
        answer: seq[missingIdx],
        hint: 'Increasing difference',
      };
    }
    const seq = [start, start * mult, start * mult * mult, start * mult * mult * mult];
    const missingIdx = rand(1, 2);
    return {
      sequence: seq.map((n, i) => (i === missingIdx ? null : n)),
      answer: seq[missingIdx],
      hint: 'Consistent multiplier',
    };
  }

  // Hard: Fibonacci-like or alternating step
  const a = rand(2, 7);
  const b = rand(3, 9);
  const c = a + b;
  const d = b + c;
  const e = c + d;
  const seq = [a, b, c, d, e];
  const missingIdx = rand(2, 4);
  return {
    sequence: seq.map((n, i) => (i === missingIdx ? null : n)),
    answer: seq[missingIdx],
    hint: 'Each number builds on the previous two',
  };
}

const MEMORY_SYMBOLS = ['sun', 'moon', 'star', 'cloud', 'leaf', 'coffee', 'bell', 'compass'];

export function generateMemoryDeck(difficulty: ChallengeDifficulty): MemoryCard[] {
  const pairCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 6;
  const chosen = MEMORY_SYMBOLS.slice(0, pairCount);
  const doubled = [...chosen, ...chosen];

  // Fisher-Yates shuffle
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }

  return doubled.map((symbolKey, index) => ({
    id: `card-${index}-${symbolKey}`,
    symbolKey,
    flipped: false,
    matched: false,
  }));
}

export function getNextEnabledAlarm(alarms: AlarmItem[], now: Date = new Date()): {
  alarm: AlarmItem;
  dayLabel: string;
} | null {
  const enabled = alarms.filter((a) => a.enabled);
  if (enabled.length === 0) return null;

  let best: { alarm: AlarmItem; deltaMs: number; dayLabel: string } | null = null;

  for (const alarm of enabled) {
    const [hStr, mStr] = alarm.time.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) continue;

    for (let offset = 0; offset <= 7; offset++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + offset);
      candidate.setHours(h, m, 0, 0);

      if (candidate.getTime() <= now.getTime()) continue;

      const dayOfWeek = candidate.getDay();
      if (alarm.repeatDays.length > 0 && !alarm.repeatDays.includes(dayOfWeek)) {
        continue;
      }

      const deltaMs = candidate.getTime() - now.getTime();
      const dayLabel =
        offset === 0
          ? 'Today'
          : offset === 1
          ? 'Tomorrow'
          : candidate.toLocaleDateString('en-US', { weekday: 'short' });

      if (!best || deltaMs < best.deltaMs) {
        best = { alarm, deltaMs, dayLabel };
      }
      break;
    }
  }

  return best ? { alarm: best.alarm, dayLabel: best.dayLabel } : null;
}

export function sendAlarmNotification(alarm: AlarmItem): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(`MORNIN. — ${alarm.label || 'Wake Up'}`, {
      body: `Time for your morning routine. Open MORNIN to complete your wake-up challenge.`,
      tag: `mornin-alarm-${alarm.id}`,
    });
  } catch {
    // Ignore environments where Notification constructor is restricted
  }
}
