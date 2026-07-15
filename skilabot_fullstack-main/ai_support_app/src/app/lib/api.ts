const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:4000";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type RecommendedProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  image: string;
  badge?: string;
  rating?: number;
  description?: string;
  reason?: string;
};

export type ApiMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  createdAt: string;
  recommendedProducts?: RecommendedProduct[];
};

export type ApiConversation = {
  id: string;
  title: string;
  status: string;
  sentiment?: string;
  messages: ApiMessage[];
  updatedAt: string;
  createdAt: string;
  userId?: string;
  messageCount?: number;
};

export type ApiSettings = {
  businessName?: string;
  escalationEmail?: string;
  botTone?: string;
  retentionDays?: number;
  confidenceThreshold?: number;
  maxTurns?: number;
  slackWebhook?: string;
};

export type ApiSummary = {
  totalConversations: number;
  resolved?: number;
  escalated?: number;
  open?: number;
  leads?: number;
  users?: number;
  totalUsers?: number;
  resolutionRate?: number;
  leadsCaptured?: number;
  avgResponse?: string;
  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentConversations?: ApiConversation[];
};

export type ApiOrderItem = {
  id: string;
  name: string;
  category?: string;
  price: number;
  qty: number;
  image?: string;
};

export type ApiOrder = {
  id: string;
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: ApiOrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  deliveryMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt: string;
};

export type ReturnStatus =
  | "Requested"
  | "Approved"
  | "Rejected"
  | "Completed";

export type ApiReturn = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  reason: string;
  status: ReturnStatus;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt?: string;
};

export function getToken() {
  return localStorage.getItem("skilabot_token");
}

export function getUser(): ApiUser | null {
  try {
    return JSON.parse(
      localStorage.getItem("skilabot_user") || "null"
    );
  } catch {
    return null;
  }
}

export function saveSession(
  token: string,
  user: ApiUser
) {
  localStorage.setItem("skilabot_token", token);

  localStorage.setItem(
    "skilabot_user",
    JSON.stringify(user)
  );
}

export function clearSession() {
  localStorage.removeItem("skilabot_token");
  localStorage.removeItem("skilabot_user");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  const token = getToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Could not connect to the backend. Make sure it is running on port 4000."
    );
  }

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      (data as any).message ||
        (data as any).error ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

export const api = {
  requestOtp: (email: string) =>
    request<{
      ok: boolean;
      message: string;
    }>("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  signup: (
    name: string,
    email: string,
    password: string,
    otp?: string
  ) =>
    request<{
      token: string;
      user: ApiUser;
    }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        otp,
      }),
    }),

  login: (
    email: string,
    password: string
  ) =>
    request<{
      token: string;
      user: ApiUser;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  forgot: (email: string) =>
    request<{
      ok: boolean;
      message: string;
    }>("/api/auth/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  adminLogin: (
    email: string,
    password: string
  ) =>
    request<{
      token: string;
      user: ApiUser;
    }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  conversations: () =>
    request<ApiConversation[]>(
      "/api/conversations"
    ),

  newConversation: (
    title = "New conversation"
  ) =>
    request<ApiConversation>(
      "/api/conversations",
      {
        method: "POST",
        body: JSON.stringify({ title }),
      }
    ),

  deleteConversation: (id: string) =>
    request<{ ok: boolean }>(
      `/api/conversations/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    ),

  chat: async (
    message: string,
    conversationId?: string | number
  ) => {
    if (!conversationId) {
      throw new Error(
        "Conversation ID is required"
      );
    }

    const data = await request<{
      userMessage?: ApiMessage;
      botMessage?: ApiMessage;
      reply?: ApiMessage;
      conversation: ApiConversation;
    }>(
      `/api/conversations/${encodeURIComponent(
        String(conversationId)
      )}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          text: message,
        }),
      }
    );

    return {
      conversation: data.conversation,
      reply:
        data.reply ||
        data.botMessage!,
    };
  },

  createLead: (
    email: string,
    source = "landing",
    extra?: Record<string, string>
  ) =>
    request("/api/leads", {
      method: "POST",
      body: JSON.stringify({
        email,
        source,
        ...extra,
      }),
    }),

  createOrder: (order: any) =>
    request<{
      ok: boolean;
      message: string;
      order: ApiOrder;
    }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),

  trackOrder: (orderId: string) =>
    request<{
      ok: boolean;
      order: ApiOrder;
    }>(
      `/api/orders/${encodeURIComponent(
        orderId.trim()
      )}`
    ),

  customerOrders: (email: string) =>
    request<{
      ok: boolean;
      orders: ApiOrder[];
    }>(
      `/api/customer/orders?email=${encodeURIComponent(
        email.trim()
      )}`
    ),

  getReturnItems: (orderId: string) =>
    request<{
      ok: boolean;
      order: {
        id: string;
        orderStatus?: string;
        paymentStatus?: string;
        deliveryMethod?: string;
        customer?: any;
        items: ApiOrderItem[];
      };
    }>(
      `/api/orders/${encodeURIComponent(
        orderId.trim()
      )}/return-items`
    ),

  createReturn: (data: {
    orderId: string;
    productId: string;
    reason: string;
  }) =>
    request<{
      ok: boolean;
      message: string;
      returnRequest: ApiReturn;
    }>("/api/returns", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminSummary: () =>
    request<ApiSummary>(
      "/api/admin/summary"
    ),

  adminUsers: () =>
    request<ApiUser[]>(
      "/api/admin/users"
    ),

  adminLeads: () =>
    request<any[]>(
      "/api/admin/leads"
    ),

  adminExportUrl: () =>
    `${API_BASE}/api/admin/export`,

  adminSettings: () =>
    request<ApiSettings>(
      "/api/admin/settings"
    ),

  saveSettings: (
    settings: ApiSettings
  ) =>
    request<ApiSettings>(
      "/api/admin/settings",
      {
        method: "PUT",
        body: JSON.stringify(settings),
      }
    ),

  adminConversations: () =>
    request<ApiConversation[]>(
      "/api/admin/conversations"
    ),

  adminDeleteConversation: (
    id: string
  ) =>
    request<{ ok: boolean }>(
      `/api/admin/conversations/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
      }
    ),

  adminGetConversation: (
    id: string
  ) =>
    request<ApiConversation>(
      `/api/admin/conversations/${encodeURIComponent(
        id
      )}`
    ),

  adminChatLogs: () =>
    request<any[]>(
      "/api/admin/chat-logs"
    ),

  messageFeedback: (
    messageId: string | number,
    helpful: boolean
  ) =>
    request<{ ok: boolean }>(
      `/api/messages/${encodeURIComponent(
        String(messageId)
      )}/feedback`,
      {
        method: "POST",
        body: JSON.stringify({
          helpful,
        }),
      }
    ),

  adminOrders: () =>
    request<ApiOrder[]>(
      "/api/admin/orders"
    ),

  adminReturns: () =>
    request<ApiReturn[]>(
      "/api/admin/returns"
    ),

  updateReturnStatus: (
    returnId: string,
    status: ReturnStatus
  ) =>
    request<{
      ok: boolean;
      message: string;
      returnRequest: ApiReturn;
    }>(
      `/api/admin/returns/${encodeURIComponent(
        returnId
      )}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      }
    ),
};