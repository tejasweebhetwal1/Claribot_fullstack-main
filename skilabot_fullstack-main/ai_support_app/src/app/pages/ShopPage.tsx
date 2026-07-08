import { useState } from "react";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ProductCard from "../components/ProductCard";
import ClariBotWidget from "../components/ClariBotWidget";
import { categories, products } from "../lib/storeData";

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory = category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black">Shop Groceries</h1>
          <p className="text-gray-600">
            Browse products, add items to cart and continue to demo checkout.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl bg-white p-5 shadow">
            <h2 className="mb-4 text-xl font-black">Categories</h2>

            <button
              onClick={() => setCategory("All")}
              className={`mb-2 block w-full rounded-xl px-4 py-3 text-left font-bold ${
                category === "All" ? "bg-sky-500 text-white" : "bg-gray-100"
              }`}
            >
              All Products
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.name)}
                className={`mb-2 block w-full rounded-xl px-4 py-3 text-left font-bold ${
                  category === cat.name ? "bg-sky-500 text-white" : "bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </aside>

          <section>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="mb-6 w-full rounded-2xl border bg-white px-5 py-4 outline-none"
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}