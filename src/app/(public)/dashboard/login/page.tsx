"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_OAUTH_BASE_URL}/dashboard/login}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Login failed",
        );
      }

      // STORE TOKENS
      localStorage.setItem(
        "access_token",
        data.access_token,
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh_token,
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user),
      );

      // REDIRECT
      router.push("/dashboard/overview");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-white text-black">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              TheAuthService
            </h1>

            <p className="text-zinc-400 text-sm">
              Centralized Authentication Platform
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome Back
          </h2>

          <p className="text-zinc-400">
            Login to continue to your dashboard.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="block mb-2 text-sm text-zinc-300">
              Email
            </label>

            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value,
                )
              }
              className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 px-4 py-3 outline-none focus:border-white transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-zinc-300">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value,
                )
              }
              className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 px-4 py-3 outline-none focus:border-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white text-black py-3 font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/dashboard/signup"
            className="text-white hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}