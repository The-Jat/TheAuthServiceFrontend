"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const params = useSearchParams();

  useEffect(() => {
    async function exchangeCode() {
      const code = params.get("code");

      if (!code) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/auth/token`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            code,

            client_id: "botble123",

            client_secret: "secret123",

            redirect_uri:
              "http://localhost:3001/callback",
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh_token
      );

      window.location.href = "/dashboard";
    }

    exchangeCode();
  }, []);

  return <div>Logging in...</div>;
}