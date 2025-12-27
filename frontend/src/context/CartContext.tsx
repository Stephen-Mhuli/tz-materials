"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Product } from "@/lib/types";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  addItem: (product: Product, quantity?: number) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const storageKey = "lmga-cart";

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    setItems(readStoredCart());
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    (product, quantity = 1) => {
      if (quantity <= 0) return;
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [{ product, quantity }, ...prev];
      });
    },
    [],
  );

  const updateItem = useCallback<CartContextValue["updateItem"]>(
    (productId, quantity) => {
      setItems((prev) => {
        if (quantity <= 0) {
          return prev.filter((item) => item.product.id !== productId);
        }
        return prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        );
      });
    },
    [],
  );

  const removeItem = useCallback<CartContextValue["removeItem"]>((productId) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalCount,
      totalAmount,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [items, totalCount, totalAmount, addItem, updateItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
}
