"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const params = useSearchParams();

  const client_id = params.get("client_id") || "";
  const redirect_uri = params.get("redirect_uri") || "";
  const state = params.get("state") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/auth/login", {
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
      }),
      redirect: "follow",
    });

    // backend redirects automatically
    if (response.redirected) {
      window.location.href = response.url;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="border p-6 rounded-xl w-[350px] space-y-4"
      >
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          className="border p-2 w-full rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-black text-white p-2 rounded w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
}