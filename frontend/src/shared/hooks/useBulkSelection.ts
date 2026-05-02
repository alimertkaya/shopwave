import { useState } from 'react';

export const useBulkSelection = <T extends { id: string }>(items: T[]) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(
      selected.size === items.length ? new Set() : new Set(items.map((i) => i.id))
    );

  const clearAll = () => setSelected(new Set());

  return {
    selected,
    selectedIds: Array.from(selected),
    isSelected: (id: string) => selected.has(id),
    isAllSelected: items.length > 0 && selected.size === items.length,
    toggleOne,
    toggleAll,
    clearAll,
  };
};
