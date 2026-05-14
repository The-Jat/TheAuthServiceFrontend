"use client";

import { useState } from "react";

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

      // OPTIONAL:
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
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSignup}
        className="border p-6 rounded-xl w-[350px] space-y-4"
      >
        <h1 className="text-2xl font-bold">
          Create Account
        </h1>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm">
            {success}
          </div>
        )}

        <input
          className="border p-2 w-full rounded"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          className="border p-2 w-full rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          className="border p-2 w-full rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-2 rounded w-full"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}