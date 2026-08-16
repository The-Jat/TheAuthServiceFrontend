// app/oauth/callback/page.tsx

"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function CallbackHandler() {
  const params = useSearchParams();

  useEffect(() => {
    async function exchangeCode() {
      const code = params.get("code");

      console.log(`code: ${code}`);

      if (!code) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_OAUTH_BASE_URL}/oauth/token`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            code,
            client_id: "botble123",
            client_secret: "secret123",
            code_verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
            redirect_uri:
              "http://localhost:3001/oauth/callback",
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

      // window.location.href = "/dashboard";
    }

    exchangeCode();
  }, [params]);

  return <div>Logging in...</div>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}