'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useMornin } from '@/context/MorninContext';
import type { ChecklistCategory, ChecklistItem } from '@/types';

const CATEGORIES: ChecklistCategory[] = [
  'Essentials',
  'Electronics',
  'Work & Study',
  'Personal',
];

export function ChecklistView() {
  const {
    checklist,
    daily,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    toggleChecklistChecked,
    resetTodayChecklist,
  } = useMornin();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<ChecklistCategory>('Essentials');
  const [formError, setFormError] = useState('');

  const checkedSet = useMemo(
    () => new Set(daily.checkedChecklistItemIds),
    [daily.checkedChecklistItemIds]
  );

  const totalCount = checklist.length;
  const checkedCount = checklist.filter((i) => checkedSet.has(i.id)).length;
  const remainingCount = totalCount - checkedCount;
  const pct = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);
  const allComplete = totalCount > 0 && checkedCount === totalCount;

  const grouped = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      category: cat,
      items: checklist.filter((item) => item.category === cat),
    })).filter((group) => group.items.length > 0);
  }, [checklist]);

  const openAdd = () => {
    setEditingItem(null);
    setItemName('');
    setItemCategory('Essentials');
    setFormError('');
    setSheetOpen(true);
  };

  const openEdit = (item: ChecklistItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setFormError('');
    setSheetOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = itemName.trim();
    if (!trimmed) {
      setFormError('Please enter an item name.');
      return;
    }
    if (editingItem) {
      updateChecklistItem(editingItem.id, {
        name: trimmed,
        category: itemCategory,
      });
    } else {
      addChecklistItem(trimmed, itemCategory);
    }
    setSheetOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--mornin-text)]">
            Don&apos;t Forget
          </h1>
          <p className="mt-1 text-sm text-[var(--mornin-text-muted)]">
            Everything you need before heading out.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E9D58D] text-[#242424] text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[#e1ca78] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Progress & Reset Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--mornin-text-muted)] tabular-nums">
            <span>
              {checkedCount} of {totalCount} checked
            </span>
            <span>{remainingCount} remaining</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--mornin-divider)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#7D9B7B] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {checkedCount > 0 && (
          <button
            type="button"
            onClick={resetTodayChecklist}
            className="min-h-[40px] px-3.5 rounded-xl text-xs font-medium text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] hover:bg-[var(--mornin-bg-secondary)] inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset today
          </button>
        )}
      </div>

      {/* Completion State */}
      <AnimatePresence>
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl bg-[#7D9B7B]/12 border border-[#7D9B7B]/25 p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-[#7D9B7B] text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--mornin-text)]">
                You&apos;re all set!
              </h2>
              <p className="text-sm text-[var(--mornin-text-muted)]">
                Have a great day.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categorized Checklist */}
      {grouped.length === 0 ? (
        <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] p-10 text-center">
          <p className="text-base font-medium text-[var(--mornin-text)]">
            No essentials added yet
          </p>
          <p className="mt-1.5 text-sm text-[var(--mornin-text-muted)]">
            Add the everyday belongings you want to remember before leaving home.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grouped.map((group) => (
            <section key={group.category} className="space-y-2.5">
              <div className="flex items-baseline justify-between px-1">
                <h2 className="text-sm font-medium text-[var(--mornin-text)]">
                  {group.category}
                </h2>
                <span className="text-xs text-[var(--mornin-text-muted)] tabular-nums">
                  {group.items.filter((i) => checkedSet.has(i.id)).length}/
                  {group.items.length}
                </span>
              </div>

              <div className="rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] divide-y divide-[var(--mornin-divider)] overflow-hidden">
                {group.items.map((item) => {
                  const checked = checkedSet.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="px-4 py-2 flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => toggleChecklistChecked(item.id)}
                        className="flex-1 min-h-[44px] flex items-center gap-3 text-left cursor-pointer min-w-0"
                      >
                        <span
                          className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            checked
                              ? 'bg-[#7D9B7B] border-[#7D9B7B] text-white'
                              : 'border-[#C6C5BE] dark:border-[#55554F]'
                          }`}
                        >
                          {checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </span>
                        <span
                          className={`text-sm font-medium truncate transition-colors ${
                            checked
                              ? 'line-through text-[var(--mornin-text-muted)]'
                              : 'text-[var(--mornin-text)]'
                          }`}
                        >
                          {item.name}
                        </span>
                      </button>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className="min-h-[44px] min-w-[38px] flex items-center justify-center rounded-xl text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteChecklistItem(item.id)}
                          aria-label={`Delete ${item.name}`}
                          className="min-h-[44px] min-w-[38px] flex items-center justify-center rounded-xl text-[var(--mornin-text-muted)] hover:text-[#C97C72] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Add / Edit Item Sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={editingItem ? 'Edit checklist item' : 'Add checklist item'}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 bg-black/35 backdrop-blur-xs"
              onClick={() => setSheetOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-[var(--mornin-surface)] border border-[var(--mornin-divider)] p-6 pb-8 sm:pb-6 shadow-xl"
            >
              <div className="sm:hidden w-10 h-1 bg-[var(--mornin-divider)] rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--mornin-text)]">
                  {editingItem ? 'Edit Item' : 'Add Essential Item'}
                </h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close item dialog"
                  className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="checklist-name-input"
                    className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5"
                  >
                    Item name
                  </label>
                  <input
                    id="checklist-name-input"
                    type="text"
                    autoFocus
                    value={itemName}
                    onChange={(e) => {
                      setItemName(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="e.g., Transit Card"
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--mornin-bg)] border border-[var(--mornin-divider)] text-sm text-[var(--mornin-text)] focus:outline-none focus:ring-2 focus:ring-[#E9D58D]"
                  />
                  {formError && (
                    <p className="mt-1.5 text-xs text-[#C97C72] dark:text-[#D88A80]">
                      {formError}
                    </p>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-medium text-[var(--mornin-text-muted)] mb-1.5">
                    Category
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setItemCategory(cat)}
                        className={`min-h-[38px] px-3 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          itemCategory === cat
                            ? 'bg-[#E9D58D] text-[#242424] font-semibold'
                            : 'bg-[var(--mornin-bg-secondary)] text-[var(--mornin-text-muted)] hover:text-[var(--mornin-text)]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="min-h-[46px] px-6 rounded-xl bg-[#E9D58D] text-[#242424] text-sm font-semibold hover:bg-[#e1ca78] transition-colors cursor-pointer"
                  >
                    Save Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
