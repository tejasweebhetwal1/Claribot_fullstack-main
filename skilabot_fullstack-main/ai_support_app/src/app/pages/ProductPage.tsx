import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ClariBotWidget from "../components/ClariBotWidget";
import ProductCard from "../components/ProductCard";
import { products } from "../lib/storeData";
import { useCart } from "../lib/cart";

export default function ProductPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StoreHeader />

        <main className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="rounded-3xl bg-white p-10 shadow">
            <h1 className="text-3xl font-black">Product not found</h1>

            <Link
              to="/shop"
              className="mt-6 inline-block rounded-full bg-sky-500 px-7 py-3 font-black text-white"
            >
              Back to Shop
            </Link>
          </div>
        </main>

        <StoreFooter />
      </div>
    );
  }

  const relatedProducts = products
    .filter(
      (item) =>
        item.id !== product.id && item.category === product.category
    )
    .slice(0, 4);

  function addSelectedQuantity() {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main>
        <section className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-sky-600">
              Home
            </Link>

            <span className="mx-2">/</span>

            <Link to="/shop" className="hover:text-sky-600">
              Shop
            </Link>

            <span className="mx-2">/</span>

            <span className="font-semibold text-gray-900">
              {product.name}
            </span>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="relative overflow-hidden rounded-3xl bg-gray-100">
              {product.badge && (
                <span className="absolute left-5 top-5 z-10 rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white">
                  {product.badge}
                </span>
              )}

              <img
                src={product.image}
                alt={product.name}
                className="h-[520px] w-full object-contain p-6"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/800x800?text=Product+Image";
                }}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="font-black uppercase tracking-wide text-sky-600">
              {product.category}
            </p>

            <h1 className="mt-2 text-4xl font-black leading-tight md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <p className="text-4xl font-black text-gray-900">
                ${product.price.toFixed(2)}
              </p>

              {product.oldPrice && (
                <p className="text-xl text-gray-400 line-through">
                  ${product.oldPrice.toFixed(2)}
                </p>
              )}
            </div>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              {product.description}
            </p>

            <div className="mt-6 rounded-2xl bg-green-50 p-4">
              <p className="flex items-center gap-2 font-black text-green-700">
                <CheckCircle2 size={20} />
                In stock
              </p>

              <p className="mt-1 text-sm text-green-700">
                {product.stock} units currently available
              </p>
            </div>

            <div className="mt-8">
              <p className="mb-3 font-black">Quantity</p>

              <div className="flex items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-full border">
                  <button
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="p-3 hover:bg-gray-100"
                  >
                    <Minus size={18} />
                  </button>

                  <span className="min-w-[48px] text-center font-black">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(product.stock, current + 1)
                      )
                    }
                    className="p-3 hover:bg-gray-100"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <button
                  onClick={addSelectedQuantity}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-black text-white hover:bg-sky-600"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 border-t pt-7 sm:grid-cols-3">
              <div>
                <Truck className="mb-2 text-sky-500" />
                <p className="font-black">Fast Delivery</p>
                <p className="text-sm text-gray-500">Free over $50</p>
              </div>

              <div>
                <ShieldCheck className="mb-2 text-sky-500" />
                <p className="font-black">Quality Checked</p>
                <p className="text-sm text-gray-500">Trusted products</p>
              </div>

              <div>
                <CheckCircle2 className="mb-2 text-sky-500" />
                <p className="font-black">Demo Checkout</p>
                <p className="text-sm text-gray-500">No real payment</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h2 className="mb-3 text-xl font-black">
                  Product Information
                </h2>

                <p className="leading-7 text-gray-600">
                  Carefully selected grocery product suitable for everyday
                  family meals and traditional Mediterranean-style cooking.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-black">Ingredients</h2>

                <p className="leading-7 text-gray-600">
                  Ingredients may vary by product. Please check the product
                  packaging before consumption.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-black">
                  Delivery Information
                </h2>

                <p className="leading-7 text-gray-600">
                  Local delivery is free for orders over $50. Standard delivery
                  is $8.99 for smaller orders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="bg-white py-14">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-8">
                <p className="font-black text-sky-600">
                  You may also like
                </p>

                <h2 className="text-4xl font-black">
                  Related Products
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}