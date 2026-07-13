import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Box,
  Calendar,
  DollarSign,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { api } from "../lib/api";

type AdminOrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

type AdminOrder = {
  id: string;
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: AdminOrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  deliveryMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const result = await api.adminOrders();
      setOrders(result);
    } catch (err) {
      console.error(err);
      setError(
        "Orders could not be loaded. Make sure the backend is running on port 4000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return orders;

    return orders.filter((order) =>
      [
        order.id,
        order.customer?.name,
        order.customer?.email,
        order.customer?.phone,
        order.orderStatus,
        order.paymentStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [orders, search]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const totalItems = orders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.qty || 0),
        0
      ),
    0
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-sky-600">
              ClariMart Administration
            </p>

            <h1 className="text-3xl font-black">Demo Orders</h1>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admin-dashboard"
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-bold"
            >
              <ArrowLeft size={18} />
              Dashboard
            </Link>

            <button
              onClick={loadOrders}
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-bold text-white"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500">Total Orders</p>
                <p className="mt-2 text-4xl font-black">{orders.length}</p>
              </div>

              <div className="rounded-2xl bg-sky-100 p-4 text-sky-600">
                <ShoppingBag size={28} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500">Demo Revenue</p>
                <p className="mt-2 text-4xl font-black">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl bg-green-100 p-4 text-green-700">
                <DollarSign size={28} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500">Items Ordered</p>
                <p className="mt-2 text-4xl font-black">{totalItems}</p>
              </div>

              <div className="rounded-2xl bg-purple-100 p-4 text-purple-700">
                <Box size={28} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Recent Orders</h2>
              <p className="text-sm text-gray-500">
                Orders created through the fake checkout.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, customer or email..."
                className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {loading && (
            <div className="py-14 text-center font-bold text-gray-500">
              Loading orders...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl bg-red-50 p-5 text-red-700">
              <p className="font-black">Could not load orders</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="py-14 text-center">
              <PackageCheck
                className="mx-auto mb-4 text-gray-300"
                size={60}
              />

              <h3 className="text-xl font-black">No orders found</h3>

              <p className="mt-2 text-gray-500">
                Place a demo order through the shop checkout first.
              </p>
            </div>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-3 py-4">Order</th>
                    <th className="px-3 py-4">Customer</th>
                    <th className="px-3 py-4">Items</th>
                    <th className="px-3 py-4">Payment</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4">Total</th>
                    <th className="px-3 py-4">Date</th>
                    <th className="px-3 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-3 py-5">
                        <p className="font-black">{order.id}</p>
                      </td>

                      <td className="px-3 py-5">
                        <p className="font-black">
                          {order.customer?.name || "Guest customer"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {order.customer?.email || "No email"}
                        </p>
                      </td>

                      <td className="px-3 py-5">
                        {(order.items || []).reduce(
                          (sum, item) => sum + Number(item.qty || 0),
                          0
                        )}
                      </td>

                      <td className="px-3 py-5">
                        <span className="rounded-full bg-green-100 px-3 py-2 text-xs font-black text-green-700">
                          {order.paymentStatus || "Paid (Demo)"}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-black text-sky-700">
                          {order.orderStatus || "Received"}
                        </span>
                      </td>

                      <td className="px-3 py-5 font-black">
                        ${Number(order.total || 0).toFixed(2)}
                      </td>

                      <td className="px-3 py-5 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-3 py-5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-black text-white"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-sky-600">
                  Order details
                </p>

                <h2 className="text-3xl font-black">{selectedOrder.id}</h2>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-gray-100 px-4 py-2 font-black"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="mb-3 flex items-center gap-2 font-black">
                  <UserRound size={18} />
                  Customer
                </p>

                <p>{selectedOrder.customer?.name || "Guest customer"}</p>

                <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  {selectedOrder.customer?.email || "No email"}
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  {selectedOrder.customer?.phone || "No phone"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="mb-3 flex items-center gap-2 font-black">
                  <MapPin size={18} />
                  Delivery
                </p>

                <p className="text-sm text-gray-600">
                  {selectedOrder.customer?.address || "No address"}
                </p>

                <p className="mt-3 font-bold">
                  Method: {selectedOrder.deliveryMethod || "Standard"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border p-5">
              <h3 className="mb-4 text-xl font-black">Products</h3>

              <div className="space-y-4">
                {(selectedOrder.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl bg-gray-100 object-contain p-1"
                    />

                    <div className="flex-1">
                      <p className="font-black">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        ${Number(item.price).toFixed(2)} × {item.qty}
                      </p>
                    </div>

                    <p className="font-black">
                      ${(Number(item.price) * Number(item.qty)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <b>${Number(selectedOrder.subtotal || 0).toFixed(2)}</b>
              </div>

              <div className="mt-3 flex justify-between">
                <span>Delivery</span>
                <b>
                  {Number(selectedOrder.delivery || 0) === 0
                    ? "Free"
                    : `$${Number(selectedOrder.delivery).toFixed(2)}`}
                </b>
              </div>

              <hr className="my-5 border-slate-700" />

              <div className="flex justify-between text-2xl">
                <span className="font-black">Total</span>
                <b>${Number(selectedOrder.total || 0).toFixed(2)}</b>
              </div>

              <p className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                <Calendar size={16} />
                {formatDate(selectedOrder.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}