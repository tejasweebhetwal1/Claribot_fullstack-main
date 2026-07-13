import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Crown,
  CheckCircle,
  KeyRound,
  ShoppingCart,
  Store,
  PackageCheck,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { api, saveSession } from "../lib/api";

type Mode = "login" | "signup";
type LoginType = "customer" | "admin";
type SignupStep = "details" | "otp";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const forcedType = searchParams.get("type");
  const forcedMode = searchParams.get("mode");
  const isCustomerOnly = forcedType === "customer";

  const [mode, setMode] = useState<Mode>(
    forcedMode === "signup" ? "signup" : "login"
  );

  const [loginType, setLoginType] = useState<LoginType>(
    forcedType === "admin" ? "admin" : "customer"
  );

  const [signupStep, setSignupStep] = useState<SignupStep>("details");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function resetFormMessages() {
    setError("");
    setSuccess("");
  }

  function validateSignupDetails() {
    if (!name.trim()) return "Full name is required.";
    if (!email.trim()) return "Email address is required.";
    if (!isValidEmail(email)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) {
      return "Password and confirm password do not match.";
    }
    return "";
  }

  function validateOtpStep() {
    if (!otpSent) return "Please send OTP first.";
    if (!otp.trim()) return "Please enter the 6-digit OTP.";
    if (otp.trim().length !== 6) return "OTP must be 6 digits.";
    return "";
  }

  async function handleSendOtp() {
    setError("");
    setSuccess("");

    const validationError = validateSignupDetails();
    if (validationError) {
      setError(validationError);
      return;
    }

    setOtpLoading(true);

    try {
      await api.requestOtp(email.trim().toLowerCase());
      setOtpSent(true);
      setOtp("");
      setSignupStep("otp");
      setSuccess("OTP sent successfully. Please check your email inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (loginType === "customer" && mode === "signup") {
      if (signupStep === "details") {
        await handleSendOtp();
        return;
      }

      const otpError = validateOtpStep();
      if (otpError) {
        setError(otpError);
        return;
      }
    }

    setLoading(true);

    try {
      if (loginType === "admin") {
        const res = await fetch("http://localhost:4000/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || data.message || "Invalid admin login");
        }

        saveSession(data.token, data.user);
        navigate("/admin-dashboard");
        return;
      }

      const session =
        mode === "signup"
          ? await api.signup(
              name.trim(),
              email.trim().toLowerCase(),
              password,
              otp.trim()
            )
          : await api.login(email.trim().toLowerCase(), password);

      saveSession(session.token, session.user);
      navigate("/shop");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function switchToCustomer() {
    setLoginType("customer");
    setMode("login");
    setSignupStep("details");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpSent(false);
    resetFormMessages();
  }

  function switchToAdmin() {
    setLoginType("admin");
    setMode("login");
    setSignupStep("details");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpSent(false);
    resetFormMessages();
  }

  function toggleMode() {
    setMode(mode === "login" ? "signup" : "login");
    setSignupStep("details");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpSent(false);
    resetFormMessages();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7fbff]">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />

      <div className="relative z-10 bg-[#09a9e8] px-6 py-3 text-center text-sm font-bold text-white">
        Free delivery over $50 | Secure ClariMart customer account
      </div>

      <div className="relative z-10 flex items-center justify-between border-b border-slate-100 bg-white/85 px-6 py-5 backdrop-blur-xl lg:px-20">
        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#09a9e8] shadow-lg">
            <Store size={25} color="#fff" />
          </div>

          <div className="text-left">
            <h1 className="text-2xl font-black text-[#0b1230]">ClariMart</h1>
            <p className="text-xs font-medium text-slate-500">
              Mediterranean Grocery Store
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="hidden rounded-full bg-[#09a9e8] px-5 py-3 text-sm font-black text-white shadow-lg md:block"
        >
          Back to Shop
        </button>
      </div>

      <div className="relative z-10 grid min-h-[calc(100vh-120px)] lg:grid-cols-2">
        <div className="hidden flex-col justify-center p-12 lg:flex xl:p-20">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#09a9e8] shadow">
              <ShieldCheck size={16} />
              Secure customer account
            </div>

            <h2 className="mb-6 text-6xl font-black leading-tight text-[#0b1230]">
              Continue{" "}
              <span className="bg-gradient-to-r from-[#09a9e8] to-[#1f7df2] bg-clip-text text-transparent">
                shopping smarter
              </span>
            </h2>

            <p className="mb-8 text-lg leading-8 text-slate-600">
              Create a ClariMart account to continue shopping, add products to
              your cart, manage orders, and use ClariBot support for product
              prices, stock, delivery and refund questions.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-3xl bg-white p-5 shadow">
                <ShoppingCart className="mb-3 text-[#09a9e8]" size={26} />
                <p className="font-black text-[#0b1230]">Shop</p>
                <p className="text-xs text-slate-500">Browse products</p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow">
                <KeyRound className="mb-3 text-[#09a9e8]" size={26} />
                <p className="font-black text-[#0b1230]">OTP</p>
                <p className="text-xs text-slate-500">Email verification</p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow">
                <Truck className="mb-3 text-[#09a9e8]" size={26} />
                <p className="font-black text-[#0b1230]">Delivery</p>
                <p className="text-xs text-slate-500">Order support</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white p-6 shadow">
              <p className="mb-4 flex items-center gap-2 text-base font-black text-[#0b1230]">
                <CheckCircle size={18} className="text-green-500" />
                Account features
              </p>

              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Customer signup with email OTP verification</li>
                <li>• OTP appears as a separate second step</li>
                <li>• Continue shopping after login or signup</li>
                <li>• Chatbot support for product details and delivery</li>
                <li>• Admin access for store management</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md rounded-[2rem] border border-white bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#09a9e8] shadow-lg">
                {loginType === "admin" ? (
                  <Crown size={28} color="#fff" />
                ) : mode === "signup" && signupStep === "otp" ? (
                  <KeyRound size={28} color="#fff" />
                ) : (
                  <User size={28} color="#fff" />
                )}
              </div>

              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-[#09a9e8]">
                <ShieldCheck size={13} />
                {loginType === "admin"
                  ? "Admin Access"
                  : mode === "signup" && signupStep === "otp"
                  ? "Email Verification"
                  : "Customer Access"}
              </p>

              <h1 className="text-3xl font-black text-[#0b1230]">
                {loginType === "admin"
                  ? "Admin Login"
                  : mode === "signup" && signupStep === "otp"
                  ? "Enter Verification Code"
                  : mode === "signup"
                  ? "Create ClariMart Account"
                  : "Customer Login"}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {loginType === "admin"
                  ? "Login to manage ClariMart products, users and support."
                  : mode === "signup" && signupStep === "otp"
                  ? `We sent a 6-digit OTP to ${email || "your email"}.`
                  : mode === "signup"
                  ? "Enter your details first. OTP verification comes next."
                  : "Sign in to continue shopping."}
              </p>
            </div>

            {!isCustomerOnly && signupStep === "details" && (
              <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-sky-50 p-2">
                <button
                  type="button"
                  onClick={switchToCustomer}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition-all ${
                    loginType === "customer"
                      ? "bg-white text-[#09a9e8] shadow"
                      : "text-slate-500 hover:text-[#09a9e8]"
                  }`}
                >
                  <User size={16} />
                  Customer
                </button>

                <button
                  type="button"
                  onClick={switchToAdmin}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition-all ${
                    loginType === "admin"
                      ? "bg-white text-[#09a9e8] shadow"
                      : "text-slate-500 hover:text-[#09a9e8]"
                  }`}
                >
                  <Crown size={16} />
                  Admin
                </button>
              </div>
            )}

            {loginType === "customer" && signupStep === "details" && (
              <p className="mb-5 text-center text-sm text-slate-600">
                {mode === "login"
                  ? "Don’t have an account? "
                  : "Already have an account? "}

                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-black text-[#09a9e8] hover:underline"
                >
                  {mode === "login" ? "Create account" : "Sign in"}
                </button>
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {loginType === "customer" &&
                mode === "signup" &&
                signupStep === "details" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-[#0b1230]">
                      Full name
                    </label>

                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          resetFormMessages();
                        }}
                        placeholder="Enter your full name"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#09a9e8]"
                        required
                      />
                    </div>
                  </div>
                )}

              {signupStep === "details" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-[#0b1230]">
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setOtpSent(false);
                          setOtp("");
                          resetFormMessages();
                        }}
                        type="email"
                        placeholder={
                          loginType === "admin"
                            ? "admin@claribot.com"
                            : "you@example.com"
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#09a9e8]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-black text-[#0b1230]">
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setOtpSent(false);
                          setOtp("");
                          resetFormMessages();
                        }}
                        type={showPass ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm outline-none transition focus:border-[#09a9e8]"
                        required
                        minLength={loginType === "admin" ? 1 : 6}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#09a9e8]"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {loginType === "customer" && mode === "signup" && (
                      <p className="mt-1 text-xs text-slate-400">
                        Password must be at least 6 characters.
                      </p>
                    )}
                  </div>
                </>
              )}

              {loginType === "customer" &&
                mode === "signup" &&
                signupStep === "details" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-[#0b1230]">
                      Confirm password
                    </label>

                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setOtpSent(false);
                          setOtp("");
                          resetFormMessages();
                        }}
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Re-enter your password"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm outline-none transition focus:border-[#09a9e8]"
                        required
                        minLength={6}
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPass((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#09a9e8]"
                      >
                        {showConfirmPass ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

              {loginType === "customer" &&
                mode === "signup" &&
                signupStep === "otp" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-[#0b1230]">
                      Enter 6-digit OTP
                    </label>

                    <div className="relative">
                      <KeyRound
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ""));
                          resetFormMessages();
                        }}
                        placeholder="Enter code from email"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-center text-2xl font-black tracking-[0.4em] outline-none transition focus:border-[#09a9e8]"
                        maxLength={6}
                        inputMode="numeric"
                        autoFocus
                        required
                      />
                    </div>

                    <p className="mt-2 text-center text-xs text-slate-500">
                      Check your email inbox or spam folder for the verification
                      code.
                    </p>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSignupStep("details");
                          setOtp("");
                          resetFormMessages();
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-500 hover:text-[#09a9e8]"
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        className="flex-1 rounded-2xl bg-sky-100 px-4 py-3 text-sm font-black text-[#09a9e8] hover:bg-sky-200 disabled:opacity-60"
                      >
                        {otpLoading ? "Sending..." : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                )}

              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#09a9e8] py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] hover:bg-[#078fca] disabled:opacity-60"
              >
                {loading || otpLoading
                  ? "Please wait..."
                  : loginType === "admin"
                  ? "Login as Admin"
                  : mode === "signup" && signupStep === "details"
                  ? "Send OTP"
                  : mode === "signup" && signupStep === "otp"
                  ? "Create Verified Account"
                  : "Login as Customer"}

                <ArrowRight size={16} />
              </button>
            </form>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-6 flex w-full items-center justify-center gap-2 text-center text-sm font-black text-slate-500 hover:text-[#09a9e8]"
            >
              <PackageCheck size={16} />
              Back to Shop
            </button>

            {loginType === "admin" && (
              <p className="mt-4 text-center text-xs text-slate-400">
                 admin: admin@claribot.com / admin123
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}