import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Mic,
  RotateCcw,
  Send,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { products, type Product } from "../lib/storeData";
import { useCart } from "../lib/cart";
import { api } from "../lib/api";

type QuickAction = {
  label: string;
  value: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text?: string;
  actions?: QuickAction[];
  products?: Product[];
};

const mainMenuActions: QuickAction[] = [
  { label: "Shop Products", value: "shop-products" },
  { label: "Track Order", value: "track-order" },
  { label: "Returns / Refunds", value: "returns" },
  { label: "Delivery", value: "delivery" },
  { label: "Talk to Human", value: "human-support" },
];

const categoryActions: QuickAction[] = [
  { label: "Pantry", value: "category:Pantry" },
  { label: "Dairy", value: "category:Dairy" },
  { label: "Halal Meat", value: "category:Halal Meat" },
  { label: "Sweets", value: "category:Sweets" },
  { label: "Drinks", value: "category:Drinks" },
  { label: "Bakery", value: "category:Bakery" },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ClariBotWidget() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [awaitingOrderId, setAwaitingOrderId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voicePanelOpen, setVoicePanelOpen] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "bot",
      text: "Hi! I’m ClariBot, your ClariMart virtual assistant. How may I help you?",
      actions: mainMenuActions,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const productRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  function addUserMessage(text: string) {
    setMessages((current) => [
      ...current,
      {
        id: makeId(),
        role: "user",
        text,
      },
    ]);
  }

  function addBotMessage(message: Omit<ChatMessage, "id" | "role">) {
    setMessages((current) => [
      ...current,
      {
        id: makeId(),
        role: "bot",
        ...message,
      },
    ]);
  }

  function resetChat() {
    setAwaitingOrderId(false);
    setMessages([
      {
        id: makeId(),
        role: "bot",
        text: "Hi! I’m ClariBot, your ClariMart virtual assistant. How may I help you?",
        actions: mainMenuActions,
      },
    ]);
  }

  function showMainMenu() {
    addBotMessage({
      text: "What would you like help with?",
      actions: mainMenuActions,
    });
  }

  function showCategoryProducts(category: string) {
    const matches = products.filter(
      (product) => product.category === category
    );

    if (matches.length === 0) {
      addBotMessage({
        text: `There are currently no ${category} products available in this demo.`,
        actions: [
          { label: "Choose Another Category", value: "shop-products" },
          { label: "Main Menu", value: "main-menu" },
        ],
      });
      return;
    }

    addBotMessage({
      text: `Here are some ${category} products you may like.`,
      products: matches,
      actions: [
        { label: "More Categories", value: "shop-products" },
        { label: "View Cart", value: "view-cart" },
        { label: "Checkout", value: "checkout" },
        { label: "Main Menu", value: "main-menu" },
      ],
    });
  }

  async function trackOrder(orderId: string) {
    setLoading(true);

    try {
      const result = await api.trackOrder(orderId);

      addBotMessage({
        text:
          `Order ${result.order.id}\n\n` +
          `Status: ${result.order.orderStatus || "Received"}\n` +
          `Payment: ${result.order.paymentStatus || "Paid (Demo)"}\n` +
          `Delivery: ${result.order.deliveryMethod || "Standard"}\n` +
          `Total: $${Number(result.order.total || 0).toFixed(2)}`,
        actions: [
          { label: "Track Another Order", value: "track-order" },
          { label: "Main Menu", value: "main-menu" },
        ],
      });
    } catch {
      addBotMessage({
        text: "I couldn’t find that order. Please check the order ID and try again.",
        actions: [
          { label: "Try Again", value: "track-order" },
          { label: "Talk to Human", value: "human-support" },
          { label: "Main Menu", value: "main-menu" },
        ],
      });
    } finally {
      setLoading(false);
      setAwaitingOrderId(false);
    }
  }

  async function handleAction(action: QuickAction) {
    addUserMessage(action.label);

    if (action.value === "shop-products") {
      addBotMessage({
        text: "What category are you looking for?",
        actions: categoryActions,
      });
      return;
    }

    if (action.value.startsWith("category:")) {
      const category = action.value.replace("category:", "");
      showCategoryProducts(category);
      return;
    }

    if (action.value === "track-order") {
      setAwaitingOrderId(true);

      addBotMessage({
        text: "Please enter your demo order ID. It should look like DEMO-1234567890.",
      });
      return;
    }

    if (action.value === "returns") {
      addBotMessage({
        text: "Returns and refund requests can be made within 7 days. Please keep your demo order ID and tell support which item you want to return.",
        actions: [
          { label: "Track Order", value: "track-order" },
          { label: "Talk to Human", value: "human-support" },
          { label: "Main Menu", value: "main-menu" },
        ],
      });
      return;
    }

    if (action.value === "delivery") {
      addBotMessage({
        text: "Standard delivery costs $8.99 and is free for orders over $50. Express delivery costs $14.99. Store pickup is free.",
        actions: [
          { label: "Shop Products", value: "shop-products" },
          { label: "Main Menu", value: "main-menu" },
        ],
      });
      return;
    }

    if (action.value === "human-support") {
      addBotMessage({
        text: "A human support request can be handled through support@clarimart.com or 02 1234 5678. For this demo, you can also use the Contact page.",
        actions: [
          { label: "Open Contact Page", value: "contact" },
          { label: "Main Menu", value: "main-menu" },
        ],
      });
      return;
    }

    if (action.value === "view-cart") {
      navigate("/cart");
      setOpen(false);
      return;
    }

    if (action.value === "checkout") {
      navigate("/checkout");
      setOpen(false);
      return;
    }

    if (action.value === "contact") {
      navigate("/contact");
      setOpen(false);
      return;
    }

    if (action.value === "main-menu") {
      showMainMenu();
    }
  }

  function addProduct(product: Product) {
    addToCart(product);

    addBotMessage({
      text: `${product.name} has been added to your cart.`,
      actions: [
        { label: "Continue Shopping", value: "shop-products" },
        { label: "View Cart", value: "view-cart" },
        { label: "Checkout", value: "checkout" },
      ],
    });
  }

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) return;

    addUserMessage(text);
    setInput("");

    if (awaitingOrderId) {
      await trackOrder(text);
      return;
    }

    setLoading(true);

    try {
      const conversation = await api.newConversation(
        "ClariMart website support"
      );

      const result = await api.chat(text, conversation.id);

      addBotMessage({
        text:
          result.reply?.text ||
          "I can help with products, delivery, checkout, returns and orders.",
        actions: [
          { label: "Shop Products", value: "shop-products" },
          { label: "Track Order", value: "track-order" },
          { label: "Main Menu", value: "main-menu" },
        ],
      });
    } catch {
      addBotMessage({
        text: "I can help with products, delivery, checkout, returns, store hours and demo orders.",
        actions: mainMenuActions,
      });
    } finally {
      setLoading(false);
    }
  }

  function speakLatestMessage() {
    const latestBotMessage = [...messages]
      .reverse()
      .find((message) => message.role === "bot" && message.text);

    if (!latestBotMessage?.text || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      latestBotMessage.text
    );

    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  function startVoiceInput() {
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      addBotMessage({
        text: "Voice input is not supported in this browser. Please type your message instead.",
      });

      setVoicePanelOpen(false);
      return;
    }

    const recognition = new SpeechRecognitionConstructor();

    recognition.lang = "en-AU";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
      setVoicePanelOpen(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setVoicePanelOpen(false);

      addBotMessage({
        text: "I couldn’t hear that clearly. Please try again or type your question.",
      });
    };

    recognition.onresult = (event: any) => {
      const spokenText = event.results?.[0]?.[0]?.transcript || "";

      setInput(spokenText);
    };

    recognition.start();
  }

  function scrollProducts(messageId: string, direction: number) {
    const element = productRowRefs.current[messageId];

    element?.scrollBy({
      left: direction * 260,
      behavior: "smooth",
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[80] flex items-center gap-3 rounded-full bg-sky-600 px-5 py-4 font-black text-white shadow-2xl hover:bg-sky-700"
      >
        <Bot size={22} />
        <span className="hidden sm:inline">ClariBot Support</span>
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[80] flex h-[min(760px,calc(100vh-32px))] w-[min(430px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border bg-white shadow-2xl">
        <header className="flex items-center justify-between bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2">
              <Bot size={23} />
            </div>

            <div>
              <p className="font-black">ClariBot</p>
              <p className="text-xs text-sky-100">
                Your ClariMart virtual assistant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 hover:bg-white/15"
          >
            <X size={19} />
          </button>
        </header>

        <div className="flex items-center justify-between border-b bg-white px-4 py-2">
          <p className="text-xs font-bold text-gray-500">
            AI customer support
          </p>

          <button
            type="button"
            onClick={resetChat}
            className="flex items-center gap-1 text-xs font-bold text-sky-600"
          >
            <RotateCcw size={14} />
            Restart
          </button>
        </div>

        <main className="flex-1 space-y-5 overflow-y-auto bg-slate-950 p-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex gap-2 ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.role === "bot" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                    <Bot size={17} />
                  </div>
                )}

                {message.text && (
                  <div
                    className={`max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-sky-600 text-white"
                        : "rounded-bl-md bg-slate-800 text-gray-100"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {message.role === "user" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white">
                    <UserRound size={16} />
                  </div>
                )}
              </div>

              {message.products && message.products.length > 0 && (
                <div className="relative mt-3">
                  <button
                    type="button"
                    onClick={() => scrollProducts(message.id, -1)}
                    className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div
                    ref={(element) => {
                      productRowRefs.current[message.id] = element;
                    }}
                    className="flex snap-x gap-3 overflow-x-auto px-7 pb-2 scrollbar-hide"
                  >
                    {message.products.map((product) => (
                      <article
                        key={product.id}
                        className="w-[230px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-700 bg-slate-900"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-36 w-full bg-white object-contain p-2"
                        />

                        <div className="p-4 text-white">
                          <p className="text-xs font-bold text-sky-400">
                            {product.category}
                          </p>

                          <h3 className="mt-1 min-h-[48px] font-black">
                            {product.name}
                          </h3>

                          <p className="mt-2 text-xl font-black">
                            ${product.price.toFixed(2)}
                          </p>

                          <div className="mt-4 grid gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                navigate(`/product/${product.id}`);
                                setOpen(false);
                              }}
                              className="rounded-xl border border-sky-500 px-3 py-2 text-sm font-black text-sky-300"
                            >
                              View Product
                            </button>

                            <button
                              type="button"
                              onClick={() => addProduct(product)}
                              className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-sm font-black text-white"
                            >
                              <ShoppingCart size={15} />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollProducts(message.id, 1)}
                    className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {message.actions && message.actions.length > 0 && (
                <div className="ml-10 mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action) => (
                    <button
                      key={`${message.id}-${action.value}`}
                      type="button"
                      onClick={() => handleAction(action)}
                      className="rounded-xl border border-sky-500/60 bg-sky-950 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-800"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white">
                <Bot size={17} />
              </div>

              <div className="rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3 text-sm text-gray-300">
                ClariBot is typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        <footer className="border-t border-slate-800 bg-slate-900 p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-slate-950 p-2">
            <button
              type="button"
              onClick={() => setVoicePanelOpen(true)}
              className="rounded-xl p-3 text-sky-400 hover:bg-slate-800"
              title="Voice assistant"
            >
              <Headphones size={20} />
            </button>

            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                awaitingOrderId
                  ? "Enter your order ID..."
                  : "Message ClariBot..."
              }
              className="max-h-24 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />

            <button
              type="button"
              onClick={speakLatestMessage}
              className="rounded-xl p-3 text-sky-400 hover:bg-slate-800"
              title="Read latest reply"
            >
              <Mic size={19} />
            </button>

            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="rounded-xl bg-sky-600 p-3 text-white disabled:opacity-40"
            >
              <Send size={19} />
            </button>
          </div>
        </footer>
      </div>

      {voicePanelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-950 p-8 text-center text-white shadow-2xl">
            <h2 className="text-2xl font-black">
              Talk to ClariBot
            </h2>

            <p className="mt-3 text-gray-400">
              Speak naturally and your message will appear in the chat input.
            </p>

            <button
              type="button"
              onClick={startVoiceInput}
              className={`mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-full border-4 ${
                listening
                  ? "animate-pulse border-red-400 bg-red-600"
                  : "border-sky-400 bg-sky-600"
              }`}
            >
              <Mic size={48} />
            </button>

            <p className="mt-5 font-bold">
              {listening ? "Listening..." : "Tap the microphone to start"}
            </p>

            <button
              type="button"
              onClick={() => setVoicePanelOpen(false)}
              className="mt-8 rounded-full border border-gray-700 px-6 py-3 font-black text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}