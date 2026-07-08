import { useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { api } from "../lib/api";

type Msg = {
  role: "user" | "bot";
  text: string;
};

function fallbackReply(text: string) {
  const q = text.toLowerCase();

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hi! 👋 I’m ClariBot, your ClariMart shopping assistant. I can help with products, prices, offers, delivery, checkout and refunds.";
  }

  if (q.includes("tahini")) {
    return "Premium Pure Tahini 750g is available for $10.50. It is on sale from $12.50. Speciality: smooth sesame flavour, perfect for hummus, dips, sauces and healthy breakfast bowls.";
  }

  if (q.includes("honey")) {
    return "Flower Honey 1kg is available for $10.00. Speciality: natural honey, perfect for tea, toast, breakfast and desserts.";
  }

  if (q.includes("yogurt") || q.includes("yoghurt")) {
    return "Turkish Style Yogurt 2kg is available for $7.00. Speciality: thick Turkish-style yogurt, good for breakfast, cooking and sauces.";
  }

  if (q.includes("halal") || q.includes("sucuk") || q.includes("meat")) {
    return "Yes, we have Halal Beef Sucuk 500g for $13.60. It is one of our speciality halal products and is good for breakfast, sandwiches and cooking.";
  }

  if (
    q.includes("sweet") ||
    q.includes("dessert") ||
    q.includes("chocolate") ||
    q.includes("turkish delight")
  ) {
    return "For sweets, we have Rose Turkish Delight 250g for $5.00 and Dubai Chocolate for $10.00. Turkish Delight is budget-friendly, while Dubai Chocolate is a premium dessert option.";
  }

  if (
    q.includes("offer") ||
    q.includes("discount") ||
    q.includes("sale") ||
    q.includes("special")
  ) {
    return "Current ClariMart offers: free delivery on orders over $50, Premium Pure Tahini is on sale from $12.50 to $10.50, and Rose Turkish Delight is only $5.00.";
  }

  if (q.includes("recommend") || q.includes("suggest") || q.includes("best")) {
    return "My recommendations: for breakfast, try Flower Honey and Turkish Style Yogurt. For cooking, try Tahini and Halal Beef Sucuk. For dessert, try Rose Turkish Delight or Dubai Chocolate.";
  }

  if (
    q.includes("product") ||
    q.includes("products") ||
    q.includes("available")
  ) {
    return "We offer Premium Pure Tahini 750g, Flower Honey 1kg, Rose Turkish Delight 250g, Turkish Style Yogurt 2kg, Halal Beef Sucuk 500g and Dubai Chocolate.";
  }

  if (q.includes("delivery") || q.includes("shipping")) {
    return "We deliver across selected local suburbs. Delivery is free for orders over $50. Otherwise, the delivery fee is $8.99.";
  }

  if (q.includes("payment") || q.includes("card") || q.includes("checkout")) {
    return "This website uses demo checkout only. You can enter fake card details and no real money is deducted.";
  }

  if (q.includes("refund") || q.includes("return")) {
    return "Refunds can be requested within 7 days with your order number. Opened food items may only be refunded if there is a quality issue.";
  }

  if (q.includes("open") || q.includes("hours")) {
    return "ClariMart is open Monday to Saturday, 9:00 AM to 6:00 PM. Online browsing and ClariBot support are available anytime.";
  }

  return "I’m ClariBot, your ClariMart shopping assistant. I can help with product details, prices, offers, halal items, sweets, breakfast ideas, delivery, checkout and refunds.";
}

export default function ClariBotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! 👋 I’m ClariBot, your ClariMart shopping assistant. Ask me about products, prices, offers, special items, delivery, checkout or refunds.",
    },
  ]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    try {
      let id = conversationId;

      if (!id) {
        const convo = await api.newConversation("ClariMart customer support");
        id = String(convo.id);
        setConversationId(id);
      }

      const result = await api.chat(text, id);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: result.reply?.text || fallbackReply(text),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: fallbackReply(text),
        },
      ]);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-orange-600 p-4 text-white shadow-xl transition hover:scale-105"
      >
        <MessageCircle />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 overflow-hidden rounded-3xl border bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-orange-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <Bot />
          <div>
            <p className="font-black">ClariBot Support</p>
            <p className="text-xs text-white/80">AI live customer support</p>
          </div>
        </div>

        <button type="button" onClick={() => setOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="h-80 space-y-3 overflow-y-auto bg-orange-50 p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-orange-600 text-white"
                  : "bg-white shadow"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask ClariBot..."
          className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:border-orange-500"
        />

        <button
          type="button"
          onClick={sendMessage}
          className="rounded-xl bg-orange-600 px-3 text-white"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}