import type { Product } from "./storeData";

const WISHLIST_KEY = "clarimart_wishlist";
const WISHLIST_EVENT = "clarimart-wishlist-updated";

export function getWishlist(): Product[] {
  try {
    const saved = localStorage.getItem(WISHLIST_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWishlist(products: Product[]) {
  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(products)
  );

  window.dispatchEvent(
    new CustomEvent(WISHLIST_EVENT)
  );
}

export function isInWishlist(productId: string) {
  return getWishlist().some(
    (product) => product.id === productId
  );
}

export function addToWishlist(product: Product) {
  const current = getWishlist();

  if (
    current.some(
      (item) => item.id === product.id
    )
  ) {
    return current;
  }

  const updated = [...current, product];

  saveWishlist(updated);

  return updated;
}

export function removeFromWishlist(
  productId: string
) {
  const updated = getWishlist().filter(
    (product) => product.id !== productId
  );

  saveWishlist(updated);

  return updated;
}

export function toggleWishlist(
  product: Product
) {
  if (isInWishlist(product.id)) {
    return removeFromWishlist(product.id);
  }

  return addToWishlist(product);
}

export function clearWishlist() {
  saveWishlist([]);
}

export function subscribeToWishlist(
  callback: () => void
) {
  const customHandler = () => callback();

  const storageHandler = (
    event: StorageEvent
  ) => {
    if (event.key === WISHLIST_KEY) {
      callback();
    }
  };

  window.addEventListener(
    WISHLIST_EVENT,
    customHandler
  );

  window.addEventListener(
    "storage",
    storageHandler
  );

  return () => {
    window.removeEventListener(
      WISHLIST_EVENT,
      customHandler
    );

    window.removeEventListener(
      "storage",
      storageHandler
    );
  };
}