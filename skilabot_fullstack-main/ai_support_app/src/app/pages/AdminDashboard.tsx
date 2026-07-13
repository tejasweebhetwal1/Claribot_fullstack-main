import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Box,
  CheckCircle,
  DollarSign,
  Download,
  Eye,
  Globe,
  Loader2,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  api,
  clearSession,
  getToken,
  type ApiConversation,
  type ApiSettings,
  type ApiSummary,
} from "../lib/api";

type Tab =
  | "overview"
  | "orders"
  | "conversations"
  | "analytics"
  | "settings";

type AdminOrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  category?: string;
};

type AdminOrder = {
  id: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items?: AdminOrderItem[];
  subtotal?: number;
  delivery?: number;
  total?: number;
  deliveryMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt: string;
};

const HOURLY_CHAT_DATA = [
  { hour: "8am", chats: 5 },
  { hour: "10am", chats: 11 },
  { hour: "12pm", chats: 17 },
  { hour: "2pm", chats: 13 },
  { hour: "4pm", chats: 21 },
  { hour: "6pm", chats: 16 },
  { hour: "8pm", chats: 9 },
];

const WEEKLY_SUPPORT_DATA = [
  { day: "Mon", resolved: 21, escalated: 2 },
  { day: "Tue", resolved: 18, escalated: 3 },
  { day: "Wed", resolved: 26, escalated: 1 },
  { day: "Thu", resolved: 24, escalated: 4 },
  { day: "Fri", resolved: 30, escalated: 2 },
  { day: "Sat", resolved: 15, escalated: 1 },
  { day: "Sun", resolved: 11, escalated: 1 },
];

const SENTIMENT_DATA = [
  { day: "Mon", positive: 72, neutral: 20, negative: 8 },
  { day: "Tue", positive: 75, neutral: 18, negative: 7 },
  { day: "Wed", positive: 70, neutral: 21, negative: 9 },
  { day: "Thu", positive: 79, neutral: 15, negative: 6 },
  { day: "Fri", positive: 82, neutral: 13, negative: 5 },
  { day: "Sat", positive: 78, neutral: 17, negative: 5 },
  { day: "Sun", positive: 84, neutral: 12, negative: 4 },
];

const CHANNEL_DATA = [
  { name: "Website", value: 70, color: "#0284c7" },
  { name: "Contact Form", value: 15, color: "#16a34a" },
  { name: "Email", value: 10, color: "#9333ea" },
  { name: "Other", value: 5, color: "#f97316" },
];

function formatMoney(value?: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBackground,
  iconColor,
  description,
}: {
  label: string;
  value: string;
  icon: any;
  iconBackground: string;
  iconColor: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-4xl font-black text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{
            background: iconBackground,
            color: iconColor,
          }}
        >
          <Icon size={26} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status?: string;
}) {
  const normalised = String(status || "open").toLowerCase();

  const style =
    normalised === "resolved" ||
    normalised === "received" ||
    normalised.includes("paid")
      ? "bg-green-100 text-green-700"
      : normalised === "escalated" ||
          normalised === "cancelled"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${style}`}
    >
      {status || "Open"}
    </span>
  );
}

function SentimentBadge({
  sentiment,
}: {
  sentiment?: string;
}) {
  const normalised = sentiment || "neutral";

  const map: Record<
    string,
    {
      emoji: string;
      className: string;
    }
  > = {
    positive: {
      emoji: "😊",
      className: "text-green-700",
    },
    neutral: {
      emoji: "😐",
      className: "text-amber-700",
    },
    negative: {
      emoji: "😟",
      className: "text-red-700",
    },
  };

  const current = map[normalised] || map.neutral;

  return (
    <span
      className={`text-sm font-bold capitalize ${current.className}`}
    >
      {current.emoji} {normalised}
    </span>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border bg-white px-4 py-3 text-xs shadow-xl">
      <p className="mb-1 font-black text-gray-900">
        {label}
      </p>

      {payload.map((item: any) => (
        <p
          key={item.name}
          style={{
            color:
              item.color ||
              item.stroke ||
              item.fill,
          }}
        >
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tab, setTab] =
    useState<Tab>("overview");

  const [summary, setSummary] =
    useState<ApiSummary | null>(null);

  const [orders, setOrders] =
    useState<AdminOrder[]>([]);

  const [
    adminConversations,
    setAdminConversations,
  ] = useState<ApiConversation[]>([]);

  const [settings, setSettings] =
    useState<ApiSettings>({
      businessName: "ClariMart",
      escalationEmail:
        "admin@clarimart.com",
      botTone: "Friendly and concise",
      retentionDays: 90,
      confidenceThreshold: 85,
      maxTurns: 8,
      slackWebhook: "",
    });

  const [loadingData, setLoadingData] =
    useState(false);

  const [
    savingSettings,
    setSavingSettings,
  ] = useState(false);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<ApiConversation | null>(null);

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<AdminOrder | null>(null);

  const [
    loadingConversation,
    setLoadingConversation,
  ] = useState(false);

  const [conversationSearch, setConversationSearch] =
    useState("");

  const [orderSearch, setOrderSearch] =
    useState("");

  const [
    conversationMenu,
    setConversationMenu,
  ] = useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState(new Date());

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(
    message: string,
    type: "success" | "error" = "success"
  ) {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  const loadData = useCallback(async () => {
    if (!getToken()) {
      navigate("/admin-login");
      return;
    }

    setLoadingData(true);

    try {
      const [
        summaryResult,
        settingsResult,
        conversationsResult,
        ordersResult,
      ] = await Promise.all([
        api.adminSummary(),
        api.adminSettings(),
        api.adminConversations(),
        api.adminOrders(),
      ]);

      const fixedConversations =
        conversationsResult.map(
          (conversation) => ({
            ...conversation,
            status:
              conversation.status || "open",
            sentiment:
              conversation.sentiment ||
              "neutral",
            messageCount:
              conversation.messageCount ??
              conversation.messages?.length ??
              0,
            updatedAt:
              conversation.updatedAt ||
              conversation.createdAt,
          })
        );

      setAdminConversations(
        fixedConversations
      );

      setOrders(
        Array.isArray(ordersResult)
          ? ordersResult
          : []
      );

      setSummary({
        ...summaryResult,
        totalConversations:
          fixedConversations.length,
        users:
          summaryResult.users ??
          summaryResult.totalUsers ??
          0,
        leads:
          summaryResult.leads ??
          summaryResult.leadsCaptured ??
          0,
        resolved:
          summaryResult.resolved ?? 0,
        escalated:
          summaryResult.escalated ?? 0,
        open:
          summaryResult.open ??
          fixedConversations.filter(
            (conversation) =>
              conversation.status === "open"
          ).length,
        resolutionRate:
          summaryResult.resolutionRate ?? 0,
        sentiment:
          summaryResult.sentiment ?? {
            positive: 0,
            neutral:
              fixedConversations.length,
            negative: 0,
          },
        recentConversations:
          fixedConversations.slice(0, 5),
      });

      setSettings((current) => ({
        ...current,
        ...settingsResult,
      }));

      setLastUpdated(new Date());
    } catch (error: any) {
      console.error(
        "Admin dashboard error:",
        error
      );

      showToast(
        "Failed to load dashboard data. Check that the backend is running.",
        "error"
      );
    } finally {
      setLoadingData(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRevenue = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      ),
    [orders]
  );

  const totalItemsOrdered = useMemo(
    () =>
      orders.reduce(
        (orderTotal, order) =>
          orderTotal +
          (order.items || []).reduce(
            (itemTotal, item) =>
              itemTotal +
              Number(item.qty || 0),
            0
          ),
        0
      ),
    [orders]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const query =
      orderSearch.toLowerCase().trim();

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
  }, [orders, orderSearch]);

  const filteredConversations = useMemo(() => {
    const query =
      conversationSearch
        .toLowerCase()
        .trim();

    if (!query) return adminConversations;

    return adminConversations.filter(
      (conversation) =>
        [
          conversation.title,
          conversation.status,
          conversation.sentiment,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
    );
  }, [
    adminConversations,
    conversationSearch,
  ]);

  async function handleViewConversation(
    id: string
  ) {
    setConversationMenu(null);
    setLoadingConversation(true);

    try {
      const conversation =
        await api.adminGetConversation(id);

      setSelectedConversation(
        conversation
      );
    } catch {
      const localConversation =
        adminConversations.find(
          (conversation) =>
            conversation.id === id
        );

      if (localConversation) {
        setSelectedConversation(
          localConversation
        );
      } else {
        showToast(
          "Could not open conversation.",
          "error"
        );
      }
    } finally {
      setLoadingConversation(false);
    }
  }

  async function handleDeleteConversation(
    id: string
  ) {
    setDeletingId(id);
    setConversationMenu(null);

    try {
      await api.adminDeleteConversation(id);

      setAdminConversations((current) =>
        current.filter(
          (conversation) =>
            conversation.id !== id
        )
      );

      showToast(
        "Conversation deleted."
      );
    } catch {
      showToast(
        "Conversation could not be deleted.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveSettings() {
    setSavingSettings(true);

    try {
      const result =
        await api.saveSettings(settings);

      setSettings((current) => ({
        ...current,
        ...result,
      }));

      showToast(
        "Settings saved successfully."
      );
    } catch {
      showToast(
        "Settings could not be saved.",
        "error"
      );
    } finally {
      setSavingSettings(false);
    }
  }

  function handleExport() {
    const url = api.adminExportUrl();
    const token = getToken();

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Export failed"
          );
        }

        return response.blob();
      })
      .then((blob) => {
        const anchor =
          document.createElement("a");

        anchor.href =
          URL.createObjectURL(blob);

        anchor.download = `clarimart-data-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;

        anchor.click();

        URL.revokeObjectURL(
          anchor.href
        );

        showToast(
          "CSV downloaded successfully."
        );
      })
      .catch(() => {
        showToast(
          "CSV export is not available.",
          "error"
        );
      });
  }

  function handleLogout() {
    clearSession();
    navigate("/admin-login");
  }

  const tabs: {
    id: Tab;
    label: string;
    icon: any;
  }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Globe,
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
    },
    {
      id: "conversations",
      label: "AI Conversations",
      icon: MessageCircle,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: ArrowUpRight,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {toast && (
        <div
          className={`fixed right-5 top-5 z-[200] flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white shadow-xl ${
            toast.type === "success"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <X size={18} />
          )}

          {toast.message}
        </div>
      )}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-5 px-6 py-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-sky-600">
              ClariMart Business Administration
            </p>

            <h1 className="text-3xl font-black text-slate-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              <Globe size={17} />
              Website
            </Link>

            <Link
              to="/shop"
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              <Store size={17} />
              Store
            </Link>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-black text-sky-700"
            >
              <Download size={17} />
              Export
            </button>

            <button
              onClick={loadData}
              disabled={loadingData}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {loadingData ? (
                <Loader2
                  className="animate-spin"
                  size={17}
                />
              ) : (
                <RefreshCw size={17} />
              )}
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-600"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="mb-8 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm">
          {tabs.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() =>
                  setTab(item.id)
                }
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition ${
                  tab === item.id
                    ? "bg-sky-600 text-white"
                    : "text-gray-600 hover:bg-sky-50 hover:text-sky-700"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
          <div className="space-y-8">
            {loadingData && !summary ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2
                  size={40}
                  className="animate-spin text-sky-600"
                />
              </div>
            ) : (
              <>
                <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Demo Orders"
                    value={String(
                      orders.length
                    )}
                    icon={ShoppingBag}
                    iconBackground="#e0f2fe"
                    iconColor="#0284c7"
                    description="Orders placed through checkout"
                  />

                  <StatCard
                    label="Demo Revenue"
                    value={formatMoney(
                      totalRevenue
                    )}
                    icon={DollarSign}
                    iconBackground="#dcfce7"
                    iconColor="#16a34a"
                    description="No real money processed"
                  />

                  <StatCard
                    label="AI Conversations"
                    value={String(
                      summary?.totalConversations ??
                        0
                    )}
                    icon={Bot}
                    iconBackground="#f3e8ff"
                    iconColor="#9333ea"
                    description="Customer support conversations"
                  />

                  <StatCard
                    label="Registered Customers"
                    value={String(
                      summary?.users ??
                        summary?.totalUsers ??
                        0
                    )}
                    icon={Users}
                    iconBackground="#ffedd5"
                    iconColor="#f97316"
                    description="Customer accounts"
                  />

                  <StatCard
                    label="Leads Captured"
                    value={String(
                      summary?.leads ??
                        summary?.leadsCaptured ??
                        0
                    )}
                    icon={Zap}
                    iconBackground="#cffafe"
                    iconColor="#0891b2"
                    description="Newsletter and contact leads"
                  />

                  <StatCard
                    label="Items Ordered"
                    value={String(
                      totalItemsOrdered
                    )}
                    icon={Box}
                    iconBackground="#fef3c7"
                    iconColor="#d97706"
                    description="Total product quantity"
                  />

                  <StatCard
                    label="Resolution Rate"
                    value={`${summary?.resolutionRate ?? 0}%`}
                    icon={CheckCircle}
                    iconBackground="#dcfce7"
                    iconColor="#16a34a"
                    description="AI support resolution"
                  />

                  <StatCard
                    label="Escalated Chats"
                    value={String(
                      summary?.escalated ?? 0
                    )}
                    icon={AlertTriangle}
                    iconBackground="#fee2e2"
                    iconColor="#dc2626"
                    description="Conversations needing staff"
                  />
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-3xl border bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900">
                      Chat Activity
                    </h2>

                    <p className="mb-5 text-sm text-gray-500">
                      Customer support volume today
                    </p>

                    <ResponsiveContainer
                      width="100%"
                      height={260}
                    >
                      <AreaChart
                        data={
                          HOURLY_CHAT_DATA
                        }
                      >
                        <defs>
                          <linearGradient
                            id="chatGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#0284c7"
                              stopOpacity={0.3}
                            />

                            <stop
                              offset="95%"
                              stopColor="#0284c7"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                        />

                        <XAxis
                          dataKey="hour"
                          tick={{
                            fontSize: 11,
                          }}
                        />

                        <YAxis
                          tick={{
                            fontSize: 11,
                          }}
                        />

                        <Tooltip
                          content={
                            <ChartTooltip />
                          }
                        />

                        <Area
                          type="monotone"
                          dataKey="chats"
                          stroke="#0284c7"
                          strokeWidth={3}
                          fill="url(#chatGradient)"
                          name="Chats"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rounded-3xl border bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900">
                      Support Resolution
                    </h2>

                    <p className="mb-5 text-sm text-gray-500">
                      Resolved and escalated support chats
                    </p>

                    <ResponsiveContainer
                      width="100%"
                      height={260}
                    >
                      <BarChart
                        data={
                          WEEKLY_SUPPORT_DATA
                        }
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                        />

                        <XAxis
                          dataKey="day"
                          tick={{
                            fontSize: 11,
                          }}
                        />

                        <YAxis
                          tick={{
                            fontSize: 11,
                          }}
                        />

                        <Tooltip
                          content={
                            <ChartTooltip />
                          }
                        />

                        <Bar
                          dataKey="resolved"
                          fill="#16a34a"
                          radius={[
                            5, 5, 0, 0,
                          ]}
                          name="Resolved"
                        />

                        <Bar
                          dataKey="escalated"
                          fill="#dc2626"
                          radius={[
                            5, 5, 0, 0,
                          ]}
                          name="Escalated"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-3xl border bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black">
                          Recent Orders
                        </h2>

                        <p className="text-sm text-gray-500">
                          Latest fake checkout purchases
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setTab("orders")
                        }
                        className="font-black text-sky-600"
                      >
                        View all →
                      </button>
                    </div>

                    {recentOrders.length ===
                    0 ? (
                      <div className="rounded-2xl bg-gray-50 p-10 text-center">
                        <ShoppingCart
                          className="mx-auto mb-3 text-gray-300"
                          size={45}
                        />

                        <p className="font-black">
                          No orders yet
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Place a demo order from
                          the store.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                          <thead>
                            <tr className="border-b text-gray-500">
                              <th className="py-3">
                                Order
                              </th>
                              <th className="py-3">
                                Customer
                              </th>
                              <th className="py-3">
                                Total
                              </th>
                              <th className="py-3">
                                Status
                              </th>
                              <th className="py-3">
                                Date
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {recentOrders.map(
                              (order) => (
                                <tr
                                  key={
                                    order.id
                                  }
                                  className="border-b last:border-0"
                                >
                                  <td className="py-4 font-black">
                                    {order.id}
                                  </td>

                                  <td className="py-4">
                                    <p className="font-bold">
                                      {order
                                        .customer
                                        ?.name ||
                                        "Guest"}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                      {order
                                        .customer
                                        ?.email ||
                                        "No email"}
                                    </p>
                                  </td>

                                  <td className="py-4 font-black">
                                    {formatMoney(
                                      order.total
                                    )}
                                  </td>

                                  <td className="py-4">
                                    <StatusBadge
                                      status={
                                        order.orderStatus ||
                                        "Received"
                                      }
                                    />
                                  </td>

                                  <td className="py-4 text-xs text-gray-500">
                                    {formatDate(
                                      order.createdAt
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black">
                      Support Channels
                    </h2>

                    <p className="mb-5 text-sm text-gray-500">
                      Customer contact sources
                    </p>

                    <div className="flex items-center gap-5">
                      <ResponsiveContainer
                        width={180}
                        height={180}
                      >
                        <PieChart>
                          <Pie
                            data={
                              CHANNEL_DATA
                            }
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                          >
                            {CHANNEL_DATA.map(
                              (
                                item,
                                index
                              ) => (
                                <Cell
                                  key={
                                    index
                                  }
                                  fill={
                                    item.color
                                  }
                                />
                              )
                            )}
                          </Pie>

                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="flex-1 space-y-3">
                        {CHANNEL_DATA.map(
                          (item) => (
                            <div
                              key={
                                item.name
                              }
                              className="flex items-center gap-2 text-sm"
                            >
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{
                                  background:
                                    item.color,
                                }}
                              />

                              <span className="flex-1">
                                {
                                  item.name
                                }
                              </span>

                              <b>
                                {
                                  item.value
                                }
                                %
                              </b>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {tab === "orders" && (
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">
                  Store Orders
                </h2>

                <p className="text-sm text-gray-500">
                  Demo orders saved by the checkout backend
                </p>
              </div>

              <div className="relative w-full md:w-96">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  value={orderSearch}
                  onChange={(event) =>
                    setOrderSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search order, customer or email..."
                  className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center">
                <PackageCheck
                  className="mx-auto mb-4 text-gray-300"
                  size={60}
                />

                <h3 className="text-xl font-black">
                  No orders found
                </h3>

                <p className="mt-2 text-gray-500">
                  Place a demo order through
                  the checkout first.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead>
                    <tr className="border-b text-sm text-gray-500">
                      <th className="px-3 py-4">
                        Order
                      </th>
                      <th className="px-3 py-4">
                        Customer
                      </th>
                      <th className="px-3 py-4">
                        Items
                      </th>
                      <th className="px-3 py-4">
                        Payment
                      </th>
                      <th className="px-3 py-4">
                        Status
                      </th>
                      <th className="px-3 py-4">
                        Total
                      </th>
                      <th className="px-3 py-4">
                        Date
                      </th>
                      <th className="px-3 py-4">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map(
                      (order) => (
                        <tr
                          key={order.id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-3 py-5 font-black">
                            {order.id}
                          </td>

                          <td className="px-3 py-5">
                            <p className="font-black">
                              {order
                                .customer
                                ?.name ||
                                "Guest customer"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {order
                                .customer
                                ?.email ||
                                "No email"}
                            </p>
                          </td>

                          <td className="px-3 py-5">
                            {(order.items ||
                              []).reduce(
                              (
                                sum,
                                item
                              ) =>
                                sum +
                                Number(
                                  item.qty ||
                                    0
                                ),
                              0
                            )}
                          </td>

                          <td className="px-3 py-5">
                            <StatusBadge
                              status={
                                order.paymentStatus ||
                                "Paid (Demo)"
                              }
                            />
                          </td>

                          <td className="px-3 py-5">
                            <StatusBadge
                              status={
                                order.orderStatus ||
                                "Received"
                              }
                            />
                          </td>

                          <td className="px-3 py-5 font-black">
                            {formatMoney(
                              order.total
                            )}
                          </td>

                          <td className="px-3 py-5 text-sm text-gray-500">
                            {formatDate(
                              order.createdAt
                            )}
                          </td>

                          <td className="px-3 py-5">
                            <button
                              onClick={() =>
                                setSelectedOrder(
                                  order
                                )
                              }
                              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white"
                            >
                              <Eye
                                size={15}
                              />
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "conversations" && (
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">
                  AI Support Conversations
                </h2>

                <p className="text-sm text-gray-500">
                  Customer messages handled by
                  ClariBot
                </p>
              </div>

              <div className="relative w-full md:w-96">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
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
                  className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {filteredConversations.length ===
            0 ? (
              <div className="py-16 text-center">
                <MessageCircle
                  className="mx-auto mb-4 text-gray-300"
                  size={60}
                />

                <h3 className="text-xl font-black">
                  No conversations found
                </h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b text-sm text-gray-500">
                      <th className="px-3 py-4">
                        Title
                      </th>
                      <th className="px-3 py-4">
                        Status
                      </th>
                      <th className="px-3 py-4">
                        Sentiment
                      </th>
                      <th className="px-3 py-4">
                        Messages
                      </th>
                      <th className="px-3 py-4">
                        Updated
                      </th>
                      <th className="px-3 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredConversations.map(
                      (
                        conversation
                      ) => (
                        <tr
                          key={
                            conversation.id
                          }
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="max-w-[280px] truncate px-3 py-5 font-black">
                            {
                              conversation.title
                            }
                          </td>

                          <td className="px-3 py-5">
                            <StatusBadge
                              status={
                                conversation.status
                              }
                            />
                          </td>

                          <td className="px-3 py-5">
                            <SentimentBadge
                              sentiment={
                                conversation.sentiment
                              }
                            />
                          </td>

                          <td className="px-3 py-5">
                            {conversation.messageCount ??
                              conversation
                                .messages
                                ?.length ??
                              0}
                          </td>

                          <td className="px-3 py-5 text-sm text-gray-500">
                            {formatDate(
                              conversation.updatedAt ||
                                conversation.createdAt
                            )}
                          </td>

                          <td className="px-3 py-5">
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setConversationMenu(
                                    conversationMenu ===
                                      conversation.id
                                      ? null
                                      : conversation.id
                                  )
                                }
                                className="rounded-lg p-2 hover:bg-gray-100"
                              >
                                <MoreHorizontal
                                  size={18}
                                />
                              </button>

                              {conversationMenu ===
                                conversation.id && (
                                <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border bg-white py-2 shadow-xl">
                                  <button
                                    onClick={() =>
                                      handleViewConversation(
                                        conversation.id
                                      )
                                    }
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold hover:bg-gray-50"
                                  >
                                    <Eye
                                      size={
                                        15
                                      }
                                    />
                                    View messages
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDeleteConversation(
                                        conversation.id
                                      )
                                    }
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                                  >
                                    {deletingId ===
                                    conversation.id ? (
                                      <Loader2
                                        className="animate-spin"
                                        size={
                                          15
                                        }
                                      />
                                    ) : (
                                      <Trash2
                                        size={
                                          15
                                        }
                                      />
                                    )}
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "analytics" && (
          <div className="space-y-6">
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">
                Customer Sentiment
              </h2>

              <p className="mb-6 text-sm text-gray-500">
                Seven-day ClariBot support
                sentiment trend
              </p>

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <LineChart
                  data={SENTIMENT_DATA}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    content={
                      <ChartTooltip />
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="positive"
                    stroke="#16a34a"
                    strokeWidth={3}
                    name="Positive %"
                  />

                  <Line
                    type="monotone"
                    dataKey="neutral"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Neutral %"
                  />

                  <Line
                    type="monotone"
                    dataKey="negative"
                    stroke="#dc2626"
                    strokeWidth={3}
                    name="Negative %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>

            <section className="grid gap-5 md:grid-cols-3">
              <StatCard
                label="Positive"
                value={String(
                  summary?.sentiment
                    ?.positive ?? 0
                )}
                icon={CheckCircle}
                iconBackground="#dcfce7"
                iconColor="#16a34a"
                description="Positive support conversations"
              />

              <StatCard
                label="Neutral"
                value={String(
                  summary?.sentiment
                    ?.neutral ?? 0
                )}
                icon={MessageCircle}
                iconBackground="#fef3c7"
                iconColor="#d97706"
                description="Neutral support conversations"
              />

              <StatCard
                label="Negative"
                value={String(
                  summary?.sentiment
                    ?.negative ?? 0
                )}
                icon={AlertTriangle}
                iconBackground="#fee2e2"
                iconColor="#dc2626"
                description="Negative support conversations"
              />
            </section>
          </div>
        )}

        {tab === "settings" && (
          <section className="max-w-3xl space-y-6">
            <div className="rounded-3xl border bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black">
                Business Information
              </h2>

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-black">
                    Business name
                  </label>

                  <input
                    value={
                      settings.businessName ||
                      ""
                    }
                    onChange={(event) =>
                      setSettings(
                        (current) => ({
                          ...current,
                          businessName:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    ClariBot tone
                  </label>

                  <select
                    value={
                      settings.botTone || ""
                    }
                    onChange={(event) =>
                      setSettings(
                        (current) => ({
                          ...current,
                          botTone:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  >
                    <option>
                      Friendly and concise
                    </option>
                    <option>
                      Professional and formal
                    </option>
                    <option>
                      Casual and helpful
                    </option>
                    <option>
                      Empathetic and supportive
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Escalation email
                  </label>

                  <input
                    type="email"
                    value={
                      settings.escalationEmail ||
                      ""
                    }
                    onChange={(event) =>
                      setSettings(
                        (current) => ({
                          ...current,
                          escalationEmail:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black">
                AI Behaviour
              </h2>

              <div className="mt-6 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-black">
                    Confidence threshold:{" "}
                    {settings.confidenceThreshold ??
                      85}
                    %
                  </label>

                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={
                      settings.confidenceThreshold ??
                      85
                    }
                    onChange={(event) =>
                      setSettings(
                        (current) => ({
                          ...current,
                          confidenceThreshold:
                            Number(
                              event.target
                                .value
                            ),
                        })
                      )
                    }
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Maximum turns before
                    handoff
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={
                      settings.maxTurns ?? 8
                    }
                    onChange={(event) =>
                      setSettings(
                        (current) => ({
                          ...current,
                          maxTurns:
                            Number(
                              event.target
                                .value
                            ),
                        })
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Conversation retention
                    days
                  </label>

                  <input
                    type="number"
                    min={7}
                    max={365}
                    value={
                      settings.retentionDays ??
                      90
                    }
                    onChange={(event) =>
                      setSettings(
                        (current) => ({
                          ...current,
                          retentionDays:
                            Number(
                              event.target
                                .value
                            ),
                        })
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-7 py-4 font-black text-white disabled:opacity-60"
            >
              {savingSettings ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <Save size={18} />
              )}

              {savingSettings
                ? "Saving..."
                : "Save Settings"}
            </button>
          </section>
        )}
      </div>

      {conversationMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() =>
            setConversationMenu(null)
          }
        />
      )}

      {loadingConversation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-2xl">
            <Loader2
              className="animate-spin text-sky-600"
              size={24}
            />

            <span className="font-bold">
              Loading conversation...
            </span>
          </div>
        </div>
      )}

      {selectedConversation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-black">
                  {
                    selectedConversation.title
                  }
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Status:{" "}
                  {selectedConversation.status ||
                    "open"}{" "}
                  · Sentiment:{" "}
                  {selectedConversation.sentiment ||
                    "neutral"}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedConversation(null)
                }
                className="rounded-xl bg-gray-100 p-2"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto bg-slate-50 p-6">
              {(selectedConversation.messages ||
                []).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-sky-600 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <p className="mb-1 text-[11px] opacity-70">
                      {message.role ===
                      "user"
                        ? "Customer"
                        : "ClariBot"}{" "}
                      ·{" "}
                      {formatDate(
                        message.createdAt
                      )}
                    </p>

                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-sky-600">
                  Order details
                </p>

                <h2 className="text-3xl font-black">
                  {selectedOrder.id}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="rounded-xl bg-gray-100 p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-5">
                <h3 className="font-black">
                  Customer
                </h3>

                <p className="mt-3">
                  {selectedOrder.customer
                    ?.name ||
                    "Guest customer"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedOrder.customer
                    ?.email || "No email"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedOrder.customer
                    ?.phone || "No phone"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <h3 className="font-black">
                  Delivery
                </h3>

                <p className="mt-3 text-sm text-gray-600">
                  {selectedOrder.customer
                    ?.address || "No address"}
                </p>

                <p className="mt-2 font-bold">
                  Method:{" "}
                  {selectedOrder.deliveryMethod ||
                    "Standard"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border p-5">
              <h3 className="mb-4 text-xl font-black">
                Products
              </h3>

              <div className="space-y-4">
                {(selectedOrder.items ||
                  []).map((item) => (
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

                    <p className="font-black">
                      {formatMoney(
                        Number(item.price) *
                          Number(item.qty)
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <b>
                  {formatMoney(
                    selectedOrder.subtotal
                  )}
                </b>
              </div>

              <div className="mt-3 flex justify-between">
                <span>Delivery</span>
                <b>
                  {Number(
                    selectedOrder.delivery ||
                      0
                  ) === 0
                    ? "Free"
                    : formatMoney(
                        selectedOrder.delivery
                      )}
                </b>
              </div>

              <hr className="my-5 border-slate-700" />

              <div className="flex justify-between text-2xl">
                <span className="font-black">
                  Total
                </span>

                <b>
                  {formatMoney(
                    selectedOrder.total
                  )}
                </b>
              </div>

              <p className="mt-4 text-sm text-slate-300">
                {formatDate(
                  selectedOrder.createdAt
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}