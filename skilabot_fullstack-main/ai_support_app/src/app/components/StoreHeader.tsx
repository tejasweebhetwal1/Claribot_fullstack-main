import { Link } from "react-router-dom";
import {
  Menu,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import { getUser } from "../lib/api";
import { useCart } from "../lib/cart";

export default function StoreHeader() {
  const user = getUser();
  const { cart } = useCart();

  const cartItemCount = cart.reduce(
    (total, item) => total + item.qty,
    0
  );

  const rawName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "Account";

  const displayName =
    rawName === "Account"
      ? "Account"
      : rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="bg-sky-500 px-4 py-2 text-center text-sm font-bold text-white">
        Free delivery over $50 | Demo grocery website with ClariBot AI Support
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-5 px-6 py-4">
        <button
          type="button"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu />
        </button>

        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ClariMart logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            className="h-12 w-12 rounded-full object-contain"
          />

          <div>
            <p className="text-2xl font-black text-sky-600">
              ClariMart
            </p>

            <p className="text-xs text-gray-500">
              Mediterranean Grocery Store
            </p>
          </div>
        </Link>

        <div className="hidden flex-1 items-center rounded-full border bg-gray-50 px-4 py-3 md:flex">
          <Search
            className="mr-2 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search groceries, sweets, dairy, halal meat..."
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link
            to={user ? "/account" : "/login"}
            className="hidden items-center gap-2 font-semibold md:flex"
          >
            <UserRound size={20} />
            {displayName}
          </Link>

          <Link
            to="/cart"
            aria-label={`Open cart with ${cartItemCount} items`}
            className="relative flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 font-bold text-white transition hover:bg-sky-600"
          >
            <ShoppingCart size={20} />
            Cart

            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-xs font-black text-white shadow-md">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="hidden border-t md:block">
        <div className="mx-auto flex max-w-7xl gap-8 px-6 py-3 font-bold">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/shop">Categories</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admin-login">Admin</Link>
        </div>
      </nav>
    </header>
  );
}