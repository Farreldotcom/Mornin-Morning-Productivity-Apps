import type { TimeFormat } from '@/types';

export function getGreetingPrefix(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatClockParts(
  date: Date,
  format: TimeFormat
): { time: string; seconds: string; period?: string } {
  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  if (format === '24h') {
    return {
      time: `${String(hours24).padStart(2, '0')}:${minutes}`,
      seconds,
    };
  }

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return {
    time: `${String(hours12).padStart(2, '0')}:${minutes}`,
    seconds,
    period,
  };
}

export function formatTimeString(time24: string, format: TimeFormat): string {
  if (!time24 || !time24.includes(':')) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;

  const mins = String(m).padStart(2, '0');
  if (format === '24h') {
    return `${String(h).padStart(2, '0')}:${mins}`;
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${mins} ${period}`;
}

export interface DepartureCountdown {
  status: 'upcoming' | 'imminent' | 'now' | 'passed';
  label: string;
  minutesRemaining: number;
}

export function getDepartureCountdown(
  departureTime24: string,
  now: Date = new Date()
): DepartureCountdown {
  const [hStr, mStr] = departureTime24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return { status: 'upcoming', label: 'Set departure time', minutesRemaining: 0 };
  }

  const target = new Date(now);
  target.setHours(h, m, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes === 0) {
    return {
      status: 'now',
      label: 'Time to head out now.',
      minutesRemaining: 0,
    };
  }

  if (diffMinutes > 0) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    let durationText = '';
    if (hours > 0 && mins > 0) {
      durationText = `${hours} hr ${mins} min`;
    } else if (hours > 0) {
      durationText = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      durationText = `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    }

    return {
      status: diffMinutes <= 15 ? 'imminent' : 'upcoming',
      label: `You have ${durationText} left.`,
      minutesRemaining: diffMinutes,
    };
  }

  const pastMinutes = Math.abs(diffMinutes);
  const hours = Math.floor(pastMinutes / 60);
  const mins = pastMinutes % 60;
  let pastText = '';
  if (hours > 0 && mins > 0) {
    pastText = `${hours}h ${mins}m ago`;
  } else if (hours > 0) {
    pastText = `${hours}h ago`;
  } else {
    pastText = `${mins}m ago`;
  }

  return {
    status: 'passed',
    label: `Planned departure passed ${pastText}.`,
    minutesRemaining: diffMinutes,
  };
}

export function getCurrentHHMM(date: Date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
