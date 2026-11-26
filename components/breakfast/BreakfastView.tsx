'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Check, Shuffle, Utensils } from 'lucide-react';
import { useMornin } from '@/context/MorninContext';
import type { BreakfastItem, PrepTimeFilter } from '@/types';
import { BREAKFAST_IMAGES } from '@/lib/breakfastImages';
import {
  BREAKFAST_DATABASE,
  filterBreakfasts,
  pickNextBreakfast,
} from '@/services/breakfastService';

const TIME_FILTERS: Array<{ value: PrepTimeFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'under-5', label: 'Under 5 min' },
  { value: '5-10', label: '5–10 min' },
  { value: '10-20', label: '10–20 min' },
];

export function BreakfastView() {
  const { daily, markBreakfastComplete, resetBreakfastToday } = useMornin();

  const [filter, setFilter] = useState<PrepTimeFilter>('all');
  const [currentMeal, setCurrentMeal] = useState<BreakfastItem>(() => {
    if (daily.selectedBreakfastId) {
      const found = BREAKFAST_DATABASE.find(
        (b) => b.id === daily.selectedBreakfastId
      );
      if (found) return found;
    }
    return BREAKFAST_DATABASE[0];
  });
  const [imageFailed, setImageFailed] = useState(false);

  const filteredMeals = useMemo(() => filterBreakfasts(filter), [filter]);

  const displayedMeal = useMemo(() => {
    if (filteredMeals.some((m) => m.id === currentMeal.id)) {
      return currentMeal;
    }
    return filteredMeals[0] ?? BREAKFAST_DATABASE[0];
  }, [filteredMeals, currentMeal]);

  const handleFilterChange = (nextFilter: PrepTimeFilter) => {
    setFilter(nextFilter);
    setImageFailed(false);
    const matching = filterBreakfasts(nextFilter);
    if (!matching.some((m) => m.id === currentMeal.id) && matching[0]) {
      setCurrentMeal(matching[0]);
    }
  };

  const handleShuffle = () => {
    setImageFailed(false);
    const next = pickNextBreakfast(filteredMeals, displayedMeal.id);
    setCurrentMeal(next);
  };

  const handleComplete = () => {
    markBreakfastComplete(displayedMeal.id);
  };

  const imageSrc = BREAKFAST_IMAGES[displayedMeal.imageKey];
  const isThisMealCompleted =
    daily.breakfastCompleted && daily.selectedBreakfastId === displayedMeal.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header + Prep Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--mornin-text)]">
            Breakfast
          </h1>
          <p className="mt-1 text-sm text-[var(--mornin-text-muted)]">
            One thoughtful morning meal recommendation at a time.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter by preparation time"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--mornin-bg-secondary)] self-start sm:self-auto overflow-x-auto max-w-full"
        >
          {TIME_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === f.value
                  ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                  : 'text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editorial Featured Meal */}
      <article className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto lg:min-h-[420px] bg-[var(--mornin-bg-secondary)]">
          {imageSrc && !imageFailed ? (
            <Image
              src={imageSrc}
              alt={displayedMeal.name}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              priority
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--mornin-text-muted)]">
              <Utensils className="w-8 h-8 stroke-[1.5]" />
              <span className="text-sm font-medium">{displayedMeal.name}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-[var(--mornin-text-muted)]">
              <span>{displayedMeal.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{displayedMeal.preparationTime} min</span>
              <span aria-hidden="true">·</span>
              <span>{displayedMeal.difficulty}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--mornin-text)] text-balance">
              {displayedMeal.name}
            </h2>

            <p className="text-sm leading-relaxed text-[var(--mornin-text-muted)]">
              {displayedMeal.description}
            </p>

            <div className="pt-2 border-t border-[var(--mornin-divider)]">
              <h3 className="text-xs font-medium text-[var(--mornin-text-muted)] mb-2.5">
                Main ingredients
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
                {displayedMeal.ingredients.map((ing) => (
                  <li
                    key={ing}
                    className="text-sm text-[var(--mornin-text)] flex items-center gap-2"
                  >
                    <span
                      aria-hidden="true"
                      className="w-1 h-1 rounded-full bg-[var(--mornin-text-muted)] shrink-0"
                    />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {daily.breakfastCompleted && (
              <div className="rounded-xl bg-[#7D9B7B]/12 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[#5A7858] dark:text-[#8FAE8D]">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>
                    {isThisMealCompleted
                      ? 'Breakfast logged for today.'
                      : 'You have already logged breakfast today.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetBreakfastToday}
                  className="text-xs font-medium text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] cursor-pointer whitespace-nowrap"
                >
                  Undo
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleComplete}
                className="flex-1 min-h-[48px] px-5 rounded-xl bg-[#E9D58D] text-[#242424] text-sm font-semibold hover:bg-[#e1ca78] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                {isThisMealCompleted ? 'Completed' : "I've had breakfast"}
              </button>

              <button
                type="button"
                onClick={handleShuffle}
                className="min-h-[48px] px-4 rounded-xl bg-[var(--mornin-bg-secondary)] text-[var(--mornin-text)] text-sm font-medium hover:bg-[var(--mornin-divider)] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Shuffle className="w-4 h-4" />
                Surprise me
              </button>
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
