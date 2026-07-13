import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { Product } from "./storeData";

export type CartItem = Product & {
  qty: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  changeQty: (id: string, amount: number) => void;
  clearCart: () => void;
  subtotal: number;
  delivery: number;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("clarimart_cart");

      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "clarimart_cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  function addToCart(product: Product) {
    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return previousCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          qty: 1,
        },
      ];
    });
  }

  function removeFromCart(id: string) {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id)
    );
  }

  function changeQty(id: string, amount: number) {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty: item.qty + amount,
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const delivery =
    subtotal >= 50 || subtotal === 0 ? 0 : 8.99;

  const total = subtotal + delivery;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        changeQty,
        clearCart,
        subtotal,
        delivery,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}