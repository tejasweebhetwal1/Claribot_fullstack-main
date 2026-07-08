import { Link } from "react-router";
import { ShoppingCart } from "lucide-react";
import type { Product } from "../lib/storeData";
import { useCart } from "../lib/cart";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-gray-100">
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
            {product.badge}
          </span>
        )}

        <img
          src={product.image}
          alt={product.name}
          className="h-52 w-full object-cover transition group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/500x500?text=Product+Image";
          }}
        />
      </div>

      <p className="text-sm font-bold text-sky-600">{product.category}</p>

      <Link to={`/product/${product.id}`}>
        <h3 className="mt-1 min-h-[52px] text-lg font-black hover:text-sky-600">
          {product.name}
        </h3>
      </Link>

      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
        {product.description}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <p className="text-2xl font-black">${product.price.toFixed(2)}</p>

        {product.oldPrice && (
          <p className="text-sm text-gray-400 line-through">
            ${product.oldPrice.toFixed(2)}
          </p>
        )}
      </div>

      <button
        onClick={() => addToCart(product)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 py-3 font-black text-white hover:bg-sky-600"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </button>
    </div>
  );
}