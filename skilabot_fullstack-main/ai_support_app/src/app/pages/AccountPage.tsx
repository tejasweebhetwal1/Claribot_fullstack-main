import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { getUser } from "../lib/api";

export default function AccountPage() {
  const user = getUser();

  if (!user) {
    return (
      <main className="min-h-[70vh] bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <UserRound className="mx-auto mb-4 text-purple-600" size={48} />

          <h1 className="text-3xl font-black text-slate-900">
            Please log in
          </h1>

          <p className="mt-3 text-slate-600">
            You need to log in before viewing your account details.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full bg-purple-600 px-6 py-3 font-bold text-white"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    user.name ||
    user.email?.split("@")[0] ||
    "Customer";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-[70vh] bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/shop"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-purple-700"
        >
          <ArrowLeft size={18} />
          Back to Shop
        </Link>

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="bg-gradient-to-r from-purple-600 to-violet-500 px-8 py-10 text-white">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-black text-purple-700">
                {initial}
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-purple-100">
                  Customer Account
                </p>

                <h1 className="mt-1 text-4xl font-black">
                  {displayName}
                </h1>

                <p className="mt-2 text-purple-100">
                  Welcome to your ClariMart account.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-8 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <UserRound className="text-purple-600" size={22} />

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Full Name
                  </p>

                  <p className="text-lg font-bold text-slate-900">
                    {user.name || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <Mail className="text-purple-600" size={22} />

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Email Address
                  </p>

                  <p className="break-all text-lg font-bold text-slate-900">
                    {user.email || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 md:col-span-2">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-600" size={22} />

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Account Status
                  </p>

                  <p className="text-lg font-bold text-green-700">
                    Verified and logged in
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 px-8 py-6">
            <Link
              to="/shop"
              className="inline-flex rounded-full bg-sky-500 px-6 py-3 font-bold text-white"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}