import { Link } from "react-router";
import { Trash2 } from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ClariBotWidget from "../components/ClariBotWidget";
import { useCart } from "../lib/cart";

export default function CartPage() {
  const { cart, changeQty, removeFromCart, subtotal, delivery, total } =
    useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-4xl font-black">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <h2 className="mb-3 text-2xl font-black">Your cart is empty</h2>
            <p className="mb-6 text-gray-600">Add products before checkout.</p>
            <Link
              to="/shop"
              className="rounded-full bg-sky-500 px-8 py-4 font-black text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_350px]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 rounded-3xl bg-white p-5 shadow md:grid-cols-[90px_1fr_auto]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-2xl object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/200x200?text=Item";
                    }}
                  />

                  <div>
                    <h2 className="font-black">{item.name}</h2>
                    <p className="text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="rounded border px-3 py-1"
                    >
                      -
                    </button>

                    <b>{item.qty}</b>

                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="rounded border px-3 py-1"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-3xl bg-white p-6 shadow">
              <h2 className="mb-5 text-2xl font-black">Order Summary</h2>

              <p className="flex justify-between">
                <span>Subtotal</span>
                <b>${subtotal.toFixed(2)}</b>
              </p>

              <p className="mt-3 flex justify-between">
                <span>Delivery</span>
                <b>{delivery === 0 ? "Free" : `$${delivery.toFixed(2)}`}</b>
              </p>

              <hr className="my-5" />

              <p className="flex justify-between text-xl">
                <span>Total</span>
                <b>${total.toFixed(2)}</b>
              </p>

              <Link
                to="/checkout"
                className="mt-6 block rounded-full bg-sky-500 py-4 text-center font-black text-white"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}