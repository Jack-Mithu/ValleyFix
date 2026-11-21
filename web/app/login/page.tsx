"use client";
import Link from "next/link";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { homePathForRole } from "@/app/lib/session";
import Logo from "@/app/components/Logo";
import ValleyScene from "@/app/components/ValleyScene";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  setLoading(true);
  setError("");

  try {
    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    // Call our own Next.js route (same origin), NOT the backend directly.
    // That route talks to NestJS and stores the token in an httpOnly cookie,
    // so browser JavaScript never sees the token.
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(
        typeof data.message === "string"
          ? data.message
          : "Unable to sign in. Please check your credentials.",
      );
      return;
    }

    const homePath = homePathForRole(data.user?.role ?? "");

    if (!homePath) {
      setError("Your account has an unrecognised role.");
      return;
    }

    // Go back to where they were heading (e.g. /book), but only to a page on
    // THIS site: "//evil.com", "/\evil.com" or "https://..." would be an open redirect.
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext = next && /^\/(?![/\\])/.test(next) ? next : null;

    router.push(safeNext ?? homePath);
    router.refresh();
  } catch {
    setError("Unable to connect to ValleyFix. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left side */}
        <div className="relative isolate hidden overflow-hidden bg-gradient-to-b from-oxford-950 via-oxford-900 to-oxford-700 lg:flex">
          <ValleyScene showRoad={false} sun={{ x: 1100, y: 620 }} />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <Logo tone="dark" size="lg" />

            {/* Message */}
            <div className="max-w-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
                <LockKeyhole
                  size={27}
                  className="text-gold-400"
                />
              </div>

              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Welcome back.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-400">
                Sign in to manage your bookings, view service updates and
                keep everything in one place.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Manage your upcoming bookings",
                  "View quotes and service updates",
                  "Keep your account details organised",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-slate-300"
                  >
                    <CheckCircle2
                      size={19}
                      className="text-gold-400"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-oxford-200">
              ValleyFix · Local home services
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-10 flex items-center justify-center gap-2 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oxford-900 font-bold text-gold-400">
                V
              </div>

              <span className="text-2xl font-bold text-oxford-900">
                Valley<span className="text-marigold-600">Fix</span>
              </span>
            </Link>

            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-oxford-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Sign in to continue to your ValleyFix account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-oxford-900 outline-none transition-all placeholder:text-slate-400 focus:border-oxford-600 focus:ring-4 focus:ring-oxford-600/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    href="#"
                    className="text-xs font-semibold text-oxford-900 hover:text-oxford-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-oxford-900 outline-none transition-all placeholder:text-slate-400 focus:border-oxford-600 focus:ring-4 focus:ring-oxford-600/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-oxford-900 focus:ring-oxford-600"
                />
                Remember me
              </label>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-oxford-900 text-sm font-bold text-white shadow-lg shadow-oxford-900/20 transition-colors hover:bg-oxford-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}

                {!loading && <ArrowRight size={18} />}
              </motion.button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs text-slate-400">
                New to ValleyFix?
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              href="/register"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all hover:border-oxford-200 hover:bg-oxford-50 hover:text-oxford-900"
            >
              Create an account
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}