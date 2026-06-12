import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface AppState {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      addToCart: (item) => {
        const cart = get().cart;
        const existingItem = cart.find((i) => i.id === item.id);

        if (existingItem) {
          set({
            cart: cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            isCartOpen: true
          });
        } else {
          set({ cart: [...cart, item], isCartOpen: true });
        }
      },
      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((i) => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)
        })),
      clearCart: () => set({ cart: [] }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    }),
    {
      name: 'spyltmilk-storage',
    }
  )
);