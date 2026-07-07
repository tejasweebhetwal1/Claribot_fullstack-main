import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { api, getToken, clearSession, type ApiConversation } from "../lib/api";
import {
  Bot,
  Send,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  X,
  MessageSquare,
  Sparkles,
  CheckCheck,
  LogOut,
  Download,
  StopCircle,
  User,
  Package,
  Clock,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

interface Message {
  id: number | string;
  role: "user" | "bot";
  text: string;
  time: string;
  liked?: boolean | null;
}

interface Conversation {
  id: number | string;
  title: string;
  preview: string;
  time: string;
  unread?: number;
  isApi?: boolean;
}

const PRODUCTS = [
  {
    name: "Starter Plan",
    price: "$0/month",
    details:
      "Best for students, demos, and small testing projects. Includes basic chatbot replies, lead capture, and 1,000 monthly conversations.",
  },
  {
    name: "Growth Plan",
    price: "$99/month",
    details:
      "Best for small and medium businesses. Includes 20,000 monthly conversations, conversation history, admin dashboard, analytics, and priority support.",
  },
  {
    name: "Enterprise Plan",
    price: "$299/month",
    details:
      "Best for larger businesses. Includes unlimited conversations, custom AI training, advanced support, team features, SLA support, and white-label option.",
  },
  {
    name: "Custom Chatbot Setup",
    price: "From $499 one-time",
    details:
      "Includes chatbot setup for a business website, FAQ training, support flow design, lead form integration, and admin configuration.",
  },
  {
    name: "AI Knowledge Base Setup",
    price: "From $199 one-time",
    details:
      "Includes adding business FAQs, product information, refund policy, delivery details, pricing details, and customer support answers.",
  },
];

const QUICK_REPLIES = [
  "What products do you offer?",
  "Show me your prices",
  "What are your opening hours?",
  "Do you provide delivery?",
  "What is your refund policy?",
  "I need further details",
  "How can I contact support?",
  "Which plan is best for my business?",
];

function now() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function productListText() {
  return PRODUCTS.map(
    (p, index) => `${index + 1}. **${p.name}** — ${p.price}\n${p.details}`
  ).join("\n\n");
}

function findProductReply(input: string) {
  const lower = input.toLowerCase();

  const match = PRODUCTS.find((p) =>
    lower.includes(p.name.toLowerCase().replace(" plan", "").replace(" setup", ""))
  );

  if (!match) return "";

  return `Here are the details for **${match.name}**:\n\n**Price:** ${match.price}\n\n${match.details}\n\nWould you like help choosing the best option for your business?`;
}

function getBotReply(input: string): string {
  const lower = input.toLowerCase();

  const matchedProduct = findProductReply(input);
  if (matchedProduct) return matchedProduct;

  if (
    lower.includes("product") ||
    lower.includes("service") ||
    lower.includes("offer") ||
    lower.includes("what do you sell") ||
    lower.includes("available")
  ) {
    return `We offer AI customer support products and services for businesses:\n\n${productListText()}\n\nYou can ask me about any product for more details.`;
  }

  if (
    lower.includes("price") ||
    lower.includes("pricing") ||
    lower.includes("cost") ||
    lower.includes("fee") ||
    lower.includes("how much") ||
    lower.includes("plan")
  ) {
    return `Here is our pricing:\n\n${productListText()}\n\nFor most small businesses, the **Growth Plan** is the best option because it includes chatbot support, conversation history, admin dashboard, analytics, and priority support.`;
  }

  if (
    lower.includes("opening") ||
    lower.includes("opening time") ||
    lower.includes("opening hours") ||
    lower.includes("business hours") ||
    lower.includes("open time") ||
    lower.includes("close") ||
    lower.includes("closing") ||
    lower.includes("hours") ||
    lower.includes("when do you open")
  ) {
    return "Our opening hours are **Monday to Friday, 9:00 AM to 5:00 PM**. We are closed on weekends and public holidays. The chatbot is available 24/7 for basic support.";
  }

  if (
    lower.includes("delivery") ||
    lower.includes("deliver") ||
    lower.includes("shipping") ||
    lower.includes("ship") ||
    lower.includes("home delivery")
  ) {
    return "Yes, we provide digital delivery for chatbot services. After account setup, the chatbot can be integrated into the business website. Setup time depends on the selected plan and business requirements. For physical products, delivery policy depends on the individual business using ClariBot.";
  }

  if (
    lower.includes("refund") ||
    lower.includes("return") ||
    lower.includes("money back") ||
    lower.includes("cancel") ||
    lower.includes("cancellation")
  ) {
    return "Refund requests are reviewed by our support team. Customers should provide their registered email, order or plan details, payment date, and reason for refund. If the service has not been used or the issue is valid, the support team may approve a refund according to the business policy.";
  }

  if (
    lower.includes("further detail") ||
    lower.includes("more detail") ||
    lower.includes("details") ||
    lower.includes("explain") ||
    lower.includes("tell me more") ||
    lower.includes("more information")
  ) {
    return `Sure. ClariBot is an AI customer support platform for business websites. It helps customers ask questions about products, prices, delivery, refunds, support, opening hours, and account issues.\n\nMain features include:\n\n• Business website integration\n• Customer account registration\n• ChatGPT-like chatbot interface\n• Product and price information\n• Lead capture form\n• Admin dashboard\n• Conversation history\n• Customer support automation\n\nYou can ask about products, prices, delivery, refund policy, opening hours, or which plan is best for your business.`;
  }

  if (
    lower.includes("contact") ||
    lower.includes("phone") ||
    lower.includes("call") ||
    lower.includes("email") ||
    lower.includes("support") ||
    lower.includes("help")
  ) {
    return "You can contact our support team by email at **support@claribot.com**. Business support is available Monday to Friday, 9:00 AM to 5:00 PM. You can also continue asking questions here in the chatbot.";
  }

  if (
    lower.includes("payment") ||
    lower.includes("pay") ||
    lower.includes("card") ||
    lower.includes("invoice") ||
    lower.includes("billing")
  ) {
    return "For billing and payments, customers can choose a monthly plan and receive invoice details through the business account. If you need help with payment, please provide your registered email and plan name.";
  }

  if (
    lower.includes("best") ||
    lower.includes("recommend") ||
    lower.includes("which one") ||
    lower.includes("small business")
  ) {
    return "For most small businesses, I recommend the **Growth Plan** at **$99/month**. It includes 20,000 monthly conversations, admin dashboard, conversation history, analytics, and priority support. If you are only testing the system, the Starter Plan is enough.";
  }

  if (
    lower.includes("admin") ||
    lower.includes("dashboard") ||
    lower.includes("analytics")
  ) {
    return "The admin dashboard allows the business owner or support team to view users, leads, conversations, chatbot activity, and customer support performance. It helps the business follow up with customers and manage support more easily.";
  }

  if (
    lower.includes("chatbot") ||
    lower.includes("ai") ||
    lower.includes("how does it work") ||
    lower.includes("business")
  ) {
    return "ClariBot works by connecting a chatbot to a business website. Customers can ask questions, and the chatbot replies using business information such as products, prices, opening hours, delivery policy, refund policy, and support details. Admins can view saved conversations from the dashboard.";
  }

  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("hey")
  ) {
    return "Hello! 👋 I’m ClariBot, your AI customer support assistant. You can ask me about products, pricing, delivery, refund policy, opening hours, or account support.";
  }

  if (lower.includes("thank") || lower.includes("thanks")) {
    return "You’re welcome! I’m happy to help. You can ask me anything about our products, pricing, delivery, refunds, or business support.";
  }

  return "Thanks for reaching out! I can help with products, prices, delivery, refunds, opening hours, account support, and further business details. What would you like to know?";
}

function toUiMessages(conv: ApiConversation): Message[] {
  return conv.messages.map((m) => ({
    id: m.id,
    role: m.role,
    text: m.text,
    time: new Date(m.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
}

function Bubble({
  msg,
  onLike,
}: {
  msg: Message;
  onLike: (id: number | string, v: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isBot = msg.role === "bot";

  function copyMessage() {
    navigator.clipboard.writeText(msg.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`group flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div
          className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full shadow-sm"
          style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}
        >
          <Bot size={16} color="#fff" />
        </div>
      )}

      <div className="flex max-w-[82%] flex-col gap-1 md:max-w-[70%]">
        <div
          className="whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={
            isBot
              ? {
                  background: "#ffffff",
                  color: "#12082a",
                  borderBottomLeftRadius: "6px",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
                }
              : {
                  background: "#7c3aed",
                  color: "#ffffff",
                  borderBottomRightRadius: "6px",
                  boxShadow: "0 1px 8px rgba(124,58,237,0.22)",
                }
          }
        >
          {msg.text.split("**").map((part, index) =>
            index % 2 === 1 ? (
              <strong key={index}>{part}</strong>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </div>

        <div
          className={`flex items-center gap-2 px-1 opacity-0 transition-opacity group-hover:opacity-100 ${
            isBot ? "justify-start" : "justify-end"
          }`}
        >
          <span className="text-xs" style={{ color: "#7a6080" }}>
            {msg.time}
          </span>

          {!isBot && <CheckCheck size={13} style={{ color: "#7c3aed" }} />}

          {isBot && (
            <>
              <button
                type="button"
                onClick={copyMessage}
                className="rounded p-1 transition-colors hover:bg-black/5"
                title="Copy response"
              >
                {copied ? (
                  <CheckCheck size={14} style={{ color: "#10b981" }} />
                ) : (
                  <Copy size={14} style={{ color: "#7a6080" }} />
                )}
              </button>

              <button
                type="button"
                onClick={() => onLike(msg.id, true)}
                className="rounded p-1 transition-colors hover:bg-black/5"
                title="Helpful"
              >
                <ThumbsUp
                  size={14}
                  style={{
                    color: msg.liked === true ? "#10b981" : "#7a6080",
                  }}
                />
              </button>

              <button
                type="button"
                onClick={() => onLike(msg.id, false)}
                className="rounded p-1 transition-colors hover:bg-black/5"
                title="Not helpful"
              >
                <ThumbsDown
                  size={14}
                  style={{
                    color: msg.liked === false ? "#ef4444" : "#7a6080",
                  }}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();

  const [activeConvId, setActiveConvId] = useState<number | string>(1);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text: "Hello! 👋 I’m ClariBot, your AI customer support assistant. You can ask me about products, prices, delivery, refunds, opening hours, or account support.",
      time: now(),
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!getToken()) return;

    api
      .conversations()
      .then((items) => {
        if (!items.length) return;

        const uiConvs: Conversation[] = items.map((c) => ({
          id: c.id,
          title: c.title,
          preview: c.messages[c.messages.length - 1]?.text?.slice(0, 70) || "",
          time: c.updatedAt
            ? new Date(c.updatedAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })
            : "Now",
          isApi: true,
        }));

        setConversations(uiConvs);

        const latest = items[0];
        setActiveConvId(latest.id);
        setMessages(toUiMessages(latest));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();

    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    setRecognition(rec);
  }, []);

  async function send(text?: string) {
    const txt = (text ?? input).trim();

    if (!txt || typing) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: txt,
      time: now(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      if (!getToken()) {
        throw new Error("Not signed in");
      }

      let conversationId = activeConvId;

      if (typeof conversationId !== "string") {
        const newConv = await api.newConversation();
        conversationId = newConv.id;
        setActiveConvId(newConv.id);
      }

      const result = await api.chat(txt, conversationId);

      setActiveConvId(result.conversation.id);
      setTyping(false);

      const backendMessages = toUiMessages(result.conversation);
      const lastMessage = backendMessages[backendMessages.length - 1];

      if (
        lastMessage &&
        lastMessage.role === "bot" &&
        (lastMessage.text.toLowerCase().includes("thanks for reaching out") ||
          lastMessage.text.length < 15)
      ) {
        lastMessage.text = getBotReply(txt);
      }

      setMessages(backendMessages);

      const replyText =
        lastMessage?.text ||
        result.reply?.text ||
        result.conversation.messages[result.conversation.messages.length - 1]?.text ||
        "";

      const updatedConv: Conversation = {
        id: result.conversation.id,
        title: result.conversation.title || "New conversation",
        preview: replyText.slice(0, 70),
        time: "Just now",
        isApi: true,
      };

      setConversations((prev) => {
        const without = prev.filter((c) => c.id !== updatedConv.id);
        return [updatedConv, ...without];
      });
    } catch (error) {
      console.error("Chat save failed:", error);

      setTimeout(() => {
        setTyping(false);

        const botText = getBotReply(txt);

        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            role: "bot",
            text: botText,
            time: now(),
          },
        ]);

        setConversations((prev) => {
          const title = txt.length > 24 ? txt.slice(0, 24) + "..." : txt;
          const updatedConv: Conversation = {
            id: activeConvId,
            title: title || "New conversation",
            preview: botText.slice(0, 70),
            time: "Just now",
          };

          const without = prev.filter((c) => c.id !== activeConvId);
          return [updatedConv, ...without];
        });
      }, 600);
    }
  }

  async function startNewConversation() {
    setMoreMenuOpen(false);

    try {
      const conv = getToken() ? await api.newConversation() : null;

      if (conv) {
        setActiveConvId(conv.id);
        setMessages(toUiMessages(conv));

        setConversations((prev) => [
          {
            id: conv.id,
            title: conv.title || "New conversation",
            preview: "New conversation started",
            time: "Now",
            isApi: true,
          },
          ...prev,
        ]);
      } else {
        setActiveConvId(Date.now());
        setMessages([
          {
            id: 0,
            role: "bot",
            text: "Hi there! Starting a new conversation. Ask me about products, prices, delivery, refunds, or opening hours.",
            time: now(),
          },
        ]);
      }
    } catch {
      setActiveConvId(Date.now());
      setMessages([
        {
          id: 0,
          role: "bot",
          text: "Hi there! Starting a new conversation. Ask me about products, prices, delivery, refunds, or opening hours.",
          time: now(),
        },
      ]);
    }
  }

  async function deleteCurrentConversation() {
    setMoreMenuOpen(false);

    if (typeof activeConvId === "string" && getToken()) {
      try {
        await api.deleteConversation(activeConvId);
      } catch {}
    }

    setConversations((prev) => prev.filter((c) => c.id !== activeConvId));
    await startNewConversation();
  }

  function exportChat() {
    setMoreMenuOpen(false);

    const text = messages
      .map((m) => `[${m.time}] ${m.role === "bot" ? "ClariBot" : "You"}: ${m.text}`)
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = `claribot-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();

    URL.revokeObjectURL(a.href);
  }

  function refreshConversation() {
    if (!getToken() || typeof activeConvId !== "string") return;

    api
      .conversations()
      .then((items) => {
        const conv = items.find((c) => c.id === activeConvId);
        if (conv) setMessages(toUiMessages(conv));
      })
      .catch(() => {});
  }

  function toggleMic() {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  }

  function handleFileAttach() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const maxMB = 5;

    if (file.size > maxMB * 1024 * 1024) {
      alert(`File too large. Maximum size is ${maxMB}MB.`);
      return;
    }

    send(`[Attached file: ${file.name}]`);
    e.target.value = "";
  }

  function handleLike(id: number | string, value: boolean) {
    setMessages((m) =>
      m.map((msg) => (msg.id === id ? { ...msg, liked: value } : msg))
    );
  }

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="flex h-[calc(100vh-4rem)] bg-[#fef9ff]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      <aside
        className={`flex flex-shrink-0 flex-col border-r transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-0 overflow-hidden"
        }`}
        style={{ borderColor: "rgba(124,58,237,0.1)", background: "#ffffff" }}
      >
        <div
          className="border-b p-4"
          style={{ borderColor: "rgba(124,58,237,0.08)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2
                className="text-base font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#12082a" }}
              >
                ClariBot
              </h2>

              <p className="text-xs" style={{ color: "#7a6080" }}>
                ChatGPT-like support UI
              </p>
            </div>

            <button
              type="button"
              onClick={startNewConversation}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[#f3e8ff]"
              style={{ background: "rgba(124,58,237,0.08)" }}
              title="New chat"
            >
              <Plus size={17} style={{ color: "#7c3aed" }} />
            </button>
          </div>

          <button
            type="button"
            onClick={startNewConversation}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={16} />
            New Chat
          </button>

          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#7a6080" }}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl py-2 pl-9 pr-3 text-sm outline-none"
              style={{ background: "#f5e6f0", color: "#12082a" }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
          {filteredConversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <MessageSquare
                size={28}
                className="mx-auto mb-2"
                style={{ color: "#c4a7d8" }}
              />

              <p className="text-xs" style={{ color: "#7a6080" }}>
                No conversations yet.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  setActiveConvId(conv.id);

                  if (conv.isApi && getToken()) {
                    api
                      .conversations()
                      .then((items) => {
                        const c = items.find((x) => x.id === conv.id);
                        if (c) setMessages(toUiMessages(c));
                      })
                      .catch(() => {});
                  }
                }}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fef0f5]"
                style={{
                  background:
                    activeConvId === conv.id ? "#f3e8ff" : "transparent",
                }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background:
                      activeConvId === conv.id
                        ? "#7c3aed"
                        : "rgba(124,58,237,0.1)",
                  }}
                >
                  <MessageSquare
                    size={15}
                    style={{
                      color: activeConvId === conv.id ? "#ffffff" : "#7c3aed",
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <p
                      className="truncate text-sm font-semibold"
                      style={{
                        color: "#12082a",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {conv.title}
                    </p>

                    <span
                      className="ml-2 flex-shrink-0 text-xs"
                      style={{ color: "#7a6080" }}
                    >
                      {conv.time}
                    </span>
                  </div>

                  <p className="truncate text-xs" style={{ color: "#7a6080" }}>
                    {conv.preview || "No messages yet"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div
          className="space-y-2 border-t p-4"
          style={{ borderColor: "rgba(124,58,237,0.08)" }}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "rgba(16,185,129,0.08)" }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "#10b981" }}
            />

            <span className="text-xs font-medium" style={{ color: "#10b981" }}>
              ClariBot is online
            </span>

            <Sparkles
              size={12}
              style={{ color: "#10b981", marginLeft: "auto" }}
            />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:bg-red-50"
            style={{ color: "#ef4444" }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header
          className="relative flex items-center gap-3 border-b bg-white px-5 py-3.5"
          style={{ borderColor: "rgba(124,58,237,0.1)" }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-lg p-2 transition-colors hover:bg-[#f3e8ff]"
            title="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X size={18} style={{ color: "#7c3aed" }} />
            ) : (
              <MessageSquare size={18} style={{ color: "#7c3aed" }} />
            )}
          </button>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}
          >
            <Bot size={18} color="#fff" />
          </div>

          <div className="flex-1">
            <p
              className="text-sm font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#12082a" }}
            >
              ClariBot Customer Support Assistant
            </p>

            <p className="text-xs" style={{ color: "#10b981" }}>
              ● Online — products, prices, delivery, refund and support info
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-[#f3e8ff] px-3 py-1.5 text-xs font-semibold text-[#7c3aed] md:flex">
            <ShieldCheck size={13} />
            Business Support
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={refreshConversation}
              className="rounded-lg p-2 transition-colors hover:bg-[#f3e8ff]"
              title="Refresh conversation"
            >
              <RefreshCw size={16} style={{ color: "#7a6080" }} />
            </button>

            <button
              type="button"
              onClick={() => setMoreMenuOpen((v) => !v)}
              className="rounded-lg p-2 transition-colors hover:bg-[#f3e8ff]"
              title="More options"
            >
              <MoreHorizontal size={16} style={{ color: "#7a6080" }} />
            </button>
          </div>

          {moreMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMoreMenuOpen(false)}
              />

              <div
                className="absolute right-4 top-14 z-20 w-52 rounded-xl border py-1 shadow-xl"
                style={{
                  background: "#ffffff",
                  borderColor: "rgba(124,58,237,0.15)",
                }}
              >
                <button
                  type="button"
                  onClick={exportChat}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f3e8ff]"
                  style={{ color: "#12082a" }}
                >
                  <Download size={14} />
                  Export chat
                </button>

                <button
                  type="button"
                  onClick={startNewConversation}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f3e8ff]"
                  style={{ color: "#12082a" }}
                >
                  <Plus size={14} />
                  New conversation
                </button>

                <div
                  className="mx-3 my-1 h-px"
                  style={{ background: "rgba(124,58,237,0.1)" }}
                />

                <button
                  type="button"
                  onClick={deleteCurrentConversation}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-red-50"
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 size={14} />
                  Delete conversation
                </button>
              </div>
            </>
          )}
        </header>

        <section
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="mx-auto flex max-w-4xl flex-col space-y-5">
            <div className="my-2 flex items-center gap-3">
              <div
                className="h-px flex-1"
                style={{ background: "rgba(124,58,237,0.1)" }}
              />

              <span
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  background: "rgba(124,58,237,0.08)",
                  color: "#7a6080",
                }}
              >
                Today
              </span>

              <div
                className="h-px flex-1"
                style={{ background: "rgba(124,58,237,0.1)" }}
              />
            </div>

            {messages.length <= 1 && (
              <div className="mx-auto my-8 max-w-2xl text-center">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#9d5cf5)",
                  }}
                >
                  <Bot size={28} color="#fff" />
                </div>

                <h1
                  className="mb-2 text-3xl font-black"
                  style={{ color: "#12082a", fontFamily: "var(--font-display)" }}
                >
                  How can ClariBot help you today?
                </h1>

                <p
                  className="mx-auto max-w-md text-sm leading-relaxed"
                  style={{ color: "#7a6080" }}
                >
                  Ask about products, prices, delivery, refunds, opening hours,
                  customer support, or which plan is best for your business.
                </p>

                <div className="mt-6 grid gap-3 text-left md:grid-cols-3">
                  <InfoCard
                    icon={<Package size={16} />}
                    title="Products"
                    text="Plans and setup services"
                  />
                  <InfoCard
                    icon={<DollarSign size={16} />}
                    title="Prices"
                    text="Starter, Growth, Enterprise"
                  />
                  <InfoCard
                    icon={<Clock size={16} />}
                    title="Support"
                    text="Opening hours and policies"
                  />
                </div>
              </div>
            )}

            {messages.map((m) => (
              <Bubble key={m.id} msg={m} onLike={handleLike} />
            ))}

            {typing && (
              <div className="flex justify-start gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#9d5cf5)",
                  }}
                >
                  <Bot size={15} color="#fff" />
                </div>

                <div
                  className="rounded-2xl bg-white px-4 py-3 shadow-sm"
                  style={{ borderBottomLeftRadius: "6px" }}
                >
                  <span className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: "#7c3aed",
                          animation: `bounce 1s infinite ${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </section>

        {messages.length <= 1 && (
          <div className="px-4 pb-3">
            <div className="mx-auto flex max-w-4xl flex-wrap gap-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:bg-[#f3e8ff] hover:border-[#7c3aed]"
                  style={{
                    borderColor: "rgba(124,58,237,0.2)",
                    color: "#7c3aed",
                    background: "#ffffff",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {isListening && (
          <div className="px-4">
            <div
              className="mx-auto mb-2 flex max-w-4xl items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
            >
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ background: "#ef4444" }}
              />
              Listening... speak now

              <button type="button" onClick={toggleMic} className="ml-auto">
                <StopCircle size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="px-4 pb-5 pt-2">
          <div className="mx-auto max-w-4xl">
            <div
              className="flex items-end gap-2 rounded-2xl border px-4 py-3"
              style={{
                background: "#ffffff",
                borderColor: "rgba(124,58,237,0.15)",
                boxShadow: "0 2px 12px rgba(124,58,237,0.08)",
              }}
            >
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleFileAttach}
                  className="rounded-lg p-1.5 transition-colors hover:bg-[#f3e8ff]"
                  title="Attach file"
                >
                  <Paperclip size={17} style={{ color: "#7a6080" }} />
                </button>

                <button
                  type="button"
                  className="rounded-lg p-1.5 transition-colors hover:bg-[#f3e8ff]"
                  title="Emoji"
                >
                  <Smile size={17} style={{ color: "#7a6080" }} />
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about products, prices, delivery, refunds, opening hours..."
                rows={1}
                className="flex-1 resize-none text-sm leading-relaxed outline-none"
                style={{
                  color: "#12082a",
                  background: "transparent",
                  fontFamily: "var(--font-body)",
                  maxHeight: "120px",
                }}
              />

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={toggleMic}
                  className="rounded-lg p-1.5 transition-colors hover:bg-[#f3e8ff]"
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? (
                    <MicOff size={17} style={{ color: "#ef4444" }} />
                  ) : (
                    <Mic size={17} style={{ color: "#7a6080" }} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => send()}
                  disabled={!input.trim() || typing}
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-105 disabled:opacity-30"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#9d5cf5)",
                  }}
                  title="Send message"
                >
                  <Send size={16} color="#fff" />
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-xs" style={{ color: "#7a6080" }}>
              ClariBot may occasionally make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        textarea {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#12082a]">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#7c3aed]">
          {icon}
        </span>
        {title}
      </div>

      <p className="text-xs text-[#7a6080]">{text}</p>
    </div>
  );
}