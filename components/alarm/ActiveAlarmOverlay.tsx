'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Check,
  Cloud,
  Coffee,
  Compass,
  Leaf,
  Moon,
  Star,
  Sun,
  Volume2,
} from 'lucide-react';
import type { AlarmItem, TimeFormat } from '@/types';
import { useMornin } from '@/context/MorninContext';
import { useClock } from '@/hooks/useClock';
import { formatClockParts } from '@/utils/timeUtils';
import {
  generateMathProblem,
  generateMemoryDeck,
  generatePatternProblem,
  type MathProblem,
  type MemoryCard,
  type PatternProblem,
} from '@/services/alarmService';

const SYMBOL_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  moon: Moon,
  star: Star,
  cloud: Cloud,
  leaf: Leaf,
  coffee: Coffee,
  bell: Bell,
  compass: Compass,
};

interface ActiveAlarmContentProps {
  ringingAlarm: AlarmItem;
  timeFormat: TimeFormat;
  alarmAudioBlocked: boolean;
  snoozeRingingAlarm: () => void;
  completeRingingAlarm: () => void;
  unlockRingingAudio: () => void;
}

function ActiveAlarmContent({
  ringingAlarm,
  timeFormat,
  alarmAudioBlocked,
  snoozeRingingAlarm,
  completeRingingAlarm,
  unlockRingingAudio,
}: ActiveAlarmContentProps) {
  const now = useClock(1000);
  const clock = formatClockParts(now, timeFormat);

  const [solved, setSolved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [mathProblem] = useState<MathProblem | null>(() =>
    ringingAlarm.challengeType === 'math'
      ? generateMathProblem(ringingAlarm.challengeDifficulty)
      : null
  );
  const [mathInput, setMathInput] = useState('');

  const [patternProblem] = useState<PatternProblem | null>(() =>
    ringingAlarm.challengeType === 'pattern'
      ? generatePatternProblem(ringingAlarm.challengeDifficulty)
      : null
  );
  const [patternInput, setPatternInput] = useState('');

  const [cards, setCards] = useState<MemoryCard[]>(() =>
    ringingAlarm.challengeType === 'memory'
      ? generateMemoryDeck(ringingAlarm.challengeDifficulty)
      : []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCheckingPair, setIsCheckingPair] = useState(false);

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mathProblem) return;
    const parsed = parseInt(mathInput.trim(), 10);
    if (parsed === mathProblem.answer) {
      setErrorMsg('');
      setSolved(true);
    } else {
      setErrorMsg('Not quite — try again.');
      setMathInput('');
    }
  };

  const handlePatternSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patternProblem) return;
    const parsed = parseInt(patternInput.trim(), 10);
    if (parsed === patternProblem.answer) {
      setErrorMsg('');
      setSolved(true);
    } else {
      setErrorMsg('Check the sequence and try again.');
      setPatternInput('');
    }
  };

  const handleFlipCard = (cardId: string) => {
    if (isCheckingPair || solved) return;
    const clicked = cards.find((c) => c.id === cardId);
    if (!clicked || clicked.flipped || clicked.matched) return;

    const updated = cards.map((c) => (c.id === cardId ? { ...c, flipped: true } : c));
    const nextSelected = [...selectedIds, cardId];
    setCards(updated);
    setSelectedIds(nextSelected);

    if (nextSelected.length === 2) {
      const [firstId, secondId] = nextSelected;
      const first = updated.find((c) => c.id === firstId);
      const second = updated.find((c) => c.id === secondId);

      if (first && second && first.symbolKey === second.symbolKey) {
        const matchedDeck = updated.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
        );
        setCards(matchedDeck);
        setSelectedIds([]);
        if (matchedDeck.every((c) => c.matched)) {
          setSolved(true);
        }
      } else {
        setIsCheckingPair(true);
        window.setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
            )
          );
          setSelectedIds([]);
          setIsCheckingPair(false);
        }, 650);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--mornin-bg)] px-6 py-10 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Wake-up alarm"
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
        <span className="text-xs font-medium tracking-wide text-[var(--mornin-text-muted)]">
          {ringingAlarm.label || 'Morning Alarm'}
        </span>

        <div className="mt-3 flex items-baseline justify-center gap-2 tabular-nums">
          <span className="text-6xl sm:text-7xl font-medium tracking-tight text-[var(--mornin-text)]">
            {clock.time}
          </span>
          {clock.period && (
            <span className="text-xl font-medium text-[var(--mornin-text-muted)]">
              {clock.period}
            </span>
          )}
        </div>

        {alarmAudioBlocked && !solved && (
          <button
            type="button"
            onClick={unlockRingingAudio}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-[var(--mornin-accent-soft)] text-[var(--mornin-text)] cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Tap to enable alarm chime
          </button>
        )}

        <div className="mt-8 w-full rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] p-6 shadow-xs text-left">
          {solved ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-4 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-[#7D9B7B]/15 text-[#7D9B7B] dark:text-[#8FAE8D] flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[var(--mornin-text)]">
                Good morning! You&apos;re officially up.
              </h2>
              <p className="mt-1.5 text-sm text-[var(--mornin-text-muted)]">
                Your morning progress has been updated.
              </p>
              <button
                type="button"
                onClick={completeRingingAlarm}
                className="mt-6 w-full min-h-[48px] rounded-xl bg-[#E9D58D] text-[#242424] text-sm font-semibold hover:bg-[#e1ca78] transition-colors cursor-pointer"
              >
                Dismiss Alarm
              </button>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-[var(--mornin-text-muted)]">
                <span>
                  {ringingAlarm.challengeType === 'math'
                    ? 'Math challenge'
                    : ringingAlarm.challengeType === 'memory'
                    ? 'Memory match'
                    : 'Pattern recognition'}
                </span>
                <span className="capitalize">{ringingAlarm.challengeDifficulty}</span>
              </div>

              {ringingAlarm.challengeType === 'math' && mathProblem && (
                <form onSubmit={handleMathSubmit} className="mt-4">
                  <p className="text-sm text-[var(--mornin-text-muted)]">
                    Solve to turn off the alarm
                  </p>
                  <div className="mt-3 py-4 rounded-xl bg-[var(--mornin-bg-secondary)] text-center text-3xl font-semibold tabular-nums text-[var(--mornin-text)]">
                    {mathProblem.prompt} = ?
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    autoFocus
                    value={mathInput}
                    onChange={(e) => setMathInput(e.target.value)}
                    placeholder="Enter answer"
                    className="mt-4 w-full min-h-[48px] px-4 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-base tabular-nums text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
                  />
                  {errorMsg && (
                    <p className="mt-2 text-xs text-[#C97C72] dark:text-[#D88A80]">
                      {errorMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="mt-4 w-full min-h-[48px] rounded-xl bg-[#242424] dark:bg-[#F3F2ED] text-white dark:text-[#141413] text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Verify Answer
                  </button>
                </form>
              )}

              {ringingAlarm.challengeType === 'pattern' && patternProblem && (
                <form onSubmit={handlePatternSubmit} className="mt-4">
                  <p className="text-sm text-[var(--mornin-text-muted)]">
                    Find the missing number · {patternProblem.hint}
                  </p>
                  <div className="mt-3 py-4 px-2 rounded-xl bg-[var(--mornin-bg-secondary)] flex items-center justify-center gap-2.5 flex-wrap tabular-nums">
                    {patternProblem.sequence.map((val, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center justify-center min-w-[40px] h-10 px-2 rounded-lg text-lg font-semibold ${
                          val === null
                            ? 'bg-[#F4EAC7] dark:bg-[#2E291A] text-[#242424] dark:text-[#E9D58D]'
                            : 'text-[var(--mornin-text)]'
                        }`}
                      >
                        {val === null ? '?' : val}
                      </span>
                    ))}
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    autoFocus
                    value={patternInput}
                    onChange={(e) => setPatternInput(e.target.value)}
                    placeholder="Missing number"
                    className="mt-4 w-full min-h-[48px] px-4 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-base tabular-nums text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
                  />
                  {errorMsg && (
                    <p className="mt-2 text-xs text-[#C97C72] dark:text-[#D88A80]">
                      {errorMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="mt-4 w-full min-h-[48px] rounded-xl bg-[#242424] dark:bg-[#F3F2ED] text-white dark:text-[#141413] text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Verify Answer
                  </button>
                </form>
              )}

              {ringingAlarm.challengeType === 'memory' && (
                <div className="mt-4">
                  <p className="text-sm text-[var(--mornin-text-muted)]">
                    Match all pairs to dismiss
                  </p>
                  <div
                    className={`mt-4 grid gap-2.5 ${
                      cards.length > 8 ? 'grid-cols-4' : 'grid-cols-3'
                    }`}
                  >
                    {cards.map((card) => {
                      const Icon = SYMBOL_MAP[card.symbolKey] || Sun;
                      const revealed = card.flipped || card.matched;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => handleFlipCard(card.id)}
                          aria-label={revealed ? card.symbolKey : 'Hidden memory card'}
                          className={`h-16 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                            card.matched
                              ? 'bg-[#7D9B7B]/15 border-[#7D9B7B]/40 text-[#7D9B7B] dark:text-[#8FAE8D]'
                              : revealed
                              ? 'bg-[#F4EAC7] dark:bg-[#2E291A] border-[#E9D58D] text-[#242424] dark:text-[#E9D58D]'
                              : 'bg-[var(--mornin-bg-secondary)] border-[var(--mornin-divider)] text-transparent hover:border-[#E9D58D]'
                          }`}
                        >
                          {revealed && <Icon className="w-5 h-5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!solved && (
          <button
            type="button"
            onClick={snoozeRingingAlarm}
            className="mt-6 min-h-[44px] px-5 py-2 text-sm font-medium text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] transition-colors cursor-pointer"
          >
            Snooze for {ringingAlarm.snoozeDuration} minutes
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function ActiveAlarmOverlay() {
  const {
    ringingAlarm,
    user,
    alarmAudioBlocked,
    snoozeRingingAlarm,
    completeRingingAlarm,
    unlockRingingAudio,
  } = useMornin();

  return (
    <AnimatePresence>
      {ringingAlarm && (
        <ActiveAlarmContent
          key={`${ringingAlarm.id}-${ringingAlarm.challengeType}-${ringingAlarm.challengeDifficulty}`}
          ringingAlarm={ringingAlarm}
          timeFormat={user.timeFormat}
          alarmAudioBlocked={alarmAudioBlocked}
          snoozeRingingAlarm={snoozeRingingAlarm}
          completeRingingAlarm={completeRingingAlarm}
          unlockRingingAudio={unlockRingingAudio}
        />
      )}
    </AnimatePresence>
  );
}
