import { useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronRight,
  LoaderCircle,
  MessageCircle,
  Send,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

import { api } from "../lib/api";

type RecommendedProduct = {
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

type Msg = {
  role: "user" | "bot";
  text: string;
  recommendedProducts?: RecommendedProduct[];
};

function fallbackReply(text: string): Msg {
  const q = text.toLowerCase();

  if (
    q.includes("recommend") ||
    q.includes("suggest") ||
    q.includes("best")
  ) {
    return {
      role: "bot",
      text:
        "I can recommend breakfast products, sweets, halal products, healthy choices and budget-friendly items. The backend is currently unavailable, so product cards could not be loaded.",
    };
  }

  return {
    role: "bot",
    text:
      "I’m ClariBot, your ClariMart shopping assistant. I can help with products, prices, offers, delivery, checkout and refunds.",
  };
}

export default function ClariBotWidget() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text:
        "Hi! 👋 I’m ClariBot. Tell me what you are shopping for and I’ll recommend the best matching ClariMart products.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  async function sendMessage() {
    const text = input.trim();

    if (!text || typing) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text,
      },
    ]);

    setInput("");
    setTyping(true);

    try {
      let id = conversationId;

      if (!id) {
        const conversation = await api.newConversation(
          "ClariMart customer support"
        );

        id = String(conversation.id);
        setConversationId(id);
      }

      const result = await api.chat(text, id);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setMessages((previous) => [
        ...previous,
        {
          role: "bot",
          text:
            result.reply?.text ||
            "Here are the products I recommend.",
          recommendedProducts:
            result.reply?.recommendedProducts || [],
        },
      ]);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMessages((previous) => [
        ...previous,
        fallbackReply(text),
      ]);
    } finally {
      setTyping(false);
    }
  }

  function viewProduct(productId: string) {
    setOpen(false);
    navigate(`/product/${productId}`);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open ClariBot"
        className="fixed bottom-5 right-5 z-50 rounded-full bg-orange-600 p-4 text-white shadow-xl transition hover:scale-105 hover:bg-orange-700"
      >
        <MessageCircle />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[600px] w-[390px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-orange-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <Bot />

          <div>
            <p className="font-black">ClariBot Support</p>
            <p className="text-xs text-white/80">
              AI shopping assistant
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close ClariBot"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-orange-50 p-4">
        {messages.map((message, messageIndex) => (
          <div
            key={`${message.role}-${messageIndex}`}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={
                message.role === "user"
                  ? "max-w-[82%] rounded-2xl bg-orange-600 px-4 py-2 text-sm text-white"
                  : "w-full"
              }
            >
              {message.role === "bot" && (
                <div className="max-w-[88%] whitespace-pre-line rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
                  {message.text}
                </div>
              )}

              {message.role === "user" && message.text}

              {message.role === "bot" &&
                message.recommendedProducts &&
                message.recommendedProducts.length > 0 && (
                  <div className="mt-3 flex gap-3 overflow-x-auto pb-3">
                    {message.recommendedProducts.map(
                      (product) => (
                        <article
                          key={product.id}
                          className="min-w-[220px] max-w-[220px] overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"
                        >
                          <div className="relative h-32 bg-slate-50">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain p-2"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />

                            {product.badge && (
                              <span className="absolute left-2 top-2 rounded-full bg-orange-600 px-2 py-1 text-[10px] font-bold text-white">
                                {product.badge}
                              </span>
                            )}
                          </div>

                          <div className="p-3">
                            <p className="text-xs font-bold text-sky-600">
                              {product.category}
                            </p>

                            <h3 className="mt-1 min-h-10 text-sm font-black leading-5 text-slate-950">
                              {product.name}
                            </h3>

                            {product.rating && (
                              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-600">
                                <Star
                                  size={14}
                                  fill="currentColor"
                                />
                                {product.rating.toFixed(1)}
                              </div>
                            )}

                            <p className="mt-2 min-h-12 text-xs leading-4 text-slate-500">
                              {product.reason ||
                                product.description}
                            </p>

                            <div className="mt-3 flex items-end gap-2">
                              <p className="text-xl font-black">
                                ${product.price.toFixed(2)}
                              </p>

                              {product.oldPrice && (
                                <p className="pb-1 text-xs text-slate-400 line-through">
                                  $
                                  {product.oldPrice.toFixed(2)}
                                </p>
                              )}
                            </div>

                            <p className="mt-1 text-xs font-semibold text-green-700">
                              {product.stock} in stock
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                viewProduct(product.id)
                              }
                              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-sky-600"
                            >
                              <ShoppingCart size={15} />
                              View & Add
                              <ChevronRight size={15} />
                            </button>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              <LoaderCircle
                className="animate-spin"
                size={16}
              />
              ClariBot is finding the best products...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 border-t bg-white p-3">
        <input
          value={input}
          disabled={typing}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void sendMessage();
            }
          }}
          placeholder="Ask for product recommendations..."
          className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:border-orange-500 disabled:bg-slate-100"
        />

        <button
          type="button"
          disabled={typing || !input.trim()}
          onClick={() => void sendMessage()}
          className="rounded-xl bg-orange-600 px-3 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}