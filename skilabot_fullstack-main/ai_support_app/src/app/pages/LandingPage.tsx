import { Link } from "react-router";
import { ArrowRight, Bot, CheckCircle, ShoppingCart, Truck } from "lucide-react";
import { products } from "../lib/products";
import { useCart } from "../lib/cart";
import ClariBotWidget from "../components/ClariBotWidget";

export default function LandingPage() {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-orange-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-black text-orange-700">
            ClariMart
          </Link>

          <nav className="hidden gap-6 font-semibold md:flex">
            <Link to="/shop">Shop</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/cart">Cart</Link>
          </nav>

          <Link
            to="/cart"
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-white"
          >
            <ShoppingCart size={18} />
            Cart
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 font-bold text-orange-700">
            Online grocery store demo
          </p>

          <h1 className="mb-5 text-5xl font-black leading-tight">
            Buy groceries online with ClariBot AI customer support.
          </h1>

          <p className="mb-6 text-gray-600">
            Customers can browse products, add items to cart, checkout with demo
            card details, and get help from ClariBot live support.
          </p>

          <div className="flex gap-3">
            <Link
              to="/shop"
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/contact"
              className="rounded-xl border border-orange-300 bg-white px-6 py-3 font-bold text-orange-700"
            >
              Contact Us
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow">
              <Truck className="mb-2 text-orange-600" />
              <b>Local Delivery</b>
              <p className="text-sm text-gray-500">Free over $50</p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow">
              <Bot className="mb-2 text-orange-600" />
              <b>AI Support</b>
              <p className="text-sm text-gray-500">ClariBot live chat</p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow">
              <CheckCircle className="mb-2 text-orange-600" />
              <b>Demo Payment</b>
              <p className="text-sm text-gray-500">No real charge</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mb-4 text-8xl">🛒</div>
          <h2 className="mb-2 text-3xl font-black">Full Business Site</h2>
          <p className="text-gray-600">
            Product catalogue, shopping cart, fake checkout, order success page,
            contact form and AI customer support.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black">Featured Products</h2>
            <p className="text-gray-600">Popular items from our store.</p>
          </div>

          <Link to="/shop" className="font-bold text-orange-700">
            View all products
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="rounded-3xl bg-white p-6 shadow">
              <div className="mb-4 text-center text-6xl">{product.image}</div>
              <p className="text-sm font-bold text-orange-700">
                {product.category}
              </p>
              <h3 className="min-h-[56px] text-xl font-black">{product.name}</h3>
              <p className="mb-4 text-gray-600">{product.description}</p>
              <p className="mb-4 text-2xl font-black">
                ${product.price.toFixed(2)}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 rounded-xl bg-orange-600 py-3 font-bold text-white"
                >
                  Add to Cart
                </button>

                <Link
                  to={`/product/${product.id}`}
                  className="rounded-xl border px-4 py-3 font-bold"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ClariBotWidget />
    </div>
  );
}