import { Link, useParams } from "react-router";
import { CheckCircle2 } from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ClariBotWidget from "../components/ClariBotWidget";

export default function OrderSuccessPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main className="mx-auto max-w-xl px-6 py-20">
        <div className="rounded-3xl bg-white p-10 text-center shadow">
          <CheckCircle2 className="mx-auto mb-5 text-green-600" size={80} />

          <h1 className="mb-3 text-4xl font-black">Order Successful!</h1>

          <p className="mb-3 text-gray-600">
            Your grocery order has been placed successfully.
          </p>

          <p className="mb-6 font-black">Order ID: {id}</p>

          <p className="mb-8 rounded-2xl bg-yellow-100 p-4 text-sm font-semibold text-yellow-800">
            Your payment was processed successfully. We are now preparing your order.
          </p>

          <Link
            to="/shop"
            className="rounded-full bg-sky-500 px-8 py-4 font-black text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}