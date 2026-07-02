import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product, Collection } from '../types';

export interface WishlistItem {
  product: Product;
  collection: Collection;
  addedAt: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  toggle: (product: Product, collection: Collection) => void;
  isWished: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = 'aerher_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (product: Product, collection: Collection) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.product.id === product.id);
      if (exists) return prev.filter((i) => i.product.id !== product.id);
      return [...prev, { product, collection, addedAt: new Date().toISOString() }];
    });
  };

  const isWished = (productId: string) => items.some((i) => i.product.id === productId);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWished }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
