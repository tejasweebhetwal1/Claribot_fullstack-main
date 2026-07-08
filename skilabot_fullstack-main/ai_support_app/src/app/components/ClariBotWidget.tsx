import { useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { api } from "../lib/api";

type Msg = {
  role: "user" | "bot";
  text: string;
};

function fallbackReply(text: string) {
  const q = text.toLowerCase();

  if (q.includes("delivery")) {
    return "We deliver across selected local suburbs. Delivery is free over $50, otherwise $8.99.";
  }

  if (q.includes("halal")) {
    return "Yes, many products are halal, including our Halal Beef Sucuk.";
  }

  if (q.includes("payment") || q.includes("card") || q.includes("checkout")) {
    return "This website uses demo checkout only. You can enter fake card details and no real money is deducted.";
  }

  if (q.includes("refund") || q.includes("return")) {
    return "Refunds can be requested within 7 days with your order number.";
  }

  if (q.includes("open") || q.includes("hours")) {
    return "We are open Monday to Saturday, 9:00 AM to 6:00 PM.";
  }

  return "I’m ClariBot. I can help with products, delivery, halal options, checkout, refunds and store information.";
}

export default function ClariBotWidget() {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! I’m ClariBot, your AI customer support assistant. Ask me about products, delivery, checkout or refunds.",
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
        const convo = await api.newConversation("Website customer support");
        id = String(convo.id);
        setConversationId(id);
      }

      const result = await api.chat(text, id);
      setMessages((prev) => [...prev, { role: "bot", text: result.reply.text }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: fallbackReply(text) }]);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-orange-600 p-4 text-white shadow-xl"
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

        <button onClick={() => setOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="h-80 space-y-3 overflow-y-auto bg-orange-50 p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask ClariBot..."
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
        />

        <button
          onClick={sendMessage}
          className="rounded-xl bg-orange-600 px-3 text-white"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}