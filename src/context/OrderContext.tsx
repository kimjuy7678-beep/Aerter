import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product, Collection } from '../types';

export interface OrderLineItem {
  product: Product;
  collection: Collection;
  qty: number;
}

export interface Order {
  id: string;
  date: string;            // 'YYYY.MM.DD'
  status: '결제 완료' | '배송 준비' | '배송 중' | '배송 완료';
  items: OrderLineItem[];
  totalPrice: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
}

interface OrderContextValue {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => Order;
}

const OrderContext = createContext<OrderContextValue | null>(null);
const STORAGE_KEY = 'aerher_orders';

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (data: Omit<Order, 'id' | 'date' | 'status'>): Order => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const order: Order = {
      ...data,
      id: `ORD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      date: `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`,
      status: '결제 완료',
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used inside OrderProvider');
  return ctx;
}
