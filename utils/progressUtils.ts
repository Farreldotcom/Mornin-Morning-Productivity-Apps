import type { ChecklistItem, DailyProgress, TaskItem } from '@/types';

export interface MorningProgressBreakdown {
  percentage: number;
  alarmScore: number;
  tasksScore: number;
  breakfastScore: number;
  checklistScore: number;
  completedPillars: number;
  totalPillars: number;
}

export function calculateMorningProgress(
  daily: DailyProgress,
  todayTasks: TaskItem[],
  checklistItems: ChecklistItem[]
): MorningProgressBreakdown {
  // Four balanced morning pillars (25 points each = 100%)
  const alarmScore = daily.alarmDismissed ? 25 : 0;

  let tasksScore = 0;
  if (todayTasks.length > 0) {
    const completedCount = todayTasks.filter((t) => t.completed).length;
    tasksScore = (completedCount / todayTasks.length) * 25;
  }

  const breakfastScore = daily.breakfastCompleted ? 25 : 0;

  let checklistScore = 0;
  if (checklistItems.length > 0) {
    const validIds = new Set(checklistItems.map((i) => i.id));
    const checkedCount = daily.checkedChecklistItemIds.filter((id) => validIds.has(id)).length;
    checklistScore = (checkedCount / checklistItems.length) * 25;
  }

  const rawPercentage = alarmScore + tasksScore + breakfastScore + checklistScore;
  const percentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));

  const completedPillars =
    (daily.alarmDismissed ? 1 : 0) +
    (todayTasks.length > 0 && todayTasks.every((t) => t.completed) ? 1 : 0) +
    (daily.breakfastCompleted ? 1 : 0) +
    (checklistItems.length > 0 &&
    checklistItems.every((i) => daily.checkedChecklistItemIds.includes(i.id))
      ? 1
      : 0);

  return {
    percentage,
    alarmScore,
    tasksScore,
    breakfastScore,
    checklistScore,
    completedPillars,
    totalPillars: 4,
  };
}
