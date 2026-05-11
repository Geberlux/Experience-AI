import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);
        let newItems;
        if (existing) {
          newItems = items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newItems = [...items, { ...item, quantity: 1 }];
        }
        const total = newItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items: newItems, total });
      },
      removeItem: (id) => {
        const newItems = get().items.filter((i) => i.id !== id);
        const total = newItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items: newItems, total });
      },
      updateQuantity: (id, quantity) => {
        const newItems = get().items.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
        );
        const total = newItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items: newItems, total });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'experience-cart',
    }
  )
);
