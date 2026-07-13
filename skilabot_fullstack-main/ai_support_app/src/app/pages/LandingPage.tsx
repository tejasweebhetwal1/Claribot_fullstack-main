import { Link } from "react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CreditCard,
  Headphones,
  ShieldCheck,
  Truck,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ProductCard from "../components/ProductCard";
import ClariBotWidget from "../components/ClariBotWidget";
import { categories, products } from "../lib/storeData";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <StoreHeader />

      <main>
        <section className="bg-sky-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="mb-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-black text-sky-600 shadow">
                Fresh groceries delivered Australia-wide
              </p>

              <h1 className="mb-5 text-4xl font-black leading-tight md:text-6xl">
                Mediterranean, Middle Eastern & Turkish groceries online.
              </h1>

              <p className="mb-8 max-w-xl text-lg text-gray-600">
                Shop pantry essentials, halal items, sweets, drinks and everyday
                groceries from a professional business website powered by
                ClariBot AI customer support.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="flex items-center gap-2 rounded-full bg-sky-500 px-7 py-4 font-black text-white hover:bg-sky-600"
                >
                  Shop Now
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/contact"
                  className="rounded-full border border-sky-300 bg-white px-7 py-4 font-black text-sky-600"
                >
                  Contact Store
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="/hero-grocery.png"
                alt="Grocery store banner"
                className="h-[400px] w-full object-cover md:h-[400px]"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/900x600?text=Grocery+Hero+Banner";
                }}
              />
            </div>
          </div>
        </section>

        <section className="border-y bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <Truck className="text-sky-500" />
              <div>
                <b>Fast Delivery</b>
                <p className="text-sm text-gray-500">Free over $50</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-sky-500" />
              <div>
                <b>Quality Products</b>
                <p className="text-sm text-gray-500">Fresh & trusted items</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="text-sky-500" />
              <div>
                <b>SecureCheckout</b>
                <p className="text-sm text-gray-500">No real payment</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Headphones className="text-sky-500" />
              <div>
                <b>AI Support</b>
                <p className="text-sm text-gray-500">ClariBot live chat</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 text-center">
            <p className="font-black text-sky-600">Shop by category</p>
            <h2 className="text-4xl font-black">Popular Categories</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                to="/shop"
                key={category.id}
                className="group overflow-hidden rounded-3xl bg-white shadow"
              >
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x400?text=Category";
                    }}
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-black group-hover:text-sky-600">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-gray-500">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-black text-sky-600">Fresh deals</p>
                <h2 className="text-4xl font-black">Featured Products</h2>
              </div>

              <Link to="/shop" className="font-black text-sky-600">
                View all products →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid overflow-hidden rounded-3xl bg-sky-500 md:grid-cols-2">
            <div className="p-10 text-white md:p-14">
              <p className="mb-3 font-black">Weekly Specials</p>
              <h2 className="mb-4 text-4xl font-black">
                Save on pantry, sweets and halal grocery favourites.
              </h2>
              <p className="mb-6 text-sky-50">
                This section makes the site feel like a real online store with
                seasonal promotions and product offers.
              </p>
              <Link
                to="/shop"
                className="inline-block rounded-full bg-white px-7 py-4 font-black text-sky-600"
              >
                Browse Specials
              </Link>
            </div>

            <img
              src="/offer-banner.jpg"
              alt="Special offers"
              className="h-full min-h-[320px] w-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/900x600?text=Weekly+Specials";
              }}
            />
          </div>
        </section>

        <section className="bg-gray-50 py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 text-center">
              <p className="font-black text-sky-600">Why choose us</p>
              <h2 className="text-4xl font-black">A Complete Business Website</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-8 shadow">
                <CheckCircle2 className="mb-4 text-sky-500" size={36} />
                <h3 className="mb-2 text-xl font-black">Real Store Layout</h3>
                <p className="text-gray-500">
                  Includes homepage, categories, product cards, promotions,
                  support and footer.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow">
                <CreditCard className="mb-4 text-sky-500" size={36} />
                <h3 className="mb-2 text-xl font-black">Secure Checkout</h3>
                <p className="text-gray-500">
                  You can complete your order using your preferred payment card. Please note that your card will not be charged at this time; payment will only be processed once your order has been confirmed and shipped.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow">
                <Bot className="mb-4 text-sky-500" size={36} />
                <h3 className="mb-2 text-xl font-black">ClariBot Support</h3>
                <p className="text-gray-500">
                  Your chatbot becomes live AI customer support instead of being
                  the whole website.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="rounded-3xl bg-gray-900 p-10 text-center text-white">
            <h2 className="mb-3 text-4xl font-black">Join our newsletter</h2>
            <p className="mb-6 text-gray-300">
              Get weekly grocery offers, new arrivals and delivery updates.
            </p>

            <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
              <input
                placeholder="Enter your email"
                className="flex-1 rounded-full px-5 py-4 text-gray-900 outline-none"
              />
              <button className="rounded-full bg-sky-500 px-7 py-4 font-black">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}