import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function StoreFooter() {
  return (
    <footer className="mt-16 bg-gray-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <h3 className="mb-3 text-2xl font-black text-sky-400">ClariMart</h3>
          <p className="text-sm text-gray-300">
            A demo online grocery business selling Mediterranean, Middle Eastern
            and Turkish-style products with AI customer support.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-black">Shop</h4>
          <div className="grid gap-2 text-sm text-gray-300">
            <Link to="/shop">All Products</Link>
            <Link to="/shop">Pantry</Link>
            <Link to="/shop">Halal Meat</Link>
            <Link to="/shop">Sweets</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-black">Customer Service</h4>
          <div className="grid gap-2 text-sm text-gray-300">
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/checkout">Checkout</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-black">Contact</h4>
          <div className="grid gap-3 text-sm text-gray-300">
            <p className="flex gap-2">
              <MapPin size={18} /> Sydney, NSW Australia
            </p>
            <p className="flex gap-2">
              <Phone size={18} /> 02 1234 5678
            </p>
            <p className="flex gap-2">
              <Mail size={18} /> support@clarimart.com
            </p>

            <div className="mt-2 flex gap-3">
              <Facebook />
              <Instagram />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-400">
        © 2026 ClariMart. Demo website only. No real payments are processed.
      </div>
    </footer>
  );
}