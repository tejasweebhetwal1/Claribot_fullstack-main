import { Link } from "react-router";
import { Menu, Search, ShoppingCart, UserRound } from "lucide-react";

export default function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="bg-sky-500 px-4 py-2 text-center text-sm font-bold text-white">
        Free delivery over $50 | Demo grocery website with ClariBot AI Support
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-5 px-6 py-4">
        <button className="md:hidden">
          <Menu />
        </button>

        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="h-12 w-12 rounded-full object-contain"
          />
          <div>
            <p className="text-2xl font-black text-sky-600">ClariMart</p>
            <p className="text-xs text-gray-500">Mediterranean Grocery Store</p>
          </div>
        </Link>

        <div className="hidden flex-1 items-center rounded-full border bg-gray-50 px-4 py-3 md:flex">
          <Search className="mr-2 text-gray-400" size={20} />
          <input
            placeholder="Search groceries, sweets, dairy, halal meat..."
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link to="/login" className="hidden items-center gap-2 font-semibold md:flex">
            <UserRound size={20} />
            Account
          </Link>

          <Link
            to="/cart"
            className="flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 font-bold text-white"
          >
            <ShoppingCart size={20} />
            Cart
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