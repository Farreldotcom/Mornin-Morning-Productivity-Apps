'use client';

import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}

export function ToggleSwitch({ checked, onChange, ariaLabel }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="min-h-[44px] min-w-[44px] flex items-center justify-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9D58D] rounded-full cursor-pointer"
    >
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked
            ? 'bg-[#E9D58D] dark:bg-[#E9D58D]'
            : 'bg-[#E2E1DC] dark:bg-[#343430]'
        }`}
      >
        <span
          className={`inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
          }`}
        />
      </span>
    </button>
  );
}
