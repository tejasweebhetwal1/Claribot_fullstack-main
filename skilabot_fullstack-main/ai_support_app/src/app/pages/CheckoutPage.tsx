import { useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard } from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ClariBotWidget from "../components/ClariBotWidget";
import { useCart } from "../lib/cart";
import { api } from "../lib/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal, delivery, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cardName: "",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/30",
    cvv: "123",
  });

  async function placeOrder() {
    if (!form.name || !form.email || !form.address) {
      alert("Please fill name, email and delivery address.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const result = await api.createOrder({
        customer: form,
        items: cart,
        subtotal,
        delivery,
        total,
        paymentStatus: "Paid",
      });

      clearCart();
      navigate(`/order-success/${result.order.id}`);
    } catch {
      alert("Order could not be saved. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-[1fr_360px]">
        <section className="rounded-3xl bg-white p-6 shadow">
          <h1 className="mb-3 text-4xl font-black">Secure Checkout</h1>

          <p className="mb-6 rounded-2xl bg-yellow-100 p-4 text-sm font-semibold text-yellow-800">
            Place your order using your card details today. No payment will be processed until your order is confirmed and shipped.
          </p>

          <div className="grid gap-4">
            <input className="rounded-xl border px-4 py-3" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="rounded-xl border px-4 py-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="rounded-xl border px-4 py-3" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea className="rounded-xl border px-4 py-3" placeholder="Delivery address" rows={4} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

            <div className="mt-4 flex items-center gap-2 text-xl font-black">
              <CreditCard />
               Card Details
            </div>

            <input className="rounded-xl border px-4 py-3" placeholder="Name on card" value={form.cardName} onChange={(e) => setForm({ ...form, cardName: e.target.value })} />
            <input className="rounded-xl border px-4 py-3" placeholder="Card number" value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} />

            <div className="grid grid-cols-2 gap-4">
              <input className="rounded-xl border px-4 py-3" placeholder="Expiry" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
              <input className="rounded-xl border px-4 py-3" placeholder="CVV" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} />
            </div>

            <button
              onClick={placeOrder}
              disabled={loading}
              className="rounded-full bg-green-600 py-4 font-black text-white disabled:opacity-60"
            >
              {loading ? "Placing Order..." : "Place your Order"}
            </button>
          </div>
        </section>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow">
          <h2 className="mb-5 text-2xl font-black">Order Summary</h2>

          {cart.map((item) => (
            <p key={item.id} className="mb-3 flex justify-between text-sm">
              <span>{item.name} × {item.qty}</span>
              <b>${(item.price * item.qty).toFixed(2)}</b>
            </p>
          ))}

          <hr className="my-5" />

          <p className="flex justify-between"><span>Subtotal</span><b>${subtotal.toFixed(2)}</b></p>
          <p className="mt-3 flex justify-between"><span>Delivery</span><b>{delivery === 0 ? "Free" : `$${delivery.toFixed(2)}`}</b></p>
          <p className="mt-5 flex justify-between text-xl"><span>Total</span><b>${total.toFixed(2)}</b></p>
        </aside>
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}