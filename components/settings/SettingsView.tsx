'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { Bell, Check, Moon, Sun, Upload, User } from 'lucide-react';
import { useMornin } from '@/context/MorninContext';
import type { SnoozeDuration, UserProfile } from '@/types';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

type DialogAction = 'reset-today' | 'restore-checklist' | 'clear-all' | null;

function subscribeNoop() {
  return () => {};
}

function getNotificationSnapshot(): string {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

function getServerNotificationSnapshot(): string {
  return 'unsupported';
}

interface ProfileFormProps {
  user: UserProfile;
  updateUser: (patch: Partial<UserProfile>) => void;
  onSaved: (message: string) => void;
}

function ProfileForm({ user, updateUser, onSaved }: ProfileFormProps) {
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: nameInput.trim() || 'Farrel',
      email: emailInput.trim(),
    });
    onSaved('Profile saved.');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        updateUser({ avatarDataUrl: dataUrl });
        onSaved('Profile photo updated.');
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <form
      onSubmit={handleSaveProfile}
      className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] p-5 space-y-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[var(--mornin-bg-secondary)] border border-[var(--mornin-divider)] overflow-hidden flex items-center justify-center shrink-0">
          {user.avatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarDataUrl}
              alt={`${user.name} avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-[var(--mornin-text-muted)]" />
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="min-h-[40px] px-3.5 rounded-xl bg-[var(--mornin-bg-secondary)] hover:bg-[var(--mornin-divider)] text-xs font-medium text-[var(--mornin-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Upload photo
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="sr-only"
            />
          </label>
          {user.avatarDataUrl && (
            <button
              type="button"
              onClick={() => updateUser({ avatarDataUrl: undefined })}
              className="min-h-[40px] px-3 text-xs font-medium text-[var(--mornin-text-muted)] hover:text-[#C97C72] cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="profile-name-input"
          className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5"
        >
          Display name
        </label>
        <input
          id="profile-name-input"
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Your name"
          className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
        />
      </div>

      <div>
        <label
          htmlFor="profile-email-input"
          className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5"
        >
          Email (optional)
        </label>
        <input
          id="profile-email-input"
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="you@example.com"
          className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
        />
      </div>

      <div className="pt-1 flex justify-end">
        <button
          type="submit"
          className="min-h-[44px] px-5 rounded-xl bg-[#E9D58D] text-[#242424] text-sm font-semibold hover:bg-[#e1ca78] transition-colors cursor-pointer"
        >
          Save Profile
        </button>
      </div>
    </form>
  );
}

export function SettingsView() {
  const {
    hydrated,
    user,
    weather,
    updateUser,
    refreshWeather,
    resetTodayProgress,
    restoreDefaultChecklist,
    resetAllData,
  } = useMornin();

  const browserNotifPermission = useSyncExternalStore(
    subscribeNoop,
    getNotificationSnapshot,
    getServerNotificationSnapshot
  );

  const [savedNotice, setSavedNotice] = useState('');
  const [notifOverride, setNotifOverride] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<DialogAction>(null);

  const notifPermission = notifOverride ?? browserNotifPermission;

  const showToast = (message: string) => {
    setSavedNotice(message);
    window.setTimeout(() => setSavedNotice(''), 2500);
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const result = await Notification.requestPermission();
      setNotifOverride(result);
      if (result === 'granted') {
        updateUser({ remindersEnabled: true });
        showToast('Notifications enabled.');
      }
    } catch {
      // Ignore permission dialog issues
    }
  };

  const handleConfirm = () => {
    if (confirmAction === 'reset-today') {
      resetTodayProgress();
      showToast("Today's progress has been reset.");
    } else if (confirmAction === 'restore-checklist') {
      restoreDefaultChecklist();
      showToast('Default checklist items restored.');
    } else if (confirmAction === 'clear-all') {
      resetAllData();
      showToast('Application data reset to defaults.');
    }
    setConfirmAction(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div className="flex items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--mornin-text)]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--mornin-text-muted)]">
            Personalize your morning pace and preferences.
          </p>
        </div>

        {savedNotice && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A7858] dark:text-[#8FAE8D]">
            <Check className="w-3.5 h-3.5" />
            {savedNotice}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--mornin-text)] px-1">
            Profile
          </h2>
          <ProfileForm
            key={`${hydrated}-${user.name}-${user.email}`}
            user={user}
            updateUser={updateUser}
            onSaved={showToast}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--mornin-text)] px-1">
            Morning Preferences
          </h2>
          <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] divide-y divide-[var(--mornin-divider)]">
            <div className="px-5 py-3.5 flex items-center justify-between gap-4">
              <label
                htmlFor="pref-wakeup"
                className="text-sm font-medium text-[var(--mornin-text)]"
              >
                Preferred wake-up time
              </label>
              <input
                id="pref-wakeup"
                type="time"
                value={user.preferredWakeUpTime}
                onChange={(e) =>
                  updateUser({ preferredWakeUpTime: e.target.value })
                }
                className="min-h-[40px] px-3 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm tabular-nums text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
              />
            </div>

            <div className="px-5 py-3.5 flex items-center justify-between gap-4">
              <label
                htmlFor="pref-departure"
                className="text-sm font-medium text-[var(--mornin-text)]"
              >
                Planned departure time
              </label>
              <input
                id="pref-departure"
                type="time"
                value={user.departureTime}
                onChange={(e) => updateUser({ departureTime: e.target.value })}
                className="min-h-[40px] px-3 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm tabular-nums text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
              />
            </div>

            <div className="px-5 py-3.5 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[var(--mornin-text)]">
                Time format
              </span>
              <div className="inline-flex p-1 rounded-xl bg-[var(--mornin-bg-secondary)]">
                {(['12h', '24h'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => updateUser({ timeFormat: fmt })}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      user.timeFormat === fmt
                        ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                        : 'text-[var(--mornin-text-muted)]'
                    }`}
                  >
                    {fmt === '12h' ? '12-hour' : '24-hour'}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-3.5 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[var(--mornin-text)]">
                Default snooze
              </span>
              <div className="inline-flex p-1 rounded-xl bg-[var(--mornin-bg-secondary)]">
                {([5, 10, 15] as SnoozeDuration[]).map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => updateUser({ defaultSnoozeDuration: mins })}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      user.defaultSnoozeDuration === mins
                        ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                        : 'text-[var(--mornin-text-muted)]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--mornin-text)] px-1">
            Appearance &amp; Browser Features
          </h2>
          <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] divide-y divide-[var(--mornin-divider)]">
            <div className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-[var(--mornin-text)]">
                  Theme
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)]">
                  Switch between light and dark surfaces
                </div>
              </div>
              <div className="inline-flex p-1 rounded-xl bg-[var(--mornin-bg-secondary)]">
                <button
                  type="button"
                  onClick={() => updateUser({ theme: 'light' })}
                  className={`min-h-[34px] px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    user.theme === 'light'
                      ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                      : 'text-[var(--mornin-text-muted)]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => updateUser({ theme: 'dark' })}
                  className={`min-h-[34px] px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    user.theme === 'dark'
                      ? 'bg-[var(--mornin-surface)] text-[var(--mornin-text)] shadow-xs'
                      : 'text-[var(--mornin-text-muted)]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Dark
                </button>
              </div>
            </div>

            {notifPermission !== 'unsupported' && (
              <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-[var(--mornin-text)] flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[var(--mornin-text-muted)]" />
                    Browser notifications
                  </div>
                  <div className="text-xs text-[var(--mornin-text-muted)] mt-0.5">
                    Permission status:{' '}
                    <span className="capitalize font-medium text-[var(--mornin-text)]">
                      {notifPermission}
                    </span>
                  </div>
                </div>

                {notifPermission === 'granted' ? (
                  <ToggleSwitch
                    checked={user.remindersEnabled}
                    onChange={(val) => updateUser({ remindersEnabled: val })}
                    ariaLabel="Toggle alarm browser notifications"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestNotificationPermission}
                    disabled={notifPermission === 'denied'}
                    className="min-h-[40px] px-3.5 rounded-xl bg-[var(--mornin-bg-secondary)] text-xs font-medium text-[var(--mornin-text)] hover:bg-[var(--mornin-divider)] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {notifPermission === 'denied' ? 'Blocked in browser' : 'Enable'}
                  </button>
                )}
              </div>
            )}

            <div className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-[var(--mornin-text)]">
                  Local weather summary
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)]">
                  {weather.status === 'denied'
                    ? 'Location permission declined'
                    : 'Uses browser location for today’s forecast'}
                </div>
              </div>
              <ToggleSwitch
                checked={user.weatherEnabled}
                onChange={(val) => {
                  updateUser({ weatherEnabled: val });
                  if (val) void refreshWeather();
                }}
                ariaLabel="Toggle local weather summary"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--mornin-text)] px-1">
            Data Management
          </h2>
          <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] divide-y divide-[var(--mornin-divider)] overflow-hidden">
            <button
              type="button"
              onClick={() => setConfirmAction('reset-today')}
              className="w-full min-h-[54px] px-5 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-[var(--mornin-bg-secondary)]/50 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-sm font-medium text-[var(--mornin-text)]">
                  Reset today&apos;s progress
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)]">
                  Clears today&apos;s alarm, breakfast, task, and checklist completion
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setConfirmAction('restore-checklist')}
              className="w-full min-h-[54px] px-5 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-[var(--mornin-bg-secondary)]/50 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-sm font-medium text-[var(--mornin-text)]">
                  Restore default checklist templates
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)]">
                  Brings back default essentials while keeping your custom items
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setConfirmAction('clear-all')}
              className="w-full min-h-[54px] px-5 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-[#C97C72]/8 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-sm font-medium text-[#C97C72] dark:text-[#D88A80]">
                  Clear saved application data
                </div>
                <div className="text-xs text-[var(--mornin-text-muted)]">
                  Resets profile, alarms, tasks, and checklist to initial state
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction === 'reset-today'
            ? "Reset today's progress?"
            : confirmAction === 'restore-checklist'
            ? 'Restore default checklist?'
            : 'Clear all saved data?'
        }
        description={
          confirmAction === 'reset-today'
            ? 'This unchecks today’s completed tasks, checklist items, breakfast status, and alarm completion.'
            : confirmAction === 'restore-checklist'
            ? 'This restores the 14 default essential items while preserving any custom items you added.'
            : 'This erases all saved local data and restores MORNIN to its initial setup.'
        }
        confirmLabel={confirmAction === 'clear-all' ? 'Clear Data' : 'Confirm'}
        destructive={confirmAction === 'clear-all'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </motion.div>
  );
}
