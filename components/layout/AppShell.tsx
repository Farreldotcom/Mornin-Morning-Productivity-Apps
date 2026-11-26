'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlarmClock,
  CheckSquare,
  Coffee,
  Home,
  ListTodo,
  Settings,
} from 'lucide-react';
import { ActiveAlarmOverlay } from '@/components/alarm/ActiveAlarmOverlay';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/alarm', label: 'Alarm', icon: AlarmClock },
  { href: '/my-day', label: 'My Day', icon: ListTodo },
  { href: '/breakfast', label: 'Breakfast', icon: Coffee },
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--mornin-bg)] text-[var(--mornin-text)] transition-colors duration-200">
      {/* Desktop 3-Zone Top Bar */}
      <header className="hidden md:block border-b border-[var(--mornin-divider)] bg-[var(--mornin-bg)]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between gap-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[var(--mornin-text)] whitespace-nowrap shrink-0"
          >
            MORNIN.
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'text-[var(--mornin-text)] font-semibold'
                      : 'text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full bg-[#E9D58D]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/settings"
            aria-label="Settings"
            className={`inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              pathname === '/settings'
                ? 'bg-[var(--mornin-accent-soft)] text-[var(--mornin-text)]'
                : 'text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] hover:bg-[var(--mornin-bg-secondary)]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </header>

      {/* Mobile Compact Header (non-sticky to preserve mobile viewport) */}
      <header className="md:hidden px-5 pt-4 pb-2 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-[var(--mornin-text)] whitespace-nowrap shrink-0"
        >
          MORNIN.
        </Link>
        <Link
          href="/settings"
          aria-label="Settings"
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-colors ${
            pathname === '/settings'
              ? 'bg-[var(--mornin-accent-soft)] text-[var(--mornin-text)]'
              : 'text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
          }`}
        >
          <Settings className="w-5 h-5" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 pt-2 sm:pt-8 pb-24 md:pb-16">
        {children}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (compact <= 10% viewport height) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--mornin-surface)]/92 backdrop-blur-md border-t border-[var(--mornin-divider)] pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
                  active
                    ? 'text-[var(--mornin-text)]'
                    : 'text-[var(--mornin-text-muted)]'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                    active ? 'bg-[var(--mornin-accent-soft)]' : ''
                  }`}
                >
                  <Icon
                    className={`w-[19px] h-[19px] ${
                      active ? 'stroke-[2.2]' : 'stroke-[1.75]'
                    }`}
                  />
                </span>
                <span className="text-[10px] font-medium tracking-tight leading-none whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Active Alarm Overlay */}
      <ActiveAlarmOverlay />
    </div>
  );
}
