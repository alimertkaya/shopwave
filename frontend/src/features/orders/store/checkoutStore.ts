import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CheckoutGroup {
  checkoutId: string;
  orderIds: string[];
  createdAt: string;
}

interface CheckoutStore {
  groups: CheckoutGroup[];
  addGroup: (group: CheckoutGroup) => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      groups: [],
      addGroup: (group) =>
        set((s) => ({ groups: [group, ...s.groups].slice(0, 50) })),
    }),
    { name: 'checkout-groups' },
  ),
);
