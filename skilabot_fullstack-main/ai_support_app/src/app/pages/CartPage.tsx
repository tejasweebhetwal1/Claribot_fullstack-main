import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ClariBotWidget from "../components/ClariBotWidget";
import { useCart } from "../lib/cart";

export default function CartPage() {
  const {
    cart,
    changeQty,
    removeFromCart,
    subtotal,
    delivery,
    total,
  } = useCart();

  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const freeDeliveryTarget = 50;
  const remainingForFreeDelivery = Math.max(
    0,
    freeDeliveryTarget - subtotal
  );

  const deliveryProgress = Math.min(
    100,
    (subtotal / freeDeliveryTarget) * 100
  );

  function applyCoupon() {
    if (!coupon.trim()) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    if (coupon.trim().toUpperCase() === "DEMO10") {
      setCouponMessage(
        "DEMO10 accepted for Discount. 10% discount applied to your order."
      );
      return;
    }

    setCouponMessage("Invalid coupon code.");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main>
        <section className="border-b bg-sky-50">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="mb-2 font-black text-sky-600">
              Review your grocery order
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              Shopping Cart
            </h1>

            <p className="mt-3 text-gray-600">
              Check quantities, delivery cost and order total before
              continuing to demo checkout.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          {cart.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <ShoppingBag
                className="mx-auto mb-5 text-sky-500"
                size={70}
              />

              <h2 className="text-3xl font-black">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-3 max-w-md text-gray-500">
                Browse the grocery catalogue and add products before
                proceeding to checkout.
              </p>

              <Link
                to="/shop"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-sky-500 px-8 py-4 font-black text-white hover:bg-sky-600"
              >
                Start Shopping
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <section>
                <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Truck className="text-sky-500" />

                    <div className="flex-1">
                      {remainingForFreeDelivery > 0 ? (
                        <p className="font-bold">
                          Add{" "}
                          <span className="font-black text-sky-600">
                            ${remainingForFreeDelivery.toFixed(2)}
                          </span>{" "}
                          more for free delivery.
                        </p>
                      ) : (
                        <p className="font-black text-green-700">
                          You have qualified for free delivery.
                        </p>
                      )}

                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-sky-500 transition-all"
                          style={{
                            width: `${deliveryProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-5 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-[120px_1fr] lg:grid-cols-[120px_1fr_auto]"
                    >
                      <Link
                        to={`/product/${item.id}`}
                        className="overflow-hidden rounded-2xl bg-gray-100"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-28 w-full object-contain p-2"
                          onError={(event) => {
                            event.currentTarget.src =
                              "https://placehold.co/300x300?text=Product";
                          }}
                        />
                      </Link>

                      <div>
                        <p className="text-sm font-black text-sky-600">
                          {item.category}
                        </p>

                        <Link to={`/product/${item.id}`}>
                          <h2 className="mt-1 text-xl font-black hover:text-sky-600">
                            {item.name}
                          </h2>
                        </Link>

                        <p className="mt-2 text-sm text-gray-500">
                          ${item.price.toFixed(2)} per item
                        </p>

                        <p className="mt-3 font-black">
                          Item total: $
                          {(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:col-span-2 lg:col-span-1 lg:flex-col lg:items-end">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-2 text-sm font-bold text-red-600 hover:underline"
                        >
                          <Trash2 size={17} />
                          Remove
                        </button>

                        <div className="flex items-center overflow-hidden rounded-full border">
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            className="p-3 hover:bg-gray-100"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={17} />
                          </button>

                          <span className="min-w-[42px] text-center font-black">
                            {item.qty}
                          </span>

                          <button
                            onClick={() => changeQty(item.id, 1)}
                            disabled={item.qty >= item.stock}
                            className="p-3 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black">
                    Have a coupon code?
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    For demonstration, try the code DEMO10.
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={coupon}
                      onChange={(event) =>
                        setCoupon(event.target.value)
                      }
                      placeholder="Enter coupon code"
                      className="flex-1 rounded-full border px-5 py-3 outline-none focus:border-sky-500"
                    />

                    <button
                      onClick={applyCoupon}
                      className="rounded-full border border-sky-500 px-6 py-3 font-black text-sky-600 hover:bg-sky-50"
                    >
                      Apply Coupon
                    </button>
                  </div>

                  {couponMessage && (
                    <p className="mt-3 text-sm font-bold text-gray-600">
                      {couponMessage}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    to="/shop"
                    className="font-black text-sky-600 hover:underline"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </section>

              <aside className="h-fit rounded-3xl bg-white p-7 shadow-sm lg:sticky lg:top-40">
                <h2 className="text-2xl font-black">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Subtotal (
                      {cart.reduce(
                        (sum, item) => sum + item.qty,
                        0
                      )}{" "}
                      items)
                    </span>

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

                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <b className="text-gray-900">$0.00</b>
                  </div>
                </div>

                <hr className="my-6" />

                <div className="flex items-center justify-between">
                  <span className="text-xl font-black">
                    Total
                  </span>

                  <span className="text-3xl font-black text-sky-600">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  All prices are displayed in Australian dollars.
                </p>

                <Link
                  to="/checkout"
                  className="mt-7 flex items-center justify-center gap-2 rounded-full bg-sky-500 py-4 font-black text-white hover:bg-sky-600"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Link>

                <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
                  Your card details are secure. You will only be charged after your order has been confirmed.
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-black text-gray-500">
                  <div className="rounded-xl border p-3">VISA</div>
                  <div className="rounded-xl border p-3">
                    Mastercard
                  </div>
                  <div className="rounded-xl border p-3">
                    Demo Pay
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}