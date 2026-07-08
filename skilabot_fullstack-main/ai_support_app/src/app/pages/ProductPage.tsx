import { Link, useParams } from "react-router";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ClariBotWidget from "../components/ClariBotWidget";
import { products } from "../lib/storeData";
import { useCart } from "../lib/cart";

export default function ProductPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StoreHeader />
        <div className="px-6 py-20 text-center">
          <h1 className="text-3xl font-black">Product not found</h1>
          <Link to="/shop" className="mt-4 inline-block text-sky-600">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-white p-5 shadow">
          <img
            src={product.image}
            alt={product.name}
            className="h-[450px] w-full rounded-2xl object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/700x700?text=Product+Image";
            }}
          />
        </div>

        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="font-black text-sky-600">{product.category}</p>
          <h1 className="mt-2 text-4xl font-black">{product.name}</h1>

          <p className="mt-5 text-gray-600">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <p className="text-4xl font-black">${product.price.toFixed(2)}</p>
            {product.oldPrice && (
              <p className="text-xl text-gray-400 line-through">
                ${product.oldPrice.toFixed(2)}
              </p>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Stock available: {product.stock}
          </p>

          {product.badge && (
            <p className="mt-4 inline-block rounded-full bg-red-100 px-4 py-2 text-sm font-black text-red-600">
              {product.badge}
            </p>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => addToCart(product)}
              className="rounded-full bg-sky-500 px-8 py-4 font-black text-white hover:bg-sky-600"
            >
              Add to Cart
            </button>

            <Link
              to="/cart"
              className="rounded-full border px-8 py-4 font-black"
            >
              View Cart
            </Link>
          </div>
        </div>
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}