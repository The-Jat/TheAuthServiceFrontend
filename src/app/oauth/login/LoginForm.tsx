"use client";

import { useState } from "react";
import Link from "next/link";

type LoginStep =
  | "email"
  | "password";

export default function LoginForm({
  client_id,
  redirect_uri,
  state,
  code_challenge,
  code_challenge_method,
}: {
  client_id: string;
  redirect_uri: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
}) {
  const [step, setStep] =
    useState<LoginStep>("email");

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const [methods, setMethods] =
    useState<string[]>([]);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  async function discoverMethods() {
    setError("");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_OAUTH_BASE_URL}/auth/discover`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email,
        }),
      },
    );

    const data = await response.json();

    console.log(
      "Discovery response:",
      data,
    );

    if (!response.ok) {
      setError(
        data.message ||
        "Unable to discover authentication methods",
      );

      return;
    }

    const availableMethods =
      data.available_methods || [];

    setMethods(
      availableMethods,
    );

    if (
      availableMethods.length === 1
    ) {
      const method = availableMethods[0];

      setSelectedMethod(
        method,
      );

      if (method === "password") {
        setStep("password");
      }
      return;
    }

    setError(
      "No supported authentication methods available",
    );
  }

  async function authenticate() {
    if (!selectedMethod) {
      setError("Authentication method not selected",);
      return;
    }
    setError("");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_OAUTH_BASE_URL}${process.env.NEXT_PUBLIC_OAUTH_LOGIN_ENDPOINT}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          provider: selectedMethod,

          payload: {
            email,
            password,
          },

          client_id,
          redirect_uri,
          state,
          code_challenge,
          code_challenge_method,
        }),
      },
    );

    const data = await response.json();

    console.log(
      "Authentication response:",
      data,
    );

    if (!response.ok) {
      setError(
        data.message ||
        "Login failed",
      );

      return;
    }

    if (!data.redirect_to) {
      setError(
        "Invalid redirect URL",
      );

      return;
    }

    window.location.href =
      data.redirect_to;
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (step === "email") {
      await discoverMethods();
      return;
    }

    await authenticate();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-100 via-white to-slate-200 relative overflow-hidden">

      <div className="absolute top-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-blue-200/40 blur-3xl" />

      <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-indigo-200/40 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-2xl px-8 py-10 space-y-5"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>

          <p className="text-sm text-slate-500">
            Sign in to continue
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-3">

          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400"
            type="email"
            placeholder="Email address"
            value={email}
            disabled={
              step === "password"
            }
            onChange={(e) =>
              setEmail(
                e.target.value,
              )
            }
          />

          {step === "password" && (
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value,
                )
              }
            />
          )}

        </div>

        {methods.length > 0 && (
          <div className="text-xs text-slate-500">
            Available methods:{" "}
            {methods.join(", ")}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-medium transition hover:bg-slate-800 active:scale-[0.99]"
        >
          {step === "email"
            ? "Continue"
            : "Sign In"}
        </button>

        <div className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}

          <Link
            href={
              process.env
                .NEXT_PUBLIC_OAUTH_SIGNUP_ENDPOINT ||
              "/oauth/signup"
            }
            className="font-medium text-slate-900 hover:text-blue-600 transition"
          >
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}