import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bot,
  MessageCircle,
  Zap,
  Sparkles,
  Shield,
  Users,
  BarChart3,
  Brain,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  Headphones,
  ArrowRight,
  Building2,
  Star,
} from "lucide-react";
import { api } from "../lib/api";

export default function LandingPage() {
  const navigate = useNavigate();

  // Hero email capture
  const [heroEmail, setHeroEmail] = useState("");
  const [heroStatus, setHeroStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function handleHeroEmail() {
    if (!heroEmail.trim()) return;

    setHeroStatus("loading");

    try {
      await api.createLead(heroEmail, "hero");
      setHeroStatus("ok");
      setHeroEmail("");
    } catch {
      setHeroStatus("err");
    }
  }

  // Contact form
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function handleContactSubmit() {
    if (!form.email.trim() || !form.name.trim()) return;

    setFormStatus("loading");

    try {
      await api.createLead(form.email, "contact", {
        name: form.name,
        subject: form.subject,
        message: form.message,
      });

      setFormStatus("ok");

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch {
      setFormStatus("err");
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#151525]">
      {/* NAV + HERO */}
      <section className="rounded-b-[32px] bg-[#fff5f1] px-6 py-5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-bold text-lg"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bd5b96] text-white">
              <Bot size={18} />
            </span>
            <span>
              Clari<span className="text-[#bd5b96]">Bot</span>
            </span>
          </button>

          <div className="hidden gap-8 text-sm font-medium md:flex">
            <a href="#home" className="hover:text-[#bd5b96] transition-colors">
              Home
            </a>
            <a href="#about" className="hover:text-[#bd5b96] transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-[#bd5b96] transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-[#bd5b96] transition-colors">
              Pricing
            </a>
            <a href="#contact" className="hover:text-[#bd5b96] transition-colors">
              Contact
            </a>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/demo-chat")}
              className="rounded-lg border border-pink-200 px-4 py-2 text-sm font-medium hover:bg-pink-50 transition-colors"
            >
              Live Demo
            </button>

            <button
              onClick={() => navigate("/login")}
              className="rounded-lg bg-[#bd5b96] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* HERO */}
        <div
          id="home"
          className="mx-auto mt-16 max-w-6xl pb-16 md:grid md:grid-cols-2 md:gap-12 md:items-center"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-xs font-semibold text-pink-600">
              <Sparkles size={13} />
              AI-powered business customer support
            </div>

            <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">
              Smart AI Chatbot <br />
              for Modern <br />
              <span className="text-[#ff715b]">Business Support</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600">
              ClariBot helps businesses answer customer questions instantly, capture leads,
              reduce support workload, and provide a ChatGPT-like support experience directly
              from their website.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#bd5b96] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Create Account
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate("/demo-chat")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-pink-200 bg-white px-6 py-3 text-sm font-semibold text-[#bd5b96] hover:bg-pink-50 transition-colors"
              >
                Try Chatbot Demo
                <MessageCircle size={16} />
              </button>
            </div>

            <div className="mt-8 flex max-w-md overflow-hidden rounded-lg border bg-white shadow-sm">
              <input
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHeroEmail()}
                className="flex-1 px-4 py-3 text-sm outline-none"
                placeholder="Enter your email for free trial"
                type="email"
                disabled={heroStatus === "loading" || heroStatus === "ok"}
              />

              <button
                onClick={handleHeroEmail}
                disabled={heroStatus === "loading" || heroStatus === "ok"}
                className="bg-[#bd5b96] px-5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {heroStatus === "loading"
                  ? "Saving..."
                  : heroStatus === "ok"
                  ? "✓ Sent!"
                  : "Start Free Trial"}
              </button>
            </div>

            {heroStatus === "ok" && (
              <p className="mt-2 text-xs font-medium text-green-600">
                Thanks! Your request has been saved. Our team will be in touch soon.
              </p>
            )}

            {heroStatus === "err" && (
              <p className="mt-2 text-xs text-red-500">
                Something went wrong. Please check your backend and try again.
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-5 text-xs text-gray-500">
              <span>✅ Free trial request</span>
              <span>✅ No credit card required</span>
              <span>✅ Business-ready support</span>
            </div>
          </div>

          <div className="mt-12 hidden justify-center md:flex">
            <div
              className="relative flex h-[360px] w-[360px] items-center justify-center overflow-hidden rounded-[32px] shadow-2xl"
              style={{ background: "linear-gradient(135deg,#7c3aed,#f97316)" }}
            >
              <img
                src="/robot.png"
                alt="AI robot assistant"
                className="h-full w-full object-cover"
              />

              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#bd5b96] text-white">
                    <Bot size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#151525]">ClariBot</p>
                    <p className="text-xs text-gray-500">
                      Hello! How can I help your customers today?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUSINESS INTEGRATION SECTION */}
      <section id="about" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-pink-500">
              Business Website Integration
            </p>

            <h2 className="mb-6 text-4xl font-bold">
              More than a chatbot — a complete business support website
            </h2>

            <p className="text-lg leading-relaxed text-gray-500">
              ClariBot is integrated into a business website with landing page,
              service information, pricing, FAQ support, customer account registration,
              chatbot access, and admin dashboard. This makes the system practical for
              real customer support use.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <BusinessCard
              icon={<Building2 size={22} />}
              title="Business Website"
              text="A professional landing page with company details, service information, and contact form."
            />

            <BusinessCard
              icon={<MessageCircle size={22} />}
              title="AI Chat Support"
              text="Customers can access a ChatGPT-like chatbot for instant support and common questions."
            />

            <BusinessCard
              icon={<Users size={22} />}
              title="User Accounts"
              text="Customers can register, log in, and use personalised chat support features."
            />

            <BusinessCard
              icon={<BarChart3 size={22} />}
              title="Admin Dashboard"
              text="Admins can view conversations, leads, users, and support activity from one dashboard."
            />
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              ["24/7", "Support access"],
              ["< 1s", "Response speed"],
              ["94%", "Demo resolution"],
              ["5 ★", "User experience"],
            ].map(([number, label]) => (
              <div key={label} className="rounded-2xl bg-[#fff5f1] p-6 text-center">
                <p className="text-3xl font-black text-pink-500">{number}</p>
                <p className="mt-1 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-[#fff5f1] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-pink-500">
            Features
          </p>

          <h2 className="mb-4 text-center text-4xl font-bold">
            Everything needed for smart customer support
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-500">
            ClariBot combines a modern business website, AI support chatbot,
            user authentication, backend API routes, and admin monitoring tools.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <Feature
              icon={<Brain size={22} />}
              title="Smart AI Replies"
              text="Responds to common customer queries such as pricing, opening hours, delivery, contact, refunds, and support."
            />

            <Feature
              icon={<Zap size={22} />}
              title="Instant Responses"
              text="Provides quick chatbot replies and improves customer experience by reducing waiting time."
            />

            <Feature
              icon={<Shield size={22} />}
              title="Secure Login"
              text="Supports customer signup/login and admin login using backend authentication logic."
            />

            <Feature
              icon={<Users size={22} />}
              title="Lead Capture"
              text="Collects customer emails from free trial and contact forms and stores them in backend storage."
            />

            <Feature
              icon={<BarChart3 size={22} />}
              title="Admin Analytics"
              text="Displays total users, conversations, leads, and customer chat activity in the admin dashboard."
            />

            <Feature
              icon={<MessageCircle size={22} />}
              title="ChatGPT-like UI"
              text="Includes conversation sidebar, new chat button, message bubbles, fixed input box, and feedback buttons."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-pink-500">
            Workflow
          </p>

          <h2 className="mb-12 text-center text-4xl font-bold">
            How ClariBot works
          </h2>

          <div className="grid gap-6 md:grid-cols-4">
            <Step
              number="01"
              title="Customer visits site"
              text="The user lands on the business website and explores services, pricing, and support options."
            />

            <Step
              number="02"
              title="User creates account"
              text="The customer registers using a standard account registration process and logs in."
            />

            <Step
              number="03"
              title="Chatbot handles query"
              text="The chatbot answers common questions instantly using predefined business support logic."
            />

            <Step
              number="04"
              title="Admin reviews chats"
              text="The admin dashboard stores and displays customer conversations and leads for follow-up."
            />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-[#fff5f1] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-pink-500">
            Pricing
          </p>

          <h2 className="mb-4 text-center text-4xl font-bold">
            Simple plans for every business
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-500">
            Choose a plan based on your support volume and business needs.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <Plan
              name="Starter"
              price="$0"
              description="Best for testing the chatbot."
              onSignUp={() => navigate("/login")}
            />

            <Plan
              name="Growth"
              price="$99"
              description="Best for growing small businesses."
              highlighted
              onSignUp={() => navigate("/login")}
            />

            <Plan
              name="Enterprise"
              price="$299"
              description="Best for large businesses and teams."
              onSignUp={() => navigate("/login")}
            />
          </div>
        </div>
      </section>

      {/* SUPPORT INFO */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <InfoBox
            icon={<Clock size={22} />}
            title="Opening Hours"
            text="Monday to Friday, 9:00 AM to 5:00 PM. Closed on weekends and public holidays."
          />

          <InfoBox
            icon={<Headphones size={22} />}
            title="Customer Support"
            text="Customers can use the chatbot anytime and contact the support team for complex issues."
          />

          <InfoBox
            icon={<Mail size={22} />}
            title="Lead Follow-up"
            text="Free trial and contact form submissions are saved so the business can follow up later."
          />
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="bg-gradient-to-r from-[#75d4c8] to-[#e0528d] px-6 py-24"
      >
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div className="text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Contact
            </p>

            <h2 className="mb-6 text-4xl font-bold">Let&apos;s talk</h2>

            <p className="mb-8 max-w-md text-white/85">
              Have questions about ClariBot? Send us a message and our team will
              follow up with you. You can also try the live chatbot demo.
            </p>

            <div className="space-y-4">
              <p className="flex items-center gap-3">
                <Phone size={18} />
                +61 400 123 456
              </p>

              <p className="flex items-center gap-3">
                <Mail size={18} />
                support@claribot.com
              </p>

              <p className="flex items-center gap-3">
                <MapPin size={18} />
                Melbourne, Victoria, Australia
              </p>

              <p className="flex items-center gap-3">
                <Clock size={18} />
                Monday - Friday, 9:00 AM - 5:00 PM
              </p>
            </div>

            <button
              onClick={() => navigate("/demo-chat")}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#bd5b96] hover:bg-pink-50 transition-colors"
            >
              Try Live Chat
              <MessageCircle size={16} />
            </button>
          </div>

          <div className="rounded-2xl bg-white/85 p-8 shadow-xl backdrop-blur">
            <h3 className="mb-2 text-2xl font-bold">Send a message</h3>

            <p className="mb-6 text-sm text-gray-500">
              This form saves customer interest as a lead in the backend.
            </p>

            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mb-4 w-full border-b border-gray-200 bg-transparent py-3 text-sm outline-none focus:border-pink-400 transition-colors"
              placeholder="Your Name"
            />

            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              type="email"
              className="mb-4 w-full border-b border-gray-200 bg-transparent py-3 text-sm outline-none focus:border-pink-400 transition-colors"
              placeholder="Your Email"
            />

            <input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="mb-4 w-full border-b border-gray-200 bg-transparent py-3 text-sm outline-none focus:border-pink-400 transition-colors"
              placeholder="Subject"
            />

            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="mb-6 w-full resize-none border-b border-gray-200 bg-transparent py-3 text-sm outline-none focus:border-pink-400 transition-colors"
              placeholder="Write your message..."
              rows={3}
            />

            {formStatus === "ok" ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-3 text-center font-semibold text-white">
                <CheckCircle size={16} />
                Message saved! We&apos;ll reply soon.
              </div>
            ) : (
              <button
                onClick={handleContactSubmit}
                disabled={formStatus === "loading"}
                className="w-full rounded-lg bg-[#bd5b96] py-3 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {formStatus === "loading" ? "Saving..." : "Send Message"}
              </button>
            )}

            {formStatus === "err" && (
              <p className="mt-2 text-center text-xs text-red-500">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-[28px] bg-[#151525] px-8 py-14 text-center text-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Bot size={26} />
          </div>

          <h2 className="text-4xl font-bold">Ready to support customers faster?</h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-300">
            Create an account and experience a modern AI customer support system
            with a business website, chatbot interface, backend API, and admin dashboard.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg bg-[#bd5b96] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Create Account
            </button>

            <button
              onClick={() => navigate("/demo-chat")}
              className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Try Demo Chat
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#151525] px-6 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 md:flex-row">
          <div>
            <h2 className="mb-3 text-3xl font-bold">
              <span className="text-orange-400">Clari</span>
              <span className="text-pink-400">Bot</span>
            </h2>

            <p className="max-w-xs text-sm text-gray-400">
              AI-powered customer support platform integrated into a business website.
            </p>

            <div className="mt-5 flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          <div className="flex gap-16 text-sm">
            <div>
              <p className="mb-3 font-semibold text-gray-300">Product</p>

              <div className="flex flex-col gap-2 text-gray-400">
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>

                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing
                </a>

                <button
                  onClick={() => navigate("/demo-chat")}
                  className="text-left hover:text-white transition-colors"
                >
                  Demo Chat
                </button>
              </div>
            </div>

            <div>
              <p className="mb-3 font-semibold text-gray-300">Company</p>

              <div className="flex flex-col gap-2 text-gray-400">
                <a href="#about" className="hover:text-white transition-colors">
                  About
                </a>

                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>

                <button
                  onClick={() => navigate("/admin-login")}
                  className="text-left hover:text-white transition-colors"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-gray-700 pt-6 text-xs text-gray-500">
          © 2026 ClariBot. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Helper components

function BusinessCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
        {icon}
      </div>

      <h3 className="mb-2 font-bold">{title}</h3>

      <p className="text-sm leading-relaxed text-gray-500">{text}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
        {icon}
      </div>

      <h3 className="mb-2 font-bold">{title}</h3>

      <p className="text-sm leading-relaxed text-gray-500">{text}</p>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
      <p className="mb-4 text-4xl font-black text-pink-200">{number}</p>

      <h3 className="mb-2 font-bold">{title}</h3>

      <p className="text-sm leading-relaxed text-gray-500">{text}</p>
    </div>
  );
}

function InfoBox({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
        {icon}
      </div>

      <h3 className="mb-2 font-bold">{title}</h3>

      <p className="text-sm leading-relaxed text-gray-500">{text}</p>
    </div>
  );
}

function Plan({
  name,
  price,
  description,
  highlighted,
  onSignUp,
}: {
  name: string;
  price: string;
  description: string;
  highlighted?: boolean;
  onSignUp: () => void;
}) {
  return (
    <div
      className={`rounded-2xl p-8 text-left shadow-xl ${
        highlighted
          ? "bg-gradient-to-br from-orange-400 to-pink-500 text-white"
          : "bg-white"
      }`}
    >
      {highlighted && (
        <div className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold">{name}</h3>

      <p className={`mt-2 text-sm ${highlighted ? "text-white/80" : "text-gray-500"}`}>
        {description}
      </p>

      <p className="my-5 text-5xl font-black">
        {price}
        <span className="text-base font-normal">/mo</span>
      </p>

      <button
        onClick={onSignUp}
        className={`mb-6 rounded-lg px-6 py-3 font-semibold transition-opacity hover:opacity-90 ${
          highlighted ? "bg-white text-pink-500" : "bg-pink-500 text-white"
        }`}
      >
        {price === "$0" ? "Start Free" : "Sign Up Now"}
      </button>

      <ul className="space-y-3 text-sm">
        {price === "$0" && (
          <>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              1,000 monthly conversations
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Basic AI response system
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Lead capture form
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Standard reporting
            </li>
          </>
        )}

        {price === "$99" && (
          <>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              20,000 monthly conversations
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Advanced AI + human handoff
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Admin analytics dashboard
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Conversation history
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Priority support
            </li>
          </>
        )}

        {price === "$299" && (
          <>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Unlimited conversations
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Custom AI training
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              Unlimited integrations
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              SLA + dedicated support
            </li>
            <li>
              <CheckCircle size={16} className="mr-2 inline" />
              White-label option
            </li>
          </>
        )}
      </ul>
    </div>
  );
}