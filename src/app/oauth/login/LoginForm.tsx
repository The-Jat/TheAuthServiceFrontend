"use client";

import { useState } from "react";

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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    console.log(client_id);
    console.log(redirect_uri);
    console.log(state);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/auth/login`,
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
      }
    );

    const data = await response.json();
    console.log(data);

    window.location.href = data.redirect_to;
    // alert(JSON.stringify(data));
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