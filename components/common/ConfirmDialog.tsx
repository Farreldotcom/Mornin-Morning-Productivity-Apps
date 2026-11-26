'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-black/35 backdrop-blur-xs"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-sm rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] p-6 shadow-xl"
          >
            <h3
              id="confirm-dialog-title"
              className="text-lg font-semibold text-[var(--mornin-text)]"
            >
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--mornin-text-muted)]">
              {description}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="min-h-[44px] px-4 py-2 text-sm font-medium text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`min-h-[44px] px-5 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  destructive
                    ? 'bg-[#C97C72] text-white hover:bg-[#b86d63]'
                    : 'bg-[#E9D58D] text-[#242424] hover:bg-[#e1ca78]'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
