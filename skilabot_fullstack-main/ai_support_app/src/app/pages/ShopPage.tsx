import { useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ProductCard from "../components/ProductCard";
import ClariBotWidget from "../components/ClariBotWidget";
import { categories, products } from "../lib/storeData";

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "name"
  | "sale";

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("featured");
  const [maxPrice, setMaxPrice] = useState(30);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = `${product.name} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const matchesPrice = product.price <= maxPrice;
      const matchesStock = !inStockOnly || product.stock > 0;
      const matchesSale = !saleOnly || Boolean(product.oldPrice);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesStock &&
        matchesSale
      );
    });

    if (sort === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sort === "sale") {
      result = [...result].sort(
        (a, b) => Number(Boolean(b.oldPrice)) - Number(Boolean(a.oldPrice))
      );
    }

    return result;
  }, [
    search,
    selectedCategory,
    sort,
    maxPrice,
    inStockOnly,
    saleOnly,
  ]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSort("featured");
    setMaxPrice(30);
    setInStockOnly(false);
    setSaleOnly(false);
  }

  const filters = (
    <div className="space-y-7">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">Categories</h2>

          <button
            onClick={clearFilters}
            className="text-sm font-bold text-sky-600 hover:underline"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`w-full rounded-xl px-4 py-3 text-left font-bold transition ${
              selectedCategory === "All"
                ? "bg-sky-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            All Products
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`w-full rounded-xl px-4 py-3 text-left font-bold transition ${
                selectedCategory === category.name
                  ? "bg-sky-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-4 text-lg font-black">Maximum Price</h2>

        <input
          type="range"
          min="5"
          max="30"
          step="1"
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="w-full accent-sky-500"
        />

        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span>$5</span>
          <span className="font-black text-gray-900">${maxPrice}</span>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-4 text-lg font-black">Availability</h2>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
            className="h-4 w-4 accent-sky-500"
          />

          <span className="font-semibold">In-stock products only</span>
        </label>
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-4 text-lg font-black">Special Offers</h2>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={saleOnly}
            onChange={(event) => setSaleOnly(event.target.checked)}
            className="h-4 w-4 accent-sky-500"
          />

          <span className="font-semibold">Sale products only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main>
        <section className="border-b bg-sky-50">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="mb-2 font-black text-sky-600">
              Mediterranean grocery catalogue
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              Shop Groceries
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              Browse pantry products, dairy, halal meat, sweets, drinks and
              traditional grocery favourites.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tahini, honey, yogurt, coffee..."
                className="w-full rounded-2xl border bg-white py-4 pl-12 pr-4 outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 rounded-2xl border bg-white px-5 py-4 font-bold lg:hidden"
              >
                <Filter size={19} />
                Filters
              </button>

              <div className="relative min-w-[210px]">
                <SlidersHorizontal
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="w-full appearance-none rounded-2xl border bg-white py-4 pl-11 pr-10 font-bold outline-none"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="sale">Sale Products First</option>
                </select>

                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
            <aside className="hidden h-fit rounded-3xl bg-white p-6 shadow-sm lg:block">
              {filters}
            </aside>

            <section>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-gray-600">
                  Showing{" "}
                  <span className="font-black text-gray-900">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedCategory !== "All" && (
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="flex items-center gap-1 rounded-full bg-sky-100 px-4 py-2 text-sm font-bold text-sky-700"
                    >
                      {selectedCategory}
                      <X size={15} />
                    </button>
                  )}

                  {saleOnly && (
                    <button
                      onClick={() => setSaleOnly(false)}
                      className="flex items-center gap-1 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700"
                    >
                      Sale only
                      <X size={15} />
                    </button>
                  )}

                  {inStockOnly && (
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="flex items-center gap-1 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700"
                    >
                      In stock
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
                  <h2 className="text-2xl font-black">
                    No products found
                  </h2>

                  <p className="mt-2 text-gray-500">
                    Try changing the search or filters.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-6 rounded-full bg-sky-500 px-7 py-3 font-black text-white"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 lg:hidden">
          <div className="ml-auto h-full w-[88%] max-w-sm overflow-y-auto bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black">Product Filters</h2>

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full bg-gray-100 p-2"
              >
                <X />
              </button>
            </div>

            {filters}

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-8 w-full rounded-full bg-sky-500 py-4 font-black text-white"
            >
              Show {filteredProducts.length} Products
            </button>
          </div>
        </div>
      )}

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}