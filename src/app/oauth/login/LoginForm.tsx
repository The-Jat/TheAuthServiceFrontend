"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent,

  ) {
    e.preventDefault();

    console.log(client_id);
    console.log(redirect_uri);
    console.log(state);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_OAUTH_BASE_URL}${process.env.NEXT_PUBLIC_OAUTH_LOGIN_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
          client_id,
          redirect_uri,
          state,
          code_challenge,
          code_challenge_method,
        }),
      },
    );

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      setError(data.message || "Login failed",);

      return;
    }

    if (!data.redirect_to) {
      setError("Invalid redirect URL",);

      return;
    }

    setError("");

    window.location.href = data.redirect_to;
  }

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-4
        bg-gradient-to-br
        from-slate-100
        via-white
        to-slate-200
        relative
        overflow-hidden
      "
    >
      {/* background blur circles */}
      <div
        className="
          absolute
          top-[-120px]
          left-[-120px]
          h-[320px]
          w-[320px]
          rounded-full
          bg-blue-200/40
          blur-3xl
        "
      />

      <div
        className="
          absolute
          bottom-[-120px]
          right-[-120px]
          h-[320px]
          w-[320px]
          rounded-full
          bg-indigo-200/40
          blur-3xl
        "
      />

      <form
        onSubmit={handleLogin}
        className="
          relative
          z-10
          w-full
          max-w-md
          rounded-3xl
          border
          border-white/40
          bg-white/80
          backdrop-blur-xl
          shadow-2xl
          px-8
          py-10
          space-y-5
        "
      >
        <div className="space-y-1">
          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Welcome back
          </h1>

          <p
            className="
              text-sm
              text-slate-500
            "
          >
            Sign in to continue
          </p>
        </div>

        {error && (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
            "
          >
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              text-slate-900
              outline-none
              transition
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-100
              placeholder:text-slate-400
            "
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value,
              )
            }
          />

          <input
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              text-slate-900
              outline-none
              transition
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-100
              placeholder:text-slate-400
            "
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value,
              )
            }
          />
        </div>

        <button
          type="submit"
          className="
            w-full
            rounded-xl
            bg-slate-900
            text-white
            py-3
            text-sm
            font-medium
            transition
            hover:bg-slate-800
            active:scale-[0.99]
          "
        >
          Sign In
        </button>

        <div
          className="
            text-center
            text-sm
            text-slate-500
          "
        >
          Don&apos;t have an
          account?{" "}

          <Link
            href={
              process.env
                .NEXT_PUBLIC_OAUTH_SIGNUP_ENDPOINT ||
              "/oauth/signup"
            }
            className="
              font-medium
              text-slate-900
              hover:text-blue-600
              transition
            "
          >
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}