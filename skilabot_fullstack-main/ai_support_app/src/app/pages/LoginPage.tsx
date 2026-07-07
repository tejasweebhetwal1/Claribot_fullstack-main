import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Bot,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  User,
  Crown,
  CheckCircle,
  KeyRound,
} from "lucide-react";
import { api, saveSession } from "../lib/api";

type Mode = "login" | "signup";
type LoginType = "customer" | "admin";

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

  function validateCustomerSignup() {
    if (!name.trim()) {
      return "Full name is required.";
    }

    if (!email.trim()) {
      return "Email address is required.";
    }

    if (!isValidEmail(email)) {
      return "Please enter a valid email address.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "Password and confirm password do not match.";
    }

    if (!otpSent) {
      return "Please click Send OTP before creating your account.";
    }

    if (!otp.trim()) {
      return "Please enter the 6-digit OTP.";
    }

    if (otp.trim().length !== 6) {
      return "OTP must be 6 digits.";
    }

    return "";
  }

  async function handleSendOtp() {
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Full name is required before sending OTP.");
      return;
    }

    if (!email.trim()) {
      setError("Email address is required before sending OTP.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters before sending OTP.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setOtpLoading(true);

    try {
      await api.requestOtp(email.trim().toLowerCase());
      setOtpSent(true);
      setOtp("");
      setSuccess("OTP generated successfully. For local demo, check the backend terminal.");
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
      const validationError = validateCustomerSignup();

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);

    try {
      if (loginType === "admin") {
        const res = await fetch("http://localhost:4000/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
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
      navigate("/chat");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function resetFormMessages() {
    setError("");
    setSuccess("");
  }

  function switchToCustomer() {
    setLoginType("customer");
    setMode("login");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpSent(false);
    resetFormMessages();
  }

  function switchToAdmin() {
    setLoginType("admin");
    setMode("login");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpSent(false);
    resetFormMessages();
  }

  function toggleMode() {
    setMode(mode === "login" ? "signup" : "login");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpSent(false);
    resetFormMessages();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff5f1]">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-orange-300/40 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-fit items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
              <Bot size={24} color="#fff" />
            </div>

            <span className="text-3xl font-black text-[#151525]">
              Clari<span className="text-pink-500">Bot</span>
            </span>
          </button>

          <div className="max-w-lg">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-pink-600 shadow">
              <Sparkles size={15} />
              OTP verified account registration
            </div>

            <h1 className="mb-6 text-6xl font-black leading-tight text-[#151525]">
              Secure access for <br />
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                customers & admins
              </span>
            </h1>

            <p className="mb-8 text-lg text-gray-600">
              Customers must verify their email using a 6-digit OTP before the
              account is created. This prevents users from registering with
              random or fake email addresses.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/80 p-5 shadow">
                <p className="text-2xl font-black text-pink-500">OTP</p>
                <p className="text-xs text-gray-500">Verification</p>
              </div>

              <div className="rounded-2xl bg-white/80 p-5 shadow">
                <p className="text-2xl font-black text-orange-400">AI</p>
                <p className="text-xs text-gray-500">Support</p>
              </div>

              <div className="rounded-2xl bg-white/80 p-5 shadow">
                <p className="text-2xl font-black text-purple-500">Admin</p>
                <p className="text-xs text-gray-500">Control</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white/70 p-5 shadow">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#151525]">
                <CheckCircle size={16} className="text-green-500" />
                Registration features
              </p>

              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Full name, email, password and confirm password</li>
                <li>• Password match validation</li>
                <li>• 6-digit OTP verification before account creation</li>
                <li>• Customer and admin access separation</li>
                <li>• Secure backend login and signup API connection</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-gray-400">© 2026 ClariBot.</p>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
                {loginType === "admin" ? (
                  <Crown size={28} color="#fff" />
                ) : (
                  <Bot size={28} color="#fff" />
                )}
              </div>

              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-600">
                <ShieldCheck size={13} />
                Secure Access
              </p>

              <h1 className="text-3xl font-black text-[#151525]">
                {loginType === "admin"
                  ? "Admin Login"
                  : mode === "signup"
                  ? "Create Customer Account"
                  : "Customer Login"}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {loginType === "admin"
                  ? "Login to manage ClariBot from the admin dashboard."
                  : mode === "signup"
                  ? "Verify your email with OTP before creating your account."
                  : "Sign in to continue using the chatbot."}
              </p>
            </div>

            {/* CUSTOMER / ADMIN SWITCH */}
            {!isCustomerOnly && (
              <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-[#fff5f1] p-2">
                <button
                  type="button"
                  onClick={switchToCustomer}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                    loginType === "customer"
                      ? "bg-white text-pink-600 shadow"
                      : "text-gray-500 hover:text-pink-500"
                  }`}
                >
                  <User size={16} />
                  Customer
                </button>

                <button
                  type="button"
                  onClick={switchToAdmin}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                    loginType === "admin"
                      ? "bg-white text-pink-600 shadow"
                      : "text-gray-500 hover:text-pink-500"
                  }`}
                >
                  <Crown size={16} />
                  Admin
                </button>
              </div>
            )}

            {/* LOGIN / SIGNUP SWITCH */}
            {loginType === "customer" && (
              <p className="mb-5 text-center text-sm text-gray-600">
                {mode === "login"
                  ? "Don’t have an account? "
                  : "Already have an account? "}

                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-bold text-pink-600 hover:underline"
                >
                  {mode === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* FULL NAME */}
              {loginType === "customer" && mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[#151525]">
                    Full name
                  </label>

                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        resetFormMessages();
                      }}
                      placeholder="Enter your full name"
                      className="w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-pink-400"
                      required
                    />
                  </div>
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#151525]">
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                    className="w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-pink-400"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#151525]">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                    className="w-full rounded-2xl border bg-white py-3 pl-11 pr-12 text-sm outline-none transition focus:border-pink-400"
                    required
                    minLength={loginType === "admin" ? 1 : 6}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {loginType === "customer" && mode === "signup" && (
                  <p className="mt-1 text-xs text-gray-400">
                    Password must be at least 6 characters.
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              {loginType === "customer" && mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[#151525]">
                    Confirm password
                  </label>

                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                      className="w-full rounded-2xl border bg-white py-3 pl-11 pr-12 text-sm outline-none transition focus:border-pink-400"
                      required
                      minLength={6}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPass((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500"
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP VERIFICATION */}
              {loginType === "customer" && mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[#151525]">
                    Email OTP verification
                  </label>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <KeyRound
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ""));
                          resetFormMessages();
                        }}
                        placeholder="6-digit OTP"
                        className="w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-pink-400"
                        maxLength={6}
                        inputMode="numeric"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="whitespace-nowrap rounded-2xl bg-[#7c3aed] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                    >
                      {otpLoading ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    Local demo: OTP appears in the backend terminal after clicking Send OTP.
                  </p>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {error && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    error.toLowerCase().includes("otp generated")
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {error}
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {success && (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : loginType === "admin"
                  ? "Login as Admin"
                  : mode === "signup"
                  ? "Create Verified Account"
                  : "Login as Customer"}

                <ArrowRight size={16} />
              </button>
            </form>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 w-full text-center text-sm font-semibold text-gray-500 hover:text-pink-500"
            >
              ← Back to Home
            </button>

            {loginType === "admin" && (
              <p className="mt-4 text-center text-xs text-gray-400">
                Demo admin: admin@claribot.com / admin123
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}