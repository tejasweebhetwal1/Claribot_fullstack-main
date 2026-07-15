import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Bot,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";

import StoreHeader from "../components/StoreHeader";
import StoreFooter from "../components/StoreFooter";
import ClariBotWidget from "../components/ClariBotWidget";

type FaqCategory =
  | "all"
  | "shopping"
  | "delivery"
  | "payment"
  | "orders"
  | "returns"
  | "account"
  | "claribot"
  | "contact";

type Faq = {
  category: Exclude<FaqCategory, "all">;
  question: string;
  answer: string;
};

type CategoryOption = {
  id: FaqCategory;
  label: string;
  icon: any;
};

const categories: CategoryOption[] = [
  {
    id: "all",
    label: "All Topics",
    icon: CircleHelp,
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: Truck,
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
  },
  {
    id: "orders",
    label: "Orders",
    icon: Package,
  },
  {
    id: "returns",
    label: "Returns",
    icon: RefreshCw,
  },
  {
    id: "account",
    label: "My Account",
    icon: UserRound,
  },
  {
    id: "claribot",
    label: "ClariBot",
    icon: Bot,
  },
  {
    id: "contact",
    label: "Contact",
    icon: MapPin,
  },
];

const faqs: Faq[] = [
  {
    category: "shopping",
    question: "How do I place an order?",
    answer:
      "Browse the Shop page, select the products you want, add them to your cart and continue to checkout. Enter your delivery and demo payment details, then press Place Demo Order.",
  },
  {
    category: "shopping",
    question: "Can I shop without creating an account?",
    answer:
      "Yes. You can browse products, add items to the cart and place a demo order as a guest. Creating an account lets you view your order history and manage your wishlist.",
  },
  {
    category: "shopping",
    question: "What types of products does ClariMart sell?",
    answer:
      "ClariMart sells pantry products, dairy, halal meat, sweets, drinks and bakery items. Product availability may vary in this classroom demonstration.",
  },
  {
    category: "shopping",
    question: "What happens if a product is out of stock?",
    answer:
      "Products marked out of stock cannot be added to the cart. You can browse another category or ask ClariBot to recommend a similar item.",
  },
  {
    category: "shopping",
    question: "Can I save products for later?",
    answer:
      "Yes. Use the heart button on a product to add it to your wishlist. You can view saved items from your customer account page.",
  },

  {
    category: "delivery",
    question: "How much does delivery cost?",
    answer:
      "Standard delivery costs $8.99 and is free for orders over $50. Express delivery costs $14.99. Store pickup is free.",
  },
  {
    category: "delivery",
    question: "How long does delivery take?",
    answer:
      "Standard delivery is estimated at 2 to 4 business days. Express delivery is estimated for the next business day. These times are for demonstration purposes.",
  },
  {
    category: "delivery",
    question: "Can I collect my order from the store?",
    answer:
      "Yes. Choose Store Pickup during checkout. Pickup is free and the order status can be viewed through your account or ClariBot.",
  },
  {
    category: "delivery",
    question: "Do you deliver everywhere in Australia?",
    answer:
      "This is a university demonstration website, so delivery areas are simulated. In a real business system, delivery eligibility would be checked using the customer's postcode.",
  },

  {
    category: "payment",
    question: "What card details should I use for the demo?",
    answer:
      "Use card number 4242 4242 4242 4242, expiry 12/30 and CVV 123. These are demo details only.",
  },
  {
    category: "payment",
    question: "Will real money be deducted?",
    answer:
      "No. The checkout is a classroom demonstration. No bank transaction is performed and no real money is deducted.",
  },
  {
    category: "payment",
    question: "Is my real card information stored?",
    answer:
      "No. You should not enter real card details. The website is designed to use only the provided demo card information.",
  },
  {
    category: "payment",
    question: "What payment status will my order show?",
    answer:
      "A successful demo order will show the payment status Paid (Demo).",
  },

  {
    category: "orders",
    question: "Where can I find my order number?",
    answer:
      "Your order number appears on the order success page after checkout. It begins with DEMO-, for example DEMO-1234567890.",
  },
  {
    category: "orders",
    question: "How do I track my order?",
    answer:
      "Open your customer account and select Track Order, or choose Track Order in ClariBot. Enter the exact DEMO order ID shown on the order confirmation page.",
  },
  {
    category: "orders",
    question: "Where can I see my previous orders?",
    answer:
      "Log in to your customer account and open My Orders. Orders appear when the checkout email matches the email used for your customer account.",
  },
  {
    category: "orders",
    question: "Can I buy the same order again?",
    answer:
      "Yes. Open My Orders in your account and use the Buy Again button. Available products from that order will be added back to your cart.",
  },
  {
    category: "orders",
    question: "Can I cancel an order?",
    answer:
      "For this demo, cancellation is handled as a support request. Contact ClariBot or human support before the order is marked as dispatched.",
  },

  {
    category: "returns",
    question: "How do I return a product?",
    answer:
      "Open ClariBot and choose Returns / Refunds. Enter your exact order ID, select the specific product from that order and type your return reason.",
  },
  {
    category: "returns",
    question: "Can I return only one item from an order?",
    answer:
      "Yes. ClariBot loads the exact products from the selected order and lets you choose the specific item you want to return.",
  },
  {
    category: "returns",
    question: "What information is required for a return?",
    answer:
      "You need the demo order ID, the exact product and a reason for the return.",
  },
  {
    category: "returns",
    question: "What happens after I submit a return request?",
    answer:
      "A return request is created with the status Requested. The request appears in the admin dashboard, where staff can mark it Approved, Rejected or Completed.",
  },
  {
    category: "returns",
    question: "Does the website issue a real refund?",
    answer:
      "No. Because the payment is only a demo, the return system records a return request but does not reverse a real payment.",
  },

  {
    category: "account",
    question: "How do I create a customer account?",
    answer:
      "Open Account from the store header, choose the signup option, enter your details and complete email verification using the OTP sent to your email.",
  },
  {
    category: "account",
    question: "What can I do from my account page?",
    answer:
      "You can view your previous orders, track an order, manage your wishlist, view account information and access ClariBot support.",
  },
  {
    category: "account",
    question: "Why is an order not appearing in My Orders?",
    answer:
      "The email used during checkout must exactly match the email used for your customer account. Orders placed with another email will not appear.",
  },
  {
    category: "account",
    question: "How do I log out?",
    answer:
      "Open your customer account and press the red Logout button.",
  },
  {
    category: "account",
    question: "How does the wishlist work?",
    answer:
      "Press the heart button on a product to save it. Your wishlist is stored in the browser and can be opened from the customer account page.",
  },

  {
    category: "claribot",
    question: "What can ClariBot help me with?",
    answer:
      "ClariBot can recommend products, display product categories, add items to the cart, explain delivery, track orders, create exact-item return requests and provide contact information.",
  },
  {
    category: "claribot",
    question: "Can ClariBot add products to my cart?",
    answer:
      "Yes. Choose Shop Products in ClariBot, select a category and press Add to Cart on a product card.",
  },
  {
    category: "claribot",
    question: "Can ClariBot track an order?",
    answer:
      "Yes. Choose Track Order and enter the exact DEMO order ID. ClariBot will display the order status, payment status, delivery method and total.",
  },
  {
    category: "claribot",
    question: "Can ClariBot help with returns?",
    answer:
      "Yes. ClariBot can find an order, show only the products from that order, let the customer select one exact item and create a return request.",
  },
  {
    category: "claribot",
    question: "Does ClariBot support voice input?",
    answer:
      "Voice input may work in supported browsers. Press the voice assistant button, allow microphone access and speak your message.",
  },
  {
    category: "claribot",
    question: "How do I speak to a human?",
    answer:
      "Choose Talk to Human in ClariBot or open the Contact page for the demo phone number and support email.",
  },

  {
    category: "contact",
    question: "What are the store opening hours?",
    answer:
      "ClariMart is open Monday to Saturday from 9:00 AM to 6:00 PM. ClariBot support is available at any time during the website demonstration.",
  },
  {
    category: "contact",
    question: "How can I contact ClariMart?",
    answer:
      "Use the Contact page, email support@clarimart.com or call 02 1234 5678.",
  },
  {
    category: "contact",
    question: "Where is the store located?",
    answer:
      "The demonstration store address is 123 Demo Street, Sydney NSW, Australia.",
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white transition ${
        open
          ? "border-sky-300 shadow-md"
          : "border-gray-200 shadow-sm hover:border-sky-200"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left md:px-6"
        aria-expanded={open}
      >
        <span className="font-black text-slate-900">
          {question}
        </span>

        <ChevronDown
          size={20}
          className={`shrink-0 text-sky-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t bg-sky-50/50 px-5 py-5 md:px-6">
          <p className="leading-7 text-gray-600">
            {answer}
          </p>
        </div>
      )}
    </article>
  );
}

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<FaqCategory>("all");

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" ||
        faq.category === activeCategory;

      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader />

      <main>
        <section className="bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-500 px-6 py-16 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-100">
              ClariMart Help Centre
            </p>

            <h1 className="mt-4 text-4xl font-black md:text-6xl">
              How can we help?
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-sky-100">
              Find answers about shopping, delivery, demo payments,
              orders, returns, customer accounts and ClariBot support.
            </p>

            <div className="relative mx-auto mt-8 max-w-2xl">
              <Search
                size={21}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search for delivery, returns, payment, tracking..."
                className="w-full rounded-full border-0 bg-white py-5 pl-14 pr-6 text-gray-900 shadow-xl outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-3xl border bg-white p-4 shadow-sm lg:sticky lg:top-40">
              <p className="px-3 pb-3 text-xs font-black uppercase tracking-[0.18em] text-gray-400">
                Browse Topics
              </p>

              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;

                  const count =
                    category.id === "all"
                      ? faqs.length
                      : faqs.filter(
                          (faq) => faq.category === category.id
                        ).length;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setActiveCategory(category.id)
                      }
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold transition ${
                        activeCategory === category.id
                          ? "bg-sky-600 text-white"
                          : "text-gray-600 hover:bg-sky-50 hover:text-sky-700"
                      }`}
                    >
                      <Icon size={18} />

                      <span className="flex-1">
                        {category.label}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          activeCategory === category.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div>
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-sky-600">
                    Frequently Asked Questions
                  </p>

                  <h2 className="mt-1 text-3xl font-black text-slate-900">
                    {
                      categories.find(
                        (category) =>
                          category.id === activeCategory
                      )?.label
                    }
                  </h2>
                </div>

                <p className="text-sm font-bold text-gray-500">
                  {filteredFaqs.length}{" "}
                  {filteredFaqs.length === 1
                    ? "question"
                    : "questions"}
                </p>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="rounded-3xl border bg-white px-6 py-16 text-center shadow-sm">
                  <MessageCircle
                    size={55}
                    className="mx-auto text-gray-300"
                  />

                  <h3 className="mt-5 text-2xl font-black">
                    No answers found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-gray-500">
                    Try another search term or ask ClariBot for help.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => (
                    <FaqItem
                      key={faq.question}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500">
                <Bot size={29} />
              </div>

              <h2 className="mt-6 text-3xl font-black">
                Ask ClariBot
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-slate-300">
                ClariBot can recommend products, track an order,
                explain delivery and create exact-item return requests.
              </p>

              <p className="mt-6 text-sm font-black text-sky-300">
                Open the ClariBot Support button at the bottom-right
                corner of the page.
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <MessageCircle size={29} />
              </div>

              <h2 className="mt-6 text-3xl font-black">
                Still need help?
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-gray-600">
                Contact the ClariMart support team for help with an
                order, product, return request or customer account.
              </p>

              <Link
                to="/contact"
                className="mt-6 inline-flex rounded-full bg-sky-600 px-6 py-3 font-black text-white transition hover:bg-sky-700"
              >
                Contact ClariMart
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter />
      <ClariBotWidget />
    </div>
  );
}