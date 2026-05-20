"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Starting signup...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_OAUTH_BASE_URL}${process.env.NEXT_PUBLIC_OAUTH_SIGNUP_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Signup response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Signup failed"
        );
      }

      setSuccess("Account created successfully");

      // redirect to login after signup

      setTimeout(() => {
        window.location.href = `${process.env.NEXT_PUBLIC_OAUTH_LOGIN_ENDPOINT}`;
      }, 1500);

    } catch (err: any) {
      console.error("Signup error:", err);

      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      from-zinc-100
      via-white
      to-zinc-200
      relative
      overflow-hidden
    "
    >
      {/* background blur circles */}
      <div
        className="
        absolute
        top-[-150px]
        left-[-150px]
        h-[400px]
        w-[400px]
        rounded-full
        bg-blue-200
        blur-3xl
        opacity-40
      "
      />

      <div
        className="
        absolute
        bottom-[-150px]
        right-[-150px]
        h-[400px]
        w-[400px]
        rounded-full
        bg-purple-200
        blur-3xl
        opacity-40
      "
      />

      <form
        onSubmit={handleSignup}
        className="
        relative
        z-10
        w-full
        max-w-md
        rounded-3xl
        bg-white/80
        backdrop-blur-xl
        border
        border-white/30
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
            text-zinc-900
          "
          >
            Create Account
          </h1>

          <p className="text-sm text-zinc-500">
            Continue to The Auth Service
          </p>
        </div>

        {error && (
          <div
            className="
            text-sm
            text-red-600
            border
            border-red-200
            bg-red-50
            rounded-xl
            px-3
            py-2
          "
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="
            text-sm
            text-green-700
            border
            border-green-200
            bg-green-50
            rounded-xl
            px-3
            py-2
          "
          >
            {success}
          </div>
        )}

        <div className="space-y-3">
          <input
            className="
            w-full
            rounded-xl
            border
            border-zinc-300
            bg-white
            px-4
            py-3
            text-sm
            text-black
            outline-none
            transition
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-100
            placeholder:text-zinc-400
          "
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            className="
            w-full
            rounded-xl
            border
            border-zinc-300
            bg-white
            px-4
            py-3
            text-sm
            text-black
            outline-none
            transition
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-100
            placeholder:text-zinc-400
          "
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            className="
            w-full
            rounded-xl
            border
            border-zinc-300
            bg-white
            px-4
            py-3
            text-sm
            text-black
            outline-none
            transition
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-100
            placeholder:text-zinc-400
          "
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
          w-full
          rounded-xl
          bg-black
          text-white
          py-3
          text-sm
          font-medium
          transition
          hover:opacity-90
          disabled:opacity-50
        "
        >
          {loading
            ? "Creating..."
            : "Sign Up"}
        </button>

        <div
          className="
          text-center
          text-sm
          text-zinc-500
        "
        >
          Already have an account?{" "}

          <Link
            href={
              process.env
                .NEXT_PUBLIC_OAUTH_LOGIN_ENDPOINT ||
              "/oauth/login"
            }
            className="
            font-medium
            text-black
            hover:text-blue-600
            transition
          "
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}