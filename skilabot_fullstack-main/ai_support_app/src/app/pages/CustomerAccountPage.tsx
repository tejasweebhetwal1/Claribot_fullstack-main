import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Heart,
  Loader2,
  LogOut,
  MessageCircle,
  Package,
  PackageSearch,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ClariBotWidget from "../components/ClariBotWidget";

import {
  api,
  clearSession,
  getUser,
  type ApiConversation,
  type ApiOrder,
} from "../lib/api";

import { useCart } from "../lib/cart";
import {
  products,
  type Product,
} from "../lib/storeData";

type AccountSection =
  | "home"
  | "orders"
  | "track"
  | "wishlist"
  | "support";

const WISHLIST_KEY =
  "clarimart_wishlist";

function formatMoney(value?: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getSavedWishlist(): Product[] {
  try {
    const stored =
      localStorage.getItem(WISHLIST_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveWishlist(
  wishlist: Product[]
) {
  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(wishlist)
  );

  window.dispatchEvent(
    new Event(
      "clarimart-wishlist-change"
    )
  );
}

function OrderStatus({
  status,
}: {
  status?: string;
}) {
  const normalised = String(
    status || "Received"
  ).toLowerCase();

  let classes =
    "bg-sky-100 text-sky-700";

  if (
    normalised.includes("preparing")
  ) {
    classes =
      "bg-amber-100 text-amber-700";
  }

  if (
    normalised.includes("delivery") ||
    normalised.includes("dispatched")
  ) {
    classes =
      "bg-purple-100 text-purple-700";
  }

  if (
    normalised.includes("delivered") ||
    normalised.includes("completed")
  ) {
    classes =
      "bg-green-100 text-green-700";
  }

  if (
    normalised.includes("cancelled")
  ) {
    classes =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${classes}`}
    >
      {status || "Received"}
    </span>
  );
}

export default function CustomerAccountPage() {
  const navigate = useNavigate();
  const user = getUser();
  const { addToCart } = useCart();

  const [section, setSection] =
    useState<AccountSection>("home");

  const [orders, setOrders] =
    useState<ApiOrder[]>([]);

  const [
    loadingOrders,
    setLoadingOrders,
  ] = useState(true);

  const [
    ordersError,
    setOrdersError,
  ] = useState("");

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<ApiOrder | null>(
    null
  );

  const [trackingId, setTrackingId] =
    useState("");

  const [
    trackingOrder,
    setTrackingOrder,
  ] = useState<ApiOrder | null>(
    null
  );

  const [
    trackingLoading,
    setTrackingLoading,
  ] = useState(false);

  const [
    trackingError,
    setTrackingError,
  ] = useState("");

  const [wishlist, setWishlist] =
    useState<Product[]>([]);

  const [
    conversations,
    setConversations,
  ] = useState<ApiConversation[]>([]);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(false);

  const [
    conversationsError,
    setConversationsError,
  ] = useState("");

  const [
    conversationSearch,
    setConversationSearch,
  ] = useState("");

  const [
    selectedConversation,
    setSelectedConversation,
  ] =
    useState<ApiConversation | null>(
      null
    );

  const [toast, setToast] =
    useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate, user]);

  useEffect(() => {
    setWishlist(
      getSavedWishlist()
    );

    function refreshWishlist() {
      setWishlist(
        getSavedWishlist()
      );
    }

    window.addEventListener(
      "clarimart-wishlist-change",
      refreshWishlist
    );

    window.addEventListener(
      "storage",
      refreshWishlist
    );

    return () => {
      window.removeEventListener(
        "clarimart-wishlist-change",
        refreshWishlist
      );

      window.removeEventListener(
        "storage",
        refreshWishlist
      );
    };
  }, []);

  useEffect(() => {
    if (user?.email) {
      loadCustomerOrders();
      loadConversations();
    }
  }, [user?.email]);

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  }

  async function loadCustomerOrders() {
    if (!user?.email) {
      return;
    }

    setLoadingOrders(true);
    setOrdersError("");

    try {
      const result =
        await api.customerOrders(
          user.email
        );

      setOrders(result.orders);
    } catch (error: any) {
      console.error(
        "Customer orders error:",
        error
      );

      setOrdersError(
        error?.message ||
          "Your orders could not be loaded."
      );
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadConversations() {
    setLoadingConversations(true);
    setConversationsError("");

    try {
      const result =
        await api.conversations();

      const sorted = [...result].sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
              b.createdAt
          ).getTime() -
          new Date(
            a.updatedAt ||
              a.createdAt
          ).getTime()
      );

      setConversations(sorted);
    } catch (error: any) {
      console.error(
        "Conversation history error:",
        error
      );

      setConversationsError(
        error?.message ||
          "Your ClariBot conversations could not be loaded."
      );
    } finally {
      setLoadingConversations(false);
    }
  }

  async function handleTrackOrder() {
    const orderId =
      trackingId.trim();

    if (!orderId) {
      setTrackingError(
        "Please enter an order ID."
      );

      return;
    }

    setTrackingLoading(true);
    setTrackingError("");
    setTrackingOrder(null);

    try {
      const result =
        await api.trackOrder(orderId);

      const accountEmail =
        String(user?.email || "")
          .trim()
          .toLowerCase();

      const orderEmail =
        String(
          result.order.customer
            ?.email || ""
        )
          .trim()
          .toLowerCase();

      if (
        accountEmail &&
        orderEmail &&
        accountEmail !== orderEmail
      ) {
        throw new Error(
          "This order does not belong to your account."
        );
      }

      setTrackingOrder(
        result.order
      );
    } catch (error: any) {
      console.error(
        "Track order error:",
        error
      );

      setTrackingError(
        error?.message ||
          "Order not found."
      );
    } finally {
      setTrackingLoading(false);
    }
  }

  function reorder(order: ApiOrder) {
    order.items.forEach(
      (orderItem) => {
        const matchingProduct =
          products.find(
            (product) =>
              String(product.id) ===
              String(orderItem.id)
          );

        if (matchingProduct) {
          for (
            let count = 0;
            count <
            Number(orderItem.qty || 1);
            count += 1
          ) {
            addToCart(
              matchingProduct
            );
          }
        }
      }
    );

    showToast(
      "Available order items were added to your cart."
    );
  }

  function addWishlistItemToCart(
    product: Product
  ) {
    addToCart(product);

    showToast(
      `${product.name} added to cart.`
    );
  }

  function removeWishlistItem(
    productId: string
  ) {
    const updated =
      wishlist.filter(
        (product) =>
          product.id !== productId
      );

    setWishlist(updated);
    saveWishlist(updated);

    showToast(
      "Product removed from wishlist."
    );
  }

  function logout() {
    clearSession();
    navigate("/");
  }

  const totalSpent = useMemo(
    () =>
      orders.reduce(
        (total, order) =>
          total +
          Number(order.total || 0),
        0
      ),
    [orders]
  );

  const filteredConversations =
    useMemo(() => {
      const query =
        conversationSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          [
            conversation.title,
            conversation.status,
            conversation.sentiment,
            ...(conversation.messages || []).map(
              (message) =>
                message.text
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }, [
      conversations,
      conversationSearch,
    ]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {toast && (
        <div className="fixed right-5 top-5 z-[200] rounded-xl bg-green-600 px-5 py-3 font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      <StoreHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-3xl bg-gradient-to-r from-sky-700 to-sky-500 p-8 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-100">
                Welcome back
              </p>

              <h1 className="mt-2 text-4xl font-black">
                {user.name}
              </h1>

              <p className="mt-3 text-sky-100">
                Manage your orders,
                saved products and
                ClariBot support history.
              </p>
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <UserRound size={40} />
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setSection("home")
            }
            className={`rounded-full px-5 py-3 font-black ${
              section === "home"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Account Home
          </button>

          <button
            type="button"
            onClick={() =>
              setSection("orders")
            }
            className={`rounded-full px-5 py-3 font-black ${
              section === "orders"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            My Orders
          </button>

          <button
            type="button"
            onClick={() =>
              setSection("track")
            }
            className={`rounded-full px-5 py-3 font-black ${
              section === "track"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Track Order
          </button>

          <button
            type="button"
            onClick={() =>
              setSection("wishlist")
            }
            className={`rounded-full px-5 py-3 font-black ${
              section === "wishlist"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Wishlist ({wishlist.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setSection("support");
              loadConversations();
            }}
            className={`flex items-center gap-2 rounded-full px-5 py-3 font-black ${
              section === "support"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            <MessageCircle size={18} />
            Live Support (
            {conversations.length})
          </button>
        </div>

        {section === "home" && (
          <>
            <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <Package className="text-sky-600" />

                <p className="mt-4 text-sm font-bold text-gray-500">
                  My Orders
                </p>

                <p className="mt-1 text-4xl font-black">
                  {orders.length}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <CircleDollarSign className="text-green-600" />

                <p className="mt-4 text-sm font-bold text-gray-500">
                  Demo Spending
                </p>

                <p className="mt-1 text-4xl font-black">
                  {formatMoney(totalSpent)}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <Heart className="text-red-500" />

                <p className="mt-4 text-sm font-bold text-gray-500">
                  Wishlist
                </p>

                <p className="mt-1 text-4xl font-black">
                  {wishlist.length}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <MessageCircle className="text-purple-600" />

                <p className="mt-4 text-sm font-bold text-gray-500">
                  Support Chats
                </p>

                <p className="mt-1 text-4xl font-black">
                  {conversations.length}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <Bot className="text-sky-600" />

                <p className="mt-4 text-sm font-bold text-gray-500">
                  ClariBot
                </p>

                <p className="mt-1 text-xl font-black">
                  Available
                </p>
              </div>
            </section>

            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() =>
                  setSection("orders")
                }
                className="rounded-3xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <Package
                  size={43}
                  className="text-sky-600"
                />

                <h2 className="mt-6 text-2xl font-black">
                  My Orders
                </h2>

                <p className="mt-2 text-gray-500">
                  View previous purchases.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSection("track")
                }
                className="rounded-3xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <Truck
                  size={43}
                  className="text-sky-600"
                />

                <h2 className="mt-6 text-2xl font-black">
                  Track Orders
                </h2>

                <p className="mt-2 text-gray-500">
                  Track your demo order.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSection("wishlist")
                }
                className="rounded-3xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <Heart
                  size={43}
                  className="text-red-500"
                />

                <h2 className="mt-6 text-2xl font-black">
                  Wishlist
                </h2>

                <p className="mt-2 text-gray-500">
                  View saved products.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSection("support");
                  loadConversations();
                }}
                className="rounded-3xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <MessageCircle
                  size={43}
                  className="text-purple-600"
                />

                <h2 className="mt-6 text-2xl font-black">
                  Live Support
                </h2>

                <p className="mt-2 text-gray-500">
                  View your ClariBot
                  conversation history.
                </p>
              </button>
            </section>

            <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black">
                Account Information
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div>
                  <p className="text-sm font-bold text-gray-500">
                    Name
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {user.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-500">
                    Account Type
                  </p>

                  <p className="mt-1 text-lg font-black capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="mt-7 flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-black text-white"
              >
                <LogOut size={18} />
                Logout
              </button>
            </section>
          </>
        )}

        {section === "orders" && (
          <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-black">
                  My Orders
                </h2>

                <p className="mt-1 text-gray-500">
                  Orders placed using{" "}
                  <b>{user.email}</b>
                </p>
              </div>

              <button
                type="button"
                onClick={
                  loadCustomerOrders
                }
                disabled={loadingOrders}
                className="flex items-center gap-2 rounded-full border px-5 py-3 font-black"
              >
                <RefreshCw
                  size={17}
                  className={
                    loadingOrders
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            {loadingOrders && (
              <div className="flex items-center justify-center py-20">
                <Loader2
                  size={40}
                  className="animate-spin text-sky-600"
                />
              </div>
            )}

            {!loadingOrders &&
              ordersError && (
                <div className="mt-6 rounded-2xl bg-red-50 p-5 font-bold text-red-700">
                  {ordersError}
                </div>
              )}

            {!loadingOrders &&
              !ordersError &&
              orders.length === 0 && (
                <div className="py-20 text-center">
                  <ShoppingBag
                    size={70}
                    className="mx-auto text-gray-300"
                  />

                  <h3 className="mt-5 text-2xl font-black">
                    No orders found
                  </h3>

                  <Link
                    to="/shop"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-600 px-7 py-3 font-black text-white"
                  >
                    Start Shopping
                    <ArrowRight
                      size={17}
                    />
                  </Link>
                </div>
              )}

            {!loadingOrders &&
              orders.length > 0 && (
                <div className="mt-7 space-y-5">
                  {orders.map(
                    (order) => (
                      <article
                        key={order.id}
                        className="rounded-3xl border p-6"
                      >
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <div>
                            <p className="text-sm font-bold text-gray-500">
                              Order ID
                            </p>

                            <h3 className="mt-1 text-xl font-black">
                              {order.id}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {formatDate(
                                order.createdAt
                              )}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <OrderStatus
                              status={
                                order.orderStatus
                              }
                            />

                            <span className="text-2xl font-black">
                              {formatMoney(
                                order.total
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                            className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 font-black text-white"
                          >
                            <Eye size={17} />
                            View Order
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTrackingId(
                                order.id
                              );

                              setTrackingOrder(
                                order
                              );

                              setTrackingError(
                                ""
                              );

                              setSection(
                                "track"
                              );
                            }}
                            className="rounded-full border px-5 py-3 font-black"
                          >
                            Track Order
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              reorder(order)
                            }
                            className="flex items-center gap-2 rounded-full border border-sky-600 px-5 py-3 font-black text-sky-600"
                          >
                            <ShoppingCart
                              size={17}
                            />
                            Buy Again
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
          </section>
        )}

        {section === "track" && (
          <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm">
            <div className="max-w-3xl">
              <p className="font-black text-sky-600">
                Delivery tracking
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Track Your Order
              </h2>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={trackingId}
                    onChange={(event) =>
                      setTrackingId(
                        event.target.value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleTrackOrder();
                      }
                    }}
                    placeholder="DEMO-1234567890"
                    className="w-full rounded-full border py-4 pl-12 pr-5 outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    handleTrackOrder
                  }
                  disabled={
                    trackingLoading
                  }
                  className="flex items-center justify-center gap-2 rounded-full bg-sky-600 px-7 py-4 font-black text-white"
                >
                  {trackingLoading ? (
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <PackageSearch
                      size={19}
                    />
                  )}

                  Track
                </button>
              </div>

              {trackingError && (
                <div className="mt-5 rounded-2xl bg-red-50 p-5 font-bold text-red-700">
                  {trackingError}
                </div>
              )}

              {trackingOrder && (
                <div className="mt-8 overflow-hidden rounded-3xl border">
                  <div className="bg-slate-900 p-6 text-white">
                    <h3 className="text-2xl font-black">
                      {trackingOrder.id}
                    </h3>

                    <div className="mt-3">
                      <OrderStatus
                        status={
                          trackingOrder.orderStatus
                        }
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid gap-5 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          Payment
                        </p>

                        <p className="font-black">
                          {trackingOrder.paymentStatus ||
                            "Paid (Demo)"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Delivery
                        </p>

                        <p className="font-black capitalize">
                          {trackingOrder.deliveryMethod ||
                            "Standard"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Total
                        </p>

                        <p className="font-black">
                          {formatMoney(
                            trackingOrder.total
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 rounded-2xl bg-sky-50 p-5">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-sky-600" />

                        <p className="font-black">
                          Order received
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {section === "wishlist" && (
          <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm">
            <h2 className="text-3xl font-black">
              My Wishlist
            </h2>

            {wishlist.length === 0 ? (
              <div className="py-20 text-center">
                <Heart
                  size={75}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-5 text-2xl font-black">
                  Your wishlist is empty
                </h3>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {wishlist.map(
                  (product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-3xl border"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-56 w-full bg-gray-50 object-contain p-5"
                      />

                      <div className="p-5">
                        <h3 className="text-xl font-black">
                          {product.name}
                        </h3>

                        <p className="mt-3 text-2xl font-black">
                          {formatMoney(
                            product.price
                          )}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            addWishlistItemToCart(
                              product
                            )
                          }
                          className="mt-5 w-full rounded-full bg-sky-600 px-5 py-3 font-black text-white"
                        >
                          Add to Cart
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeWishlistItem(
                              product.id
                            )
                          }
                          className="mt-3 w-full rounded-full border border-red-200 px-5 py-3 font-black text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        )}

        {section === "support" && (
          <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="font-black text-purple-600">
                  ClariBot history
                </p>

                <h2 className="text-3xl font-black">
                  Live Support Conversations
                </h2>

                <p className="mt-2 text-gray-500">
                  View conversations stored
                  by ClariBot support.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  loadConversations
                }
                disabled={
                  loadingConversations
                }
                className="flex items-center gap-2 rounded-full border px-5 py-3 font-black"
              >
                <RefreshCw
                  size={17}
                  className={
                    loadingConversations
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>
            </div>

            <div className="relative mt-6 max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={
                  conversationSearch
                }
                onChange={(event) =>
                  setConversationSearch(
                    event.target.value
                  )
                }
                placeholder="Search conversations..."
                className="w-full rounded-full border py-3 pl-11 pr-5 outline-none focus:border-sky-500"
              />
            </div>

            {loadingConversations && (
              <div className="flex justify-center py-20">
                <Loader2
                  size={42}
                  className="animate-spin text-sky-600"
                />
              </div>
            )}

            {!loadingConversations &&
              conversationsError && (
                <div className="mt-6 rounded-2xl bg-red-50 p-5 font-bold text-red-700">
                  {conversationsError}
                </div>
              )}

            {!loadingConversations &&
              !conversationsError &&
              filteredConversations.length ===
                0 && (
                <div className="py-20 text-center">
                  <MessageCircle
                    size={70}
                    className="mx-auto text-gray-300"
                  />

                  <h3 className="mt-5 text-2xl font-black">
                    No conversations found
                  </h3>

                  <p className="mt-2 text-gray-500">
                    Start a conversation with
                    ClariBot and it will appear
                    here after being saved.
                  </p>
                </div>
              )}

            {!loadingConversations &&
              filteredConversations.length >
                0 && (
                <div className="mt-7 space-y-4">
                  {filteredConversations.map(
                    (conversation) => (
                      <article
                        key={
                          conversation.id
                        }
                        className="rounded-3xl border p-5 transition hover:border-sky-300 hover:shadow-md"
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                <Bot
                                  size={22}
                                />
                              </div>

                              <div>
                                <h3 className="font-black">
                                  {conversation.title ||
                                    "ClariBot Support"}
                                </h3>

                                <p className="text-sm text-gray-500">
                                  {formatDate(
                                    conversation.updatedAt ||
                                      conversation.createdAt
                                  )}
                                </p>
                              </div>
                            </div>

                            <p className="mt-4 line-clamp-2 text-sm text-gray-600">
                              {conversation
                                .messages?.[
                                conversation
                                  .messages
                                  .length -
                                  1
                              ]?.text ||
                                "No messages"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black capitalize text-green-700">
                              {conversation.status ||
                                "open"}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedConversation(
                                  conversation
                                )
                              }
                              className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 font-black text-white"
                            >
                              <Eye
                                size={17}
                              />
                              Open
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
          </section>
        )}
      </main>

      {selectedConversation && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b p-5">
              <div>
                <p className="text-sm font-black text-sky-600">
                  ClariBot Support
                </p>

                <h2 className="text-xl font-black">
                  {selectedConversation.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedConversation(
                    null
                  )
                }
                className="rounded-full bg-gray-100 p-3"
              >
                <X size={19} />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-100 p-6">
              {(
                selectedConversation.messages ||
                []
              ).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "rounded-br-md bg-sky-600 text-white"
                        : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-6">
                      {message.text}
                    </p>

                    <p
                      className={`mt-2 text-xs ${
                        message.role === "user"
                          ? "text-sky-100"
                          : "text-gray-400"
                      }`}
                    >
                      {formatDate(
                        message.createdAt
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <h2 className="text-3xl font-black">
                {selectedOrder.id}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="rounded-full bg-gray-100 p-3"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {selectedOrder.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl border p-4"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-contain"
                      />
                    )}

                    <div className="flex-1">
                      <p className="font-black">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {formatMoney(
                          item.price
                        )}{" "}
                        × {item.qty}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}