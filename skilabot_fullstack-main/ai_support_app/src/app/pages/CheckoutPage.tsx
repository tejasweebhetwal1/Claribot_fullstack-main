import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  PackageCheck,
  Truck,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ClariBotWidget from "../components/ClariBotWidget";
import { useCart } from "../lib/cart";
import { api } from "../lib/api";

type DeliveryMethod = "standard" | "express" | "pickup";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("standard");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    suburb: "",
    state: "NSW",
    postcode: "",
    cardName: "",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/30",
    cvv: "123",
  });

  const deliveryCosts: Record<DeliveryMethod, number> = {
    standard: subtotal >= 50 ? 0 : 8.99,
    express: 14.99,
    pickup: 0,
  };

  const delivery = deliveryCosts[deliveryMethod];
  const total = subtotal + delivery;

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateForm() {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone
    ) {
      alert("Please complete your contact details.");
      return false;
    }

    if (
      deliveryMethod !== "pickup" &&
      (!form.address ||
        !form.suburb ||
        !form.state ||
        !form.postcode)
    ) {
      alert("Please complete your delivery address.");
      return false;
    }

    if (
      !form.cardName ||
      !form.cardNumber ||
      !form.expiry ||
      !form.cvv
    ) {
      alert("Please complete the demo card details.");
      return false;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return false;
    }

    return true;
  }

  async function placeOrder() {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await api.createOrder({
        customer: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          address:
            deliveryMethod === "pickup"
              ? "Store pickup"
              : `${form.address}, ${form.suburb}, ${form.state} ${form.postcode}`,
        },
        items: cart,
        subtotal,
        delivery,
        total,
        deliveryMethod,
        paymentStatus: "Paid (Demo)",
      });

      clearCart();
      navigate(`/order-success/${result.order.id}`);
    } catch (error) {
      console.error(error);
      alert(
        "Order could not be saved. Make sure the backend is running on port 4000."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main>
        <section className="border-b bg-sky-50">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="mb-2 font-black text-sky-600">
              Secure demonstration checkout
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              Checkout
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              Enter delivery and fake payment details to place a demo
              grocery order. No real payment is processed.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-sky-100 p-3 text-sky-600">
                  <MapPin size={22} />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Customer Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Enter contact and delivery information.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.firstName}
                  onChange={(event) =>
                    updateField("firstName", event.target.value)
                  }
                  placeholder="First name"
                  className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                />

                <input
                  value={form.lastName}
                  onChange={(event) =>
                    updateField("lastName", event.target.value)
                  }
                  placeholder="Last name"
                  className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                />

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="Email address"
                  className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                />

                <input
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  placeholder="Phone number"
                  className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                />
              </div>
            </section>

            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-sky-100 p-3 text-sky-600">
                  <Truck size={22} />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Delivery Method
                  </h2>
                  <p className="text-sm text-gray-500">
                    Choose how you want to receive your order.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("standard")}
                  className={`flex items-center justify-between rounded-2xl border p-5 text-left ${
                    deliveryMethod === "standard"
                      ? "border-sky-500 bg-sky-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Truck className="text-sky-500" />

                    <div>
                      <p className="font-black">
                        Standard Delivery
                      </p>
                      <p className="text-sm text-gray-500">
                        Estimated 2–4 business days
                      </p>
                    </div>
                  </div>

                  <b>
                    {subtotal >= 50 ? "Free" : "$8.99"}
                  </b>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod("express")}
                  className={`flex items-center justify-between rounded-2xl border p-5 text-left ${
                    deliveryMethod === "express"
                      ? "border-sky-500 bg-sky-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <PackageCheck className="text-sky-500" />

                    <div>
                      <p className="font-black">
                        Express Delivery
                      </p>
                      <p className="text-sm text-gray-500">
                        Estimated next business day
                      </p>
                    </div>
                  </div>

                  <b>$14.99</b>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`flex items-center justify-between rounded-2xl border p-5 text-left ${
                    deliveryMethod === "pickup"
                      ? "border-sky-500 bg-sky-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <MapPin className="text-sky-500" />

                    <div>
                      <p className="font-black">Store Pickup</p>
                      <p className="text-sm text-gray-500">
                        Collect from the demo store
                      </p>
                    </div>
                  </div>

                  <b>Free</b>
                </button>
              </div>
            </section>

            {deliveryMethod !== "pickup" && (
              <section className="rounded-3xl bg-white p-7 shadow-sm">
                <h2 className="mb-6 text-2xl font-black">
                  Delivery Address
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    placeholder="Street address"
                    className="sm:col-span-2 rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  />

                  <input
                    value={form.suburb}
                    onChange={(event) =>
                      updateField("suburb", event.target.value)
                    }
                    placeholder="Suburb"
                    className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  />

                  <select
                    value={form.state}
                    onChange={(event) =>
                      updateField("state", event.target.value)
                    }
                    className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  >
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="QLD">QLD</option>
                    <option value="SA">SA</option>
                    <option value="WA">WA</option>
                    <option value="TAS">TAS</option>
                    <option value="ACT">ACT</option>
                    <option value="NT">NT</option>
                  </select>

                  <input
                    value={form.postcode}
                    onChange={(event) =>
                      updateField("postcode", event.target.value)
                    }
                    placeholder="Postcode"
                    className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  />
                </div>
              </section>
            )}

            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3 text-green-700">
                  <CreditCard size={22} />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Demo Payment
                  </h2>
                  <p className="text-sm text-gray-500">
                    No details are sent to a real payment provider.
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-2xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
                Use card number 4242 4242 4242 4242, expiry
                12/30 and CVV 123. No money will be deducted.
              </div>

              <div className="grid gap-4">
                <input
                  value={form.cardName}
                  onChange={(event) =>
                    updateField("cardName", event.target.value)
                  }
                  placeholder="Name on card"
                  className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                />

                <input
                  value={form.cardNumber}
                  onChange={(event) =>
                    updateField("cardNumber", event.target.value)
                  }
                  placeholder="Card number"
                  className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    value={form.expiry}
                    onChange={(event) =>
                      updateField("expiry", event.target.value)
                    }
                    placeholder="MM/YY"
                    className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  />

                  <input
                    value={form.cvv}
                    onChange={(event) =>
                      updateField("cvv", event.target.value)
                    }
                    placeholder="CVV"
                    className="rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <LockKeyhole size={17} />
                Demo checkout only. Card details are not permanently
                stored.
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl bg-white p-7 shadow-sm lg:sticky lg:top-40">
            <h2 className="text-2xl font-black">
              Order Summary
            </h2>

            <div className="mt-6 max-h-[330px] space-y-4 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border-b pb-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl bg-gray-100 object-contain p-1"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-black">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Quantity: {item.qty}
                    </p>
                  </div>

                  <b className="text-sm">
                    ${(item.price * item.qty).toFixed(2)}
                  </b>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <b className="text-gray-900">
                  ${subtotal.toFixed(2)}
                </b>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <b className="text-gray-900">
                  {delivery === 0
                    ? "Free"
                    : `$${delivery.toFixed(2)}`}
                </b>
              </div>
            </div>

            <hr className="my-6" />

            <div className="flex items-center justify-between">
              <span className="text-xl font-black">Total</span>
              <span className="text-3xl font-black text-sky-600">
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={loading || cart.length === 0}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-4 font-black text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                "Placing Order..."
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Place Demo Order
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              By placing this order, you confirm that this is a
              classroom demonstration only.
            </p>
          </aside>
        </section>
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}