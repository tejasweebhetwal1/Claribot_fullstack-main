import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Heart,
  ShoppingCart,
} from "lucide-react";

import type { Product } from "../lib/storeData";
import { useCart } from "../lib/cart";
import {
  isInWishlist,
  subscribeToWishlist,
  toggleWishlist,
} from "../lib/wishlist";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const [saved, setSaved] = useState(
    isInWishlist(product.id)
  );

  useEffect(() => {
    return subscribeToWishlist(() => {
      setSaved(
        isInWishlist(product.id)
      );
    });
  }, [product.id]);

  function handleWishlist() {
    toggleWishlist(product);

    setSaved(
      isInWishlist(product.id)
    );
  }

  function handleAddToCart() {
    addToCart(product);
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <button
        type="button"
        onClick={handleWishlist}
        aria-label={
          saved
            ? `Remove ${product.name} from wishlist`
            : `Add ${product.name} to wishlist`
        }
        className={`absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow transition ${
          saved
            ? "border-red-200 text-red-500"
            : "border-gray-200 text-gray-500 hover:text-red-500"
        }`}
      >
        <Heart
          size={21}
          fill={
            saved
              ? "currentColor"
              : "none"
          }
        />
      </button>

      {product.badge && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
          {product.badge}
        </span>
      )}

      <Link
        to={`/product/${product.id}`}
        className="block overflow-hidden bg-gray-50"
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-64 w-full object-contain p-5 transition duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src =
              "https://placehold.co/600x600?text=ClariMart+Product";
          }}
        />
      </Link>

      <div className="p-5">
        <p className="text-xs font-black uppercase tracking-wide text-sky-600">
          {product.category}
        </p>

        <Link
          to={`/product/${product.id}`}
        >
          <h2 className="mt-2 min-h-[56px] text-xl font-black leading-tight text-gray-900 hover:text-sky-600">
            {product.name}
          </h2>
        </Link>

        <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-gray-500">
          {product.description}
        </p>

        <div className="mt-5 flex items-end gap-2">
          <p className="text-2xl font-black">
            ${product.price.toFixed(2)}
          </p>

          {product.oldPrice && (
            <p className="pb-1 text-sm text-gray-400 line-through">
              ${product.oldPrice.toFixed(2)}
            </p>
          )}
        </div>

        <p
          className={`mt-2 text-sm font-bold ${
            product.stock > 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {product.stock > 0
            ? `${product.stock} in stock`
            : "Out of stock"}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart size={19} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}